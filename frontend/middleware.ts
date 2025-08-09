import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (
    req.nextUrl.pathname.startsWith('/app') ||
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/game')
  ) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/signin'
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  if (req.nextUrl.pathname.startsWith('/signin') || req.nextUrl.pathname === '/') {
    if (session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/game'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth).*)'],
}
