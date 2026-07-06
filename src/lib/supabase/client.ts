import { createBrowserClient } from '@supabase/ssr'

// LocalStorage Mock client for offline/sandbox testing environments
const createMockClient = () => {
  const getStorageItem = (key: string, defaultVal: string) => {
    if (typeof window === 'undefined') return defaultVal;
    return localStorage.getItem(key) || defaultVal;
  };

  const setStorageItem = (key: string, val: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, val);
    }
  };

  return {
    auth: {
      getUser: async () => {
        const user = JSON.parse(getStorageItem('neighborly_mock_user', 'null'));
        return { data: { user }, error: null };
      },
      signUp: async ({ email, password, options }: any) => {
        const user = { 
          id: 'mock-user-id-' + Math.random().toString(36).substr(2, 9), 
          email, 
          raw_user_meta_data: options?.data || {} 
        };
        setStorageItem('neighborly_mock_user', JSON.stringify(user));
        
        // Populate profile
        const profiles = JSON.parse(getStorageItem('neighborly_mock_profiles', '[]'));
        profiles.push({
          id: user.id,
          full_name: user.raw_user_meta_data.full_name,
          role: user.raw_user_meta_data.role || 'resident',
          kyc_status: 'unuploaded',
          estate_id: user.raw_user_meta_data.estate_id || 'mock-estate-id'
        });
        setStorageItem('neighborly_mock_profiles', JSON.stringify(profiles));
        return { data: { user }, error: null };
      },
      signInWithPassword: async ({ email }: any) => {
        const profiles = JSON.parse(getStorageItem('neighborly_mock_profiles', '[]'));
        const matchedProfile = profiles.find((p: any) => p.email === email) || {
          id: 'mock-user-id',
          full_name: 'Jane Doe',
          role: 'estate_admin',
          kyc_status: 'approved',
          estate_id: 'mock-estate-id'
        };
        
        const user = { 
          id: matchedProfile.id, 
          email, 
          raw_user_meta_data: { 
            full_name: matchedProfile.full_name, 
            role: matchedProfile.role, 
            estate_id: matchedProfile.estate_id 
          } 
        };
        setStorageItem('neighborly_mock_user', JSON.stringify(user));
        return { data: { user }, error: null };
      },
      verifyOtp: async () => {
        return { error: null };
      },
      signOut: async () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('neighborly_mock_user');
        }
        return { error: null };
      }
    },
    from: (table: string) => {
      return {
        select: (fields: string = '*') => {
          let data: any[] = [];
          if (table === 'estates') {
            data = JSON.parse(getStorageItem('neighborly_mock_estates', '[]'));
            if (data.length === 0) {
              data = [
                { 
                  id: 'mock-estate-id', 
                  name: 'Lekki Gardens', 
                  subdomain: 'lekki', 
                  subscription_status: 'active', 
                  subscription_expires_at: new Date(Date.now() + 31536000000).toISOString(), 
                  subscription_plan: 'starter' 
                }
              ];
              setStorageItem('neighborly_mock_estates', JSON.stringify(data));
            }
          } else if (table === 'profiles') {
            data = JSON.parse(getStorageItem('neighborly_mock_profiles', '[]'));
            if (data.length === 0) {
              data = [
                { 
                  id: 'mock-user-id', 
                  full_name: 'Jane Doe', 
                  role: 'estate_admin', 
                  kyc_status: 'approved', 
                  kyc_document_type: 'passport', 
                  kyc_document_url: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=80' 
                }
              ];
              setStorageItem('neighborly_mock_profiles', JSON.stringify(data));
            }
          } else if (table === 'tenant_branding') {
            data = [{ id: 'mock-estate-id', primary_color: '#2563eb', secondary_color: '#64748b', welcome_message: 'Welcome to our Lekki community portal' }];
          }

          const eqFilter = (field: string, val: any) => {
            const filtered = data.filter(item => item[field] === val);
            return {
              single: async () => ({ data: filtered[0] || null, error: null }),
              select: async () => ({ data: filtered, error: null }),
              then: (cb: any) => cb({ data: filtered, error: null })
            };
          };

          return {
            eq: eqFilter,
            single: async () => ({ data: data[0] || null, error: null }),
            select: async () => ({ data, error: null }),
            then: (cb: any) => cb({ data, error: null })
          };
        },
        insert: (record: any) => {
          if (table === 'estates') {
            const estates = JSON.parse(getStorageItem('neighborly_mock_estates', '[]'));
            const newEstate = { 
              id: 'mock-estate-id-' + Math.random().toString(36).substr(2, 9), 
              ...record, 
              subscription_status: 'active', 
              subscription_expires_at: new Date(Date.now() + 31536000000).toISOString() 
            };
            estates.push(newEstate);
            setStorageItem('neighborly_mock_estates', JSON.stringify(estates));
            return {
              select: () => ({
                single: async () => ({ data: newEstate, error: null })
              })
            };
          }
          return {
            select: () => ({
              single: async () => ({ data: record, error: null })
            })
          };
        },
        update: (record: any) => {
          return {
            eq: (field: string, val: any) => {
              if (table === 'profiles') {
                const profiles = JSON.parse(getStorageItem('neighborly_mock_profiles', '[]'));
                const updated = profiles.map((p: any) => p[field] === val ? { ...p, ...record } : p);
                setStorageItem('neighborly_mock_profiles', JSON.stringify(updated));
              }
              return {
                eq: () => ({ error: null })
              };
            }
          };
        },
        upsert: (record: any) => {
          return { error: null };
        }
      };
    }
  };
};

export function createClient() {
  if (typeof window !== 'undefined' && localStorage.getItem('neighborly_offline') === 'true') {
    return createMockClient() as any;
  }

  // Fallback to real Supabase client
  try {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } catch (e) {
    // If browser cannot load keys, fallback directly to mock client
    return createMockClient() as any;
  }
}
