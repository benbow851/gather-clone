'use server'
import 'server-only'
import { RtcRole, RtcTokenBuilder } from 'agora-token'
import { createClient } from '../supabase/server'

export async function generateToken(channelName: string) {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        // Guest mode: ask backend to mint a token
        const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/guest/agora-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelName })
        })
        if (!resp.ok) return null
        const { token } = await resp.json()
        return token as string
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!
    const appCertificate = process.env.APP_CERTIFICATE!
    const uid = 0
    const role = RtcRole.PUBLISHER
    const expireTime = 3600
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const expiredTs = currentTimestamp + expireTime

    const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        role,
        expiredTs,
        expiredTs,
    )

    return token
}