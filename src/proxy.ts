import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const hostClean = hostname.split(':')[0]

  // Root domains
  const rootDomains = [
    'localhost',
    'neighborly.ng',
    'www.neighborly.ng',
    'neighborly-gamma.vercel.app',
    'neighborly-zeta.vercel.app'
  ]

  const isRootDomain = rootDomains.some(d => hostClean === d)

  // Assets and public endpoints
  const isAsset =
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')

  // If accessed via custom subdomain e.g. banana-island.neighborly.ng or banana-island.localhost
  if (!isRootDomain && !isAsset && !url.pathname.startsWith('/c/')) {
    const parts = hostClean.split('.')
    const subdomain = parts[0]
    if (subdomain && subdomain !== 'www') {
      // Map to /c/[subdomain]
      url.pathname = `/c/${subdomain}${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
