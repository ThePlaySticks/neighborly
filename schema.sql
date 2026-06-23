-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Super Admin Settings Table (Singleton pattern)
CREATE TABLE IF NOT EXISTS public.super_admin_settings (
    id text PRIMARY KEY DEFAULT 'config',
    yearly_subscription_fee numeric NOT NULL DEFAULT 150000.00, -- Default annual subscription (NGN)
    markup_percent numeric NOT NULL DEFAULT 1.5, -- Default transaction markup percent (1.5%)
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT singleton_row CHECK (id = 'config')
);

-- Insert default configurations if not exists
INSERT INTO public.super_admin_settings (id, yearly_subscription_fee, markup_percent)
VALUES ('config', 150000.00, 1.5)
ON CONFLICT (id) DO NOTHING;

-- 2. Estates Table (Tenants)
CREATE TABLE IF NOT EXISTS public.estates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    subdomain text UNIQUE NOT NULL,
    admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    subscription_status text NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'unpaid'
    subscription_expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '1 year'),
    yearly_fee numeric, -- Custom fee overrides if set, otherwise defaults to super_admin_settings
    markup_percent numeric, -- Custom markup overrides if set, otherwise defaults to super_admin_settings
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Profiles Table (Link to Estates and Roles)
-- Note: Assuming public.profiles already exists; we add column if it doesn't.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='estate_id') THEN
        ALTER TABLE public.profiles ADD COLUMN estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'resident';
    END IF;
END $$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_settings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Super Admin Settings Policies
CREATE POLICY "Super Admins can do everything on settings" 
ON public.super_admin_settings 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
);

CREATE POLICY "Anyone can read settings" 
ON public.super_admin_settings 
FOR SELECT 
USING (true);

-- Estates Policies
CREATE POLICY "Super Admins can do everything on estates" 
ON public.estates 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
);

CREATE POLICY "Estate admins can view and update their own estate" 
ON public.estates 
FOR ALL 
USING (admin_id = auth.uid())
WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Authenticated users can insert an estate" 
ON public.estates 
FOR INSERT 
TO authenticated 
WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Residents can view their own estate" 
ON public.estates 
FOR SELECT 
USING (
    id = (
        SELECT estate_id FROM public.profiles 
        WHERE profiles.id = auth.uid()
    )
);

-- 6. Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, estate_id)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'resident'),
    (new.raw_user_meta_data->>'estate_id')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Tenant Branding Table
CREATE TABLE IF NOT EXISTS public.tenant_branding (
    id uuid PRIMARY KEY REFERENCES public.estates(id) ON DELETE CASCADE,
    logo_url text,
    primary_color text NOT NULL DEFAULT '#10b981', -- default green-500
    secondary_color text NOT NULL DEFAULT '#06b6d4', -- default cyan-500
    welcome_message text DEFAULT 'Welcome to our community portal',
    banner_url text,
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on branding
ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read estate branding" 
ON public.tenant_branding FOR SELECT USING (true);

CREATE POLICY "Estate admins can modify their branding" 
ON public.tenant_branding FOR ALL 
USING (
    id IN (
        SELECT id FROM public.estates WHERE admin_id = auth.uid()
    )
);

-- 8. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Residents can view announcements from their estate" 
ON public.announcements FOR SELECT 
USING (
    estate_id = (
        SELECT estate_id FROM public.profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Estate admins can manage announcements" 
ON public.announcements FOR ALL 
USING (
    estate_id IN (
        SELECT id FROM public.estates WHERE admin_id = auth.uid()
    )
);

-- 9. Marketplace Items Table
CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    price numeric NOT NULL,
    owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on marketplace items
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Residents can view marketplace items in their estate" 
ON public.marketplace_items FOR SELECT 
USING (
    estate_id = (
        SELECT estate_id FROM public.profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Residents can manage their own marketplace items" 
ON public.marketplace_items FOR ALL 
USING (
    owner_id = auth.uid() AND 
    estate_id = (
        SELECT estate_id FROM public.profiles WHERE id = auth.uid()
    )
);

