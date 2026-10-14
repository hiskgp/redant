import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { ForbiddenError, requireRole, UnauthorizedError } from '@/lib/auth/account'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { encrypt } from '@/lib/whatsapp/encryption'
import { listWabaPhoneNumbers, subscribeWabaToApp, verifyPhoneNumber } from '@/lib/whatsapp/meta-api'

const META_API_VERSION = 'v25.0'
const GRAPH = `https://graph.facebook.com/${META_API_VERSION}`

type LogLevel = 'info' | 'warn' | 'error'

function safeLogText(value: string) {
  return value
    .replace(/(access_token|client_secret|app_secret|authorization|code)=([^&\s]+)/gi, '$1=[REDACTED]')
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .slice(0, 1200)
}

function signupLog(
  level: LogLevel,
  event: string,
  requestId: string,
  fields: Record<string, string | number | boolean | null | undefined> = {},
  error?: unknown,
) {
  const safeFields: Record<string, string | number | boolean | null | undefined> = {}
  for (const [key, value] of Object.entries(fields)) {
    // Never write credentials, phone numbers, email addresses, or raw payloads to logs.
    if (/token|secret|authorization|auth_code|phone|email|payload|message_body/i.test(key)) continue
    safeFields[key] = typeof value === 'string' ? safeLogText(value) : value
  }

  const err = error instanceof Error ? error as Error & {
    code?: number | string | null
    subcode?: number | string | null
    fbtraceId?: string | null
    httpStatus?: number | null
    type?: string | null
    details?: string | null
  } : null

  const record = {
    timestamp: new Date().toISOString(),
    level,
    service: 'redant',
    route: '/api/whatsapp/embedded-signup',
    event,
    request_id: requestId,
    ...safeFields,
    ...(error !== undefined ? {
      error_name: err?.name ?? 'UnknownError',
      error_message: safeLogText(err?.message ?? String(error)),
      ...(err?.code != null ? { meta_error_code: err.code } : {}),
      ...(err?.subcode != null ? { meta_error_subcode: err.subcode } : {}),
      ...(err?.fbtraceId ? { meta_fbtrace_id: safeLogText(err.fbtraceId) } : {}),
      ...(err?.httpStatus != null ? { upstream_http_status: err.httpStatus } : {}),
      ...(err?.type ? { meta_error_type: safeLogText(err.type) } : {}),
      ...(err?.details ? { meta_error_details: safeLogText(err.details) } : {}),
    } : {}),
  }
  const line = JSON.stringify(record)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.info(line)
}

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: Request) {
  const suppliedRequestId = request.headers.get('x-request-id')
  const requestId = suppliedRequestId && /^[a-zA-Z0-9._-]{1,100}$/.test(suppliedRequestId)
    ? suppliedRequestId
    : randomUUID()

  signupLog('info', 'signup.request_received', requestId)

  try {
    // The connected WhatsApp number is shared by the whole account.
    // Only account admins may connect or replace that integration.
    const { supabase, accountId, userId } = await requireRole('admin')

    const body = await request.json()

    // Client-side Meta popup failures happen before a credential exists, so they
    // cannot reach the normal token-exchange error path. Record only an allowlisted
    // event and coarse status flags; never accept or log browser-supplied credentials.
    const diagnosticEvents = {
      login_callback_missing_credentials: 'warn',
      session_cancelled: 'info',
      session_error: 'error',
    } as const
    const diagnosticEvent = typeof body.diagnostic_event === 'string' ? body.diagnostic_event : ''
    if (diagnosticEvent) {
      if (!Object.hasOwn(diagnosticEvents, diagnosticEvent)) {
        return NextResponse.json({ error: 'Unsupported diagnostic event.', request_id: requestId }, { status: 400 })
      }
      const diagnostic = body.diagnostic && typeof body.diagnostic === 'object' ? body.diagnostic : {}
      const allowedStatuses = ['connected', 'not_authorized', 'unknown', 'other']
      const loginStatus = allowedStatuses.includes(diagnostic.login_status) ? diagnostic.login_status : 'unknown'
      const hasAuthResponse = typeof diagnostic.has_auth_response === 'boolean' ? diagnostic.has_auth_response : null
      const sessionEvent = ['CANCEL', 'ERROR'].includes(diagnostic.session_event) ? diagnostic.session_event : null
      signupLog(diagnosticEvents[diagnosticEvent as keyof typeof diagnosticEvents], 'client.' + diagnosticEvent, requestId, {
        login_status: loginStatus,
        has_auth_response: hasAuthResponse,
        session_event: sessionEvent,
      })
      return NextResponse.json({ success: true, request_id: requestId })
    }

    const code = typeof body.code === 'string' ? body.code.trim() : ''
    const accessTokenFromClient = typeof body.access_token === 'string' ? body.access_token.trim() : ''
    const wabaId = typeof body.waba_id === 'string' ? body.waba_id.trim() : ''
    let phoneNumberId = typeof body.phone_number_id === 'string' ? body.phone_number_id.trim() : ''

    if ((!code && !accessTokenFromClient) || !/^\d+$/.test(wabaId)) {
      signupLog('warn', 'signup.invalid_meta_response', requestId, { has_code: Boolean(code), has_client_token: Boolean(accessTokenFromClient), has_waba_id: /^\d+$/.test(wabaId), http_status: 400 })
      return NextResponse.json({ error: 'Meta did not return a valid signup credential or WABA ID.', request_id: requestId }, { status: 400 })
    }

    let accessToken = accessTokenFromClient

    if (!accessToken) {
      const appId = process.env.META_APP_ID
      const appSecret = process.env.META_APP_SECRET?.split(',')[0]?.trim()
      if (!appId || !appSecret) {
        signupLog('error', 'signup.server_meta_config_missing', requestId, { has_app_id: Boolean(appId), has_app_secret: Boolean(appSecret), http_status: 500 })
        return NextResponse.json({ error: 'Meta Embedded Signup is not configured on the server. Set META_APP_ID and META_APP_SECRET.', request_id: requestId }, { status: 500 })
      }

      const tokenUrl = new URL(`${GRAPH}/oauth/access_token`)
      tokenUrl.searchParams.set('client_id', appId)
      tokenUrl.searchParams.set('client_secret', appSecret)
      tokenUrl.searchParams.set('code', code)

      const tokenResponse = await fetch(tokenUrl, { cache: 'no-store' })
      const tokenPayload = await tokenResponse.json().catch(() => ({}))
      if (!tokenResponse.ok || !tokenPayload.access_token) {
        signupLog('error', 'signup.authorization_code_exchange_failed', requestId, { upstream_http_status: tokenResponse.status, meta_error_code: tokenPayload?.error?.code ?? null, meta_error_subcode: tokenPayload?.error?.error_subcode ?? null, meta_error_type: tokenPayload?.error?.type ?? null, meta_fbtrace_id: tokenPayload?.error?.fbtrace_id ?? null, error_message: typeof tokenPayload?.error?.message === 'string' ? safeLogText(tokenPayload.error.message) : 'Meta did not return an access token' })
        return NextResponse.json(
          { error: tokenPayload?.error?.message || 'Meta rejected the Embedded Signup authorization code.', request_id: requestId },
          { status: 400 },
        )
      }

      accessToken = String(tokenPayload.access_token)
      signupLog('info', 'signup.authorization_code_exchange_succeeded', requestId)
    } else {
      signupLog('info', 'signup.client_credential_received', requestId)
    }

    const numbers = await listWabaPhoneNumbers({ wabaId, accessToken })
    signupLog('info', 'signup.waba_phone_numbers_loaded', requestId, { number_count: numbers.length })

    if (!phoneNumberId) {
      if (numbers.length !== 1) {
        signupLog('warn', 'signup.phone_number_selection_ambiguous', requestId, { number_count: numbers.length, http_status: 400 })
        return NextResponse.json({ error: 'Meta did not return a Phone Number ID and this WABA has multiple numbers. RedANT cannot safely choose a number.', request_id: requestId }, { status: 400 })
      }
      phoneNumberId = numbers[0].id
    }
    if (!/^\d+$/.test(phoneNumberId)) {
      signupLog('warn', 'signup.invalid_phone_number_id', requestId, { http_status: 400 })
      return NextResponse.json({ error: 'Meta returned an invalid Phone Number ID.', request_id: requestId }, { status: 400 })
    }

    let phoneInfo
    try {
      phoneInfo = await verifyPhoneNumber({ phoneNumberId, accessToken })
      signupLog('info', 'signup.phone_number_verified', requestId)
    } catch (error) {
      signupLog('error', 'signup.phone_number_verification_failed', requestId, {}, error)
      return NextResponse.json({ error: 'Meta issued a token, but RedANT could not verify the selected WhatsApp phone number.', request_id: requestId }, { status: 400 })
    }

    if (!numbers.some((n) => n.id === phoneNumberId)) {
      signupLog('warn', 'signup.phone_number_not_in_waba', requestId, { http_status: 400 })
      return NextResponse.json({ error: 'The selected WhatsApp phone number does not belong to the WABA returned by Meta.', request_id: requestId }, { status: 400 })
    }

    try {
      await subscribeWabaToApp({ wabaId, accessToken })
      signupLog('info', 'signup.webhook_subscription_succeeded', requestId)
    } catch (error) {
      signupLog('error', 'signup.webhook_subscription_failed', requestId, {}, error)
      return NextResponse.json({ error: 'The WhatsApp account was authorized, but Meta did not allow RedANT to subscribe the WABA to its webhook.', request_id: requestId }, { status: 400 })
    }

    const { data: claimed, error: claimError } = await admin()
      .from('whatsapp_config')
      .select('account_id')
      .eq('phone_number_id', phoneNumberId)
      .neq('account_id', accountId)
      .maybeSingle()

    if (claimError) {
      signupLog('error', 'signup.phone_number_ownership_check_failed', requestId, { db_error_code: claimError.code, db_error_message: safeLogText(claimError.message) })
      return NextResponse.json({ error: 'RedANT could not verify ownership of this WhatsApp number. Please retry.', request_id: requestId }, { status: 500 })
    }

    if (claimed) {
      signupLog('warn', 'signup.phone_number_already_linked', requestId, { http_status: 409 })
      return NextResponse.json({ error: 'This WhatsApp phone number is already linked to another RedANT account.', request_id: requestId }, { status: 409 })
    }

    const encryptedAccessToken = encrypt(accessToken)
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim() || null
    const now = new Date().toISOString()

    const { data: existing, error: existingError } = await supabase
      .from('whatsapp_config')
      .select('id')
      .eq('account_id', accountId)
      .maybeSingle()

    if (existingError) {
      signupLog('error', 'signup.existing_connection_lookup_failed', requestId, { db_error_code: existingError.code, db_error_message: safeLogText(existingError.message) })
      return NextResponse.json({ error: 'RedANT could not check the existing WhatsApp connection.', request_id: requestId }, { status: 500 })
    }

    const row = {
      account_id: accountId,
      user_id: userId,
      phone_number_id: phoneNumberId,
      waba_id: wabaId,
      access_token: encryptedAccessToken,
      verify_token: verifyToken ? encrypt(verifyToken) : null,
      status: 'connected',
      connection_method: 'embedded_signup',
      connected_at: now,
      subscribed_apps_at: now,
      last_registration_error: null,
      updated_at: now,
    }

    const result = existing
      ? await supabase.from('whatsapp_config').update(row).eq('account_id', accountId)
      : await supabase.from('whatsapp_config').insert(row)

    if (result.error) {
      signupLog('error', 'signup.database_save_failed', requestId, { db_error_code: result.error.code, db_error_message: safeLogText(result.error.message) })
      return NextResponse.json({ error: 'Meta connection succeeded, but RedANT could not save the connection.', request_id: requestId }, { status: 500 })
    }

    signupLog('info', 'signup.completed', requestId, { webhook_verify_token_configured: Boolean(verifyToken) })

    return NextResponse.json({
      success: true,
      registered: false,
      request_id: requestId,
      phone_info: phoneInfo,
      waba_id: wabaId,
      phone_number_id: phoneNumberId,
      webhook_verify_token_configured: Boolean(verifyToken),
    })
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      signupLog('warn', error instanceof UnauthorizedError ? 'signup.unauthorized' : 'signup.forbidden', requestId, {
        http_status: error.status,
      })
      return NextResponse.json({ error: error.message, request_id: requestId }, { status: error.status })
    }
    signupLog('error', 'signup.unexpected_failure', requestId, {}, error)
    return NextResponse.json({ error: 'Failed to complete WhatsApp Embedded Signup.', request_id: requestId }, { status: 500 })
  }
}
