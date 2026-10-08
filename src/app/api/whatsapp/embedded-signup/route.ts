import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { encrypt } from '@/lib/whatsapp/encryption'
import { listWabaPhoneNumbers, subscribeWabaToApp, verifyPhoneNumber } from '@/lib/whatsapp/meta-api'

const META_API_VERSION = 'v25.0'
const GRAPH = `https://graph.facebook.com/${META_API_VERSION}`

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function resolveAccountId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from('profiles').select('account_id').eq('user_id', userId).maybeSingle()
  return data?.account_id ?? null
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const accountId = await resolveAccountId(supabase, user.id)
    if (!accountId) return NextResponse.json({ error: 'Your profile is not linked to an account.' }, { status: 403 })

    const body = await request.json()
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    const accessTokenFromClient = typeof body.access_token === 'string' ? body.access_token.trim() : ''
    const wabaId = typeof body.waba_id === 'string' ? body.waba_id.trim() : ''
    let phoneNumberId = typeof body.phone_number_id === 'string' ? body.phone_number_id.trim() : ''

    if ((!code && !accessTokenFromClient) || !/^\d+$/.test(wabaId)) {
      return NextResponse.json({ error: 'Meta did not return a valid signup credential or WABA ID.' }, { status: 400 })
    }

    let accessToken = accessTokenFromClient

    if (!accessToken) {
      const appId = process.env.META_APP_ID
      const appSecret = process.env.META_APP_SECRET?.split(',')[0]?.trim()
      if (!appId || !appSecret) {
        return NextResponse.json({ error: 'Meta Embedded Signup is not configured on the server. Set META_APP_ID and META_APP_SECRET.' }, { status: 500 })
      }

      const tokenUrl = new URL(`${GRAPH}/oauth/access_token`)
      tokenUrl.searchParams.set('client_id', appId)
      tokenUrl.searchParams.set('client_secret', appSecret)
      tokenUrl.searchParams.set('code', code)

      const tokenResponse = await fetch(tokenUrl, { cache: 'no-store' })
      const tokenPayload = await tokenResponse.json().catch(() => ({}))
      if (!tokenResponse.ok || !tokenPayload.access_token) {
        return NextResponse.json(
          { error: tokenPayload?.error?.message || 'Meta rejected the Embedded Signup authorization code.' },
          { status: 400 },
        )
      }

      accessToken = String(tokenPayload.access_token)
    }
    const numbers = await listWabaPhoneNumbers({ wabaId, accessToken })
    if (!phoneNumberId) {
      if (numbers.length !== 1) {
        return NextResponse.json({ error: 'Meta did not return a Phone Number ID and this WABA has multiple numbers. RedANT cannot safely choose a number.' }, { status: 400 })
      }
      phoneNumberId = numbers[0].id
    }
    if (!/^\d+$/.test(phoneNumberId)) {
      return NextResponse.json({ error: 'Meta returned an invalid Phone Number ID.' }, { status: 400 })
    }

    let phoneInfo
    try {
      phoneInfo = await verifyPhoneNumber({ phoneNumberId, accessToken })
    } catch {
      return NextResponse.json({ error: 'Meta issued a token, but RedANT could not verify the selected WhatsApp phone number.' }, { status: 400 })
    }

    if (!numbers.some((n) => n.id === phoneNumberId)) {
      return NextResponse.json({ error: 'The selected WhatsApp phone number does not belong to the WABA returned by Meta.' }, { status: 400 })
    }

    try {
      await subscribeWabaToApp({ wabaId, accessToken })
    } catch {
      return NextResponse.json({ error: 'The WhatsApp account was authorized, but Meta did not allow RedANT to subscribe the WABA to its webhook.' }, { status: 400 })
    }

    const { data: claimed } = await admin()
      .from('whatsapp_config')
      .select('account_id')
      .eq('phone_number_id', phoneNumberId)
      .neq('account_id', accountId)
      .maybeSingle()

    if (claimed) {
      return NextResponse.json({ error: 'This WhatsApp phone number is already linked to another RedANT account.' }, { status: 409 })
    }

    const encryptedAccessToken = encrypt(accessToken)
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim() || null
    const now = new Date().toISOString()

    const { data: existing } = await supabase
      .from('whatsapp_config')
      .select('id')
      .eq('account_id', accountId)
      .maybeSingle()

    const row = {
      account_id: accountId,
      user_id: user.id,
      phone_number_id: phoneNumberId,
      waba_id: wabaId,
      access_token: encryptedAccessToken,
      verify_token: verifyToken ? encrypt(verifyToken) : null,
      status: 'connected',
      connected_at: now,
      subscribed_apps_at: now,
      last_registration_error: null,
      updated_at: now,
    }

    const result = existing
      ? await supabase.from('whatsapp_config').update(row).eq('account_id', accountId)
      : await supabase.from('whatsapp_config').insert(row)

    if (result.error) {
      console.error('[embedded-signup] database save failed:', result.error)
      return NextResponse.json({ error: 'Meta connection succeeded, but RedANT could not save the connection.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      registered: false,
      phone_info: phoneInfo,
      waba_id: wabaId,
      phone_number_id: phoneNumberId,
      webhook_verify_token_configured: Boolean(verifyToken),
    })
  } catch (error) {
    console.error('[embedded-signup] unexpected error:', error)
    return NextResponse.json({ error: 'Failed to complete WhatsApp Embedded Signup.' }, { status: 500 })
  }
}
