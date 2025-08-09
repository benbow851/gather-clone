import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/game'

  console.log('OAuth callback received:', { code: !!code, next })

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(
          `${requestUrl.origin}/signin?error=auth_callback_error&message=${encodeURIComponent(
            error.message,
          )}`,
        )
      }

      console.log('OAuth success, redirecting to:', next)
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/signin?error=server_error`,
      )
    }
  }

  console.log('No code parameter found')
  return NextResponse.redirect(`${requestUrl.origin}/signin?error=no_code`)
}
