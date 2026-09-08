-- Neighborly Multi-Tenant Platform Database Schema
-- Version 2.0 (Relational Multi-Tenant Architecture)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Communities Table (Tenants)
CREATE TABLE IF NOT EXISTS public.communities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    logo text,
    cover_image text,
    location text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    country text NOT NULL DEFAULT 'Nigeria',
    community_type text NOT NULL DEFAULT 'Gated Estate',
    status text NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'pending'
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Memberships Table (User to Community Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS public.memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'RESIDENT', -- 'SUPER_ADMIN', 'COMMUNITY_ADMIN', 'RESIDENT'
    status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'
    house_number text NOT NULL,
    block text NOT NULL,
    resident_type text NOT NULL DEFAULT 'Tenant', -- 'Owner', 'Tenant', 'Family Member', 'Other'
    verification_status text NOT NULL DEFAULT 'unverified',
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT unique_user_community UNIQUE(user_id, community_id)
);

-- 4. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    images jsonb DEFAULT '[]'::jsonb,
    is_official boolean NOT NULL DEFAULT false,
    likes_count integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 6. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL DEFAULT 'General', -- 'General', 'Security', 'Maintenance', 'Emergency', 'Utilities', 'Finance'
    priority text NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 7. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    date text NOT NULL,
    location text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 8. Marketplace Items Table
CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    price numeric NOT NULL,
    images jsonb DEFAULT '[]'::jsonb,
    status text NOT NULL DEFAULT 'available', -- 'available', 'sold'
    created_at timestamp with time zone DEFAULT now()
);

-- 9. Service Providers Table
CREATE TABLE IF NOT EXISTS public.service_providers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text NOT NULL, -- 'Plumber', 'Electrician', 'Cleaner', 'Gardener', etc.
    rating numeric NOT NULL DEFAULT 5.0,
    description text NOT NULL,
    phone text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance and isolation
CREATE INDEX IF NOT EXISTS idx_memberships_comm ON public.memberships(community_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_comm ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS idx_announcements_comm ON public.announcements(community_id);
CREATE INDEX IF NOT EXISTS idx_events_comm ON public.events(community_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_comm ON public.marketplace_items(community_id);
CREATE INDEX IF NOT EXISTS idx_services_comm ON public.service_providers(community_id);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
