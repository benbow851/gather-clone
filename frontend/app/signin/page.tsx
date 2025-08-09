'use client'
import { createClient } from '@/utils/supabase/client'
import GoogleSignInButton from './GoogleSignInButton'

export const dynamic = 'force-dynamic'

export default function Login() {

    const signInWithGoogle = async () => {
        const supabase = createClient()
        const redirectTo = `${window.location.origin}/auth/callback`
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
            }
        })
    }

  return (
    <div className='flex flex-col items-center w-full pt-56'>
        <GoogleSignInButton onClick={signInWithGoogle}/>
    </div>
  );
}
