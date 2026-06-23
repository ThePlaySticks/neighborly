import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 1. Refresh session using Supabase middleware
  const supabaseResponse = await updateSession(request)

  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Define root domains (local and production)
  const rootDomains = ['localhost:3000', 'neighborly.ng', 'www.neighborly.ng', 'neighborly-gamma.vercel.app', 'neighborly-zeta.vercel.app']
  
  // Clean hostname (remove port if any)
  const hostClean = hostname.split(':')[0]
  
  // Check if it's a root domain
  const isRootDomain = rootDomains.some(domain => {
    const domainClean = domain.split(':')[0]
    return hostClean === domainClean
  })

  // Exclude static assets and auth paths from rewriting
  const isAsset = url.pathname.startsWith('/_next') || 
                  url.pathname.startsWith('/api') || 
                  url.pathname.includes('.')

  const isAuth = url.pathname.startsWith('/login') || 
                 url.pathname.startsWith('/signup') || 
                 url.pathname.startsWith('/forgot-password') || 
                 url.pathname.startsWith('/reset-password')

  if (!isRootDomain && !isAsset && !isAuth) {
    const parts = hostClean.split('.')
    // E.g. lekki.localhost or lekki.neighborly.ng
    const subdomain = parts[0]
    
    if (subdomain && subdomain !== 'www') {
      // 2. RBAC check for subdomain admin route
      if (url.pathname.startsWith('/admin')) {
        const { createServerClient } = await import('@supabase/ssr')
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() { return request.cookies.getAll() },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              },
            },
          }
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return NextResponse.redirect(new URL('/login', request.url))
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, estate_id, estates(subdomain)')
          .eq('id', user.id)
          .single()

        const userProfile = profile as any
        if (
          !userProfile || 
          userProfile.role !== 'estate_admin' || 
          userProfile.estates?.subdomain !== subdomain
        ) {
          return NextResponse.redirect(new URL('/', request.url))
        }
      }

      // Rewrite the URL to the dynamic route /estates/[site]/...
      url.pathname = `/estates/${subdomain}${url.pathname}`
      
      const rewriteResponse = NextResponse.rewrite(url)
      
      // Sync cookies from supabaseResponse
      supabaseResponse.cookies.getAll().forEach(cookie => {
        rewriteResponse.cookies.set(cookie.name, cookie.value)
      })
      
      return rewriteResponse
    }
  }

  // 3. RBAC check for global super-admin route
  if (url.pathname.startsWith('/super-admin')) {
    const { createServerClient } = await import('@supabase/ssr')
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
