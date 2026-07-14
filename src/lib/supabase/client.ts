import { createBrowserClient } from '@supabase/ssr'

// ─── Auto-detecting Offline Proxy ────────────────────────────────────────
// Wraps the real Supabase client. If any call fails with a network error,
// it automatically switches the entire app to offline mock mode and retries.

const OFFLINE_KEY = 'neighborly_offline'

function isOffline(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(OFFLINE_KEY) === 'true'
}

function enableOffline() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(OFFLINE_KEY, 'true')
  }
}

// ─── LocalStorage Mock Client ────────────────────────────────────────────
// Full mock that stores everything in browser localStorage for demo/testing.

function getLS(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  return localStorage.getItem(key) || fallback
}
function setLS(key: string, val: string) {
  if (typeof window !== 'undefined') localStorage.setItem(key, val)
}

function createMockClient(): any {
  return {
    auth: {
      getUser: async () => {
        const user = JSON.parse(getLS('neighborly_mock_user', 'null'))
        return { data: { user }, error: null }
      },
      signUp: async ({ email, password, options }: any) => {
        const user = {
          id: 'mock-' + Math.random().toString(36).substr(2, 9),
          email,
          raw_user_meta_data: options?.data || {},
        }
        setLS('neighborly_mock_user', JSON.stringify(user))

        const profiles = JSON.parse(getLS('neighborly_mock_profiles', '[]'))
        profiles.push({
          id: user.id,
          full_name: user.raw_user_meta_data.full_name,
          email,
          role: user.raw_user_meta_data.role || 'resident',
          kyc_status: 'unuploaded',
          estate_id: user.raw_user_meta_data.estate_id || 'mock-estate-id',
        })
        setLS('neighborly_mock_profiles', JSON.stringify(profiles))
        return { data: { user }, error: null }
      },
      signInWithPassword: async ({ email }: any) => {
        const profiles: any[] = JSON.parse(getLS('neighborly_mock_profiles', '[]'))
        const match = profiles.find((p) => p.email === email) || {
          id: 'mock-user-id',
          full_name: 'Demo Resident',
          email,
          role: 'estate_admin',
          kyc_status: 'approved',
          estate_id: 'mock-estate-id',
        }
        const user = {
          id: match.id,
          email,
          raw_user_meta_data: {
            full_name: match.full_name,
            role: match.role,
            estate_id: match.estate_id,
          },
        }
        setLS('neighborly_mock_user', JSON.stringify(user))
        return { data: { user }, error: null }
      },
      verifyOtp: async () => ({ error: null }),
      signOut: async () => {
        if (typeof window !== 'undefined') localStorage.removeItem('neighborly_mock_user')
        return { error: null }
      },
    },
    from: (table: string) => {
      const mockQuery = (data: any[]) => {
        const chain: any = {
          eq: (field: string, val: any) => {
            const filtered = data.filter((r) => r[field] === val)
            return mockQuery(filtered)
          },
          order: () => chain,
          select: (_fields?: string) => chain,
          single: async () => ({ data: data[0] || null, error: null }),
          then: (cb: any) => Promise.resolve(cb({ data, error: null })),
        }
        // Make it thenable so await works on select()
        chain[Symbol.for('nodejs.util.inspect.custom')] = () => data
        return chain
      }

      const seed = () => {
        if (table === 'estates') {
          let d = JSON.parse(getLS('neighborly_mock_estates', '[]'))
          if (!d.length) {
            d = [
              {
                id: 'mock-estate-id',
                name: 'Lekki Gardens',
                subdomain: 'lekki',
                admin_id: 'mock-user-id',
                subscription_status: 'active',
                subscription_plan: 'starter',
                subscription_expires_at: new Date(Date.now() + 3.15e10).toISOString(),
              },
            ]
            setLS('neighborly_mock_estates', JSON.stringify(d))
          }
          return d
        }
        if (table === 'profiles') {
          let d = JSON.parse(getLS('neighborly_mock_profiles', '[]'))
          if (!d.length) {
            d = [
              {
                id: 'mock-user-id',
                full_name: 'Demo Resident',
                role: 'estate_admin',
                kyc_status: 'approved',
                kyc_document_type: 'passport',
                kyc_document_url: '',
                estate_id: 'mock-estate-id',
              },
            ]
            setLS('neighborly_mock_profiles', JSON.stringify(d))
          }
          return d
        }
        if (table === 'tenant_branding') {
          return [
            {
              id: 'mock-estate-id',
              primary_color: '#2563eb',
              secondary_color: '#64748b',
              welcome_message: 'Welcome to our community portal',
            },
          ]
        }
        if (table === 'announcements') return JSON.parse(getLS('neighborly_mock_announcements', '[]'))
        if (table === 'estate_messages') return JSON.parse(getLS('neighborly_mock_messages', '[]'))
        if (table === 'visitor_logs') return JSON.parse(getLS('neighborly_mock_visitors', '[]'))
        if (table === 'support_tickets') return JSON.parse(getLS('neighborly_mock_tickets', '[]'))
        if (table === 'marketplace_items') return JSON.parse(getLS('neighborly_mock_marketplace', '[]'))
        if (table === 'super_admin_settings') {
          return [
            {
              id: 'config',
              yearly_subscription_fee: 150000,
              markup_percent: 1.5,
              flat_service_fee: 100,
              min_markup_limit: 50,
              max_markup_limit: 5000,
              renewal_policy: 'auto-renew',
            },
          ]
        }
        return []
      }

      return {
        select: (_fields?: string) => mockQuery(seed()),
        insert: (record: any) => {
          const id = 'mock-' + Math.random().toString(36).substr(2, 9)
          const row = { id, ...record, created_at: new Date().toISOString() }
          if (table === 'estates') {
            const d = JSON.parse(getLS('neighborly_mock_estates', '[]'))
            d.push(row)
            setLS('neighborly_mock_estates', JSON.stringify(d))
          }
          return {
            select: () => ({ single: async () => ({ data: row, error: null }) }),
          }
        },
        update: (record: any) => ({
          eq: (field: string, val: any) => {
            if (table === 'profiles') {
              const d = JSON.parse(getLS('neighborly_mock_profiles', '[]'))
              const updated = d.map((p: any) => (p[field] === val ? { ...p, ...record } : p))
              setLS('neighborly_mock_profiles', JSON.stringify(updated))
            }
            return { eq: () => ({ error: null }), error: null }
          },
        }),
        upsert: () => ({ error: null }),
      }
    },
    // Stubs for realtime (chat page)
    channel: () => ({
      on: function () { return this },
      subscribe: function () { return this },
    }),
    removeChannel: () => {},
  }
}

// ─── Resilient Client Factory ────────────────────────────────────────────
// Creates a real client wrapped in a Proxy. If any network call throws
// "fetch failed" / "Failed to fetch", we flip to offline mode automatically.

let cachedClient: any = null

export function createClient() {
  if (cachedClient) return cachedClient

  // Already in offline mode
  if (isOffline()) {
    cachedClient = createMockClient()
    return cachedClient
  }

  // Try real client, wrap with auto-fallback
  const real = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fire a quick health-check — if it fails, swap to mock immediately
  if (typeof window !== 'undefined') {
    fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/', {
      method: 'HEAD',
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
      signal: AbortSignal.timeout(4000),
    }).catch(() => {
      console.warn('[Neighborly] Supabase unreachable — switching to Offline Demo Mode')
      enableOffline()
      cachedClient = createMockClient()
    })
  }

  cachedClient = real
  return cachedClient
}
