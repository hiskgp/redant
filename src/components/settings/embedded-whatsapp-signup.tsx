'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, MessageCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

declare global {
  interface Window {
    FB?: {
      init: (options: { appId: string; autoLogAppEvents?: boolean; cookie?: boolean; xfbml?: boolean; version: string; fedCM?: boolean }) => void
      login: (
        callback: (response: { status?: string; authResponse?: { code?: string; accessToken?: string } }) => void,
        options: Record<string, unknown>,
      ) => void
    }
    fbAsyncInit?: () => void
  }
}

type SignupData = {
  phone_number_id?: string
  waba_id?: string
  business_id?: string
  businessId?: string
}

type SignupDiagnosticEvent = 'login_callback_missing_credentials' | 'login_launch_exception' | 'session_cancelled' | 'session_error'

async function reportSignupDiagnostic(
  event: SignupDiagnosticEvent,
  diagnostic: { login_status?: string; has_auth_response?: boolean; session_event?: string } = {},
): Promise<string | null> {
  try {
    const response = await fetch('/api/whatsapp/embedded-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnostic_event: event, diagnostic }),
    })
    const payload = await response.json().catch(() => ({}))
    return typeof payload.request_id === 'string' ? payload.request_id : null
  } catch {
    return null
  }
}

type Props = { disabled?: boolean; onConnected?: () => void }

// Prevent duplicate FB.init calls when settings tabs remount during client navigation.
let initializedFacebookAppId: string | null = null

export function EmbeddedWhatsAppSignup({ disabled, onConnected }: Props) {
  const [sdkReady, setSdkReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const codeRef = useRef<string | null>(null)
  const accessTokenRef = useRef<string | null>(null)
  const dataRef = useRef<SignupData | null>(null)
  const submittedRef = useRef(false)

  const appId = process.env.NEXT_PUBLIC_META_APP_ID
  const configId = process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID

  const completeSignup = useCallback(async () => {
    const code = codeRef.current
    const accessToken = accessTokenRef.current
    const data = dataRef.current
    if ((!code && !accessToken) || !data?.waba_id || submittedRef.current) return

    submittedRef.current = true
    setBusy(true)
    setError('')
    setMessage('Completing WhatsApp connection…')

    try {
      const response = await fetch('/api/whatsapp/embedded-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(code ? { code } : { access_token: accessToken }),
          waba_id: data.waba_id,
          phone_number_id: data.phone_number_id,
          business_id: data.business_id ?? data.businessId ?? null,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'WhatsApp Embedded Signup could not be completed.')
      setMessage(payload.registered ? 'WhatsApp is connected and ready.' : 'WhatsApp is connected. Registration status will be checked next.')
      onConnected?.()
    } catch (err) {
      submittedRef.current = false
      setError(err instanceof Error ? err.message : 'WhatsApp connection failed.')
      setMessage('')
    } finally {
      setBusy(false)
    }
  }, [onConnected])

  useEffect(() => {
    if (!appId || !configId) {
      setError('Embedded Signup is not configured. Add NEXT_PUBLIC_META_APP_ID and NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID.')
      return
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com') return
      let data: { type?: string; event?: string; data?: SignupData & { current_step?: string; error_message?: string } }
      try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data } catch { return }
      if (data?.type !== 'WA_EMBEDDED_SIGNUP') return

      if (data.event === 'PARTNER_ADDED' || data.event === 'FINISH' || data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING') {
        dataRef.current = data.data ?? null
        setError('')
        if (codeRef.current || accessTokenRef.current) void completeSignup()
        else setMessage('Meta finished setup. Waiting for the authorization response…')
      } else if (data.event === 'CANCEL') {
        void reportSignupDiagnostic('session_cancelled', { session_event: 'CANCEL' })
        submittedRef.current = false
        codeRef.current = null
        accessTokenRef.current = null
        dataRef.current = null
        setBusy(false)
        setMessage('')
        setError('Embedded Signup was cancelled at ' + (data.data?.current_step ?? 'the current step') + '.')
      } else if (data.event === 'ERROR') {
        void reportSignupDiagnostic('session_error', { session_event: 'ERROR' })
        submittedRef.current = false
        codeRef.current = null
        dataRef.current = null
        setBusy(false)
        setMessage('')
        setError(data.data?.error_message || 'Meta reported an Embedded Signup error.')
      }
    }

    let disposed = false
    let sdkLoadTimeout: ReturnType<typeof setTimeout> | undefined
    const initializeSdk = () => {
      if (disposed || !window.FB) return
      try {
        if (initializedFacebookAppId !== appId) {
          // Initialize even when another part of the page loaded the SDK first.
          // Otherwise the button can appear ready while FB.login has no RedANT app config.
          window.FB.init({ appId, autoLogAppEvents: true, cookie: true, xfbml: true, version: 'v25.0', fedCM: false })
          initializedFacebookAppId = appId
        }
        setSdkReady(true)
        setError('')
      } catch {
        setSdkReady(false)
        setError('Meta SDK loaded but could not initialize. Refresh the page and try again.')
      }
    }

    window.addEventListener('message', handleMessage)
    window.fbAsyncInit = initializeSdk

    if (window.FB) {
      initializeSdk()
    } else {
      let script = document.getElementById('facebook-jssdk') as HTMLScriptElement | null
      if (!script) {
        script = document.createElement('script')
        script.id = 'facebook-jssdk'
        script.async = true
        script.defer = true
        script.crossOrigin = 'anonymous'
        script.src = 'https://connect.facebook.net/en_US/sdk.js'
        script.onerror = () => {
          if (!disposed) {
            setSdkReady(false)
            setError('Meta SDK could not load. Check browser tracking protection, ad blockers, or the site Content Security Policy, then refresh.')
          }
        }
        document.body.appendChild(script)
      }

      // If the script is already present but its callback was missed, wait briefly
      // for it to finish rather than leaving an apparently dead Connect button.
      sdkLoadTimeout = setTimeout(() => {
        if (!disposed && !window.FB) {
          setSdkReady(false)
          setError('Meta SDK did not initialize. Check browser console/CSP settings and refresh the page.')
        } else if (!disposed) {
          initializeSdk()
        }
      }, 10000)
    }

    return () => {
      disposed = true
      if (sdkLoadTimeout) clearTimeout(sdkLoadTimeout)
      window.removeEventListener('message', handleMessage)
      if (window.fbAsyncInit === initializeSdk) delete window.fbAsyncInit
    }
  }, [appId, configId, completeSignup])

  const launch = async () => {
    if (!window.FB || !sdkReady || !configId) {
      setError('Meta login is not ready yet. Wait for the SDK status below, then refresh if it does not become ready.')
      return
    }
    codeRef.current = null
    accessTokenRef.current = null
    dataRef.current = null
    submittedRef.current = false
    setError('')
    setMessage('Opening Meta Embedded Signup…')

    try {
      window.FB.login(
        async (response) => {
          const code = response.authResponse?.code
          const accessToken = response.authResponse?.accessToken
          if (!code && !accessToken) {
            setMessage('')
            const requestId = await reportSignupDiagnostic('login_callback_missing_credentials', {
              login_status: response.status ?? 'unknown',
              has_auth_response: Boolean(response.authResponse),
            })
            setError('Meta login did not return an authorization code. Please retry.' + (requestId ? ' Reference: ' + requestId : ''))
            return
          }
          codeRef.current = code ?? null
          accessTokenRef.current = accessToken ?? null
          if (dataRef.current) void completeSignup()
        },
        {
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            // v4 uses the saved Login for Business configuration for products and permissions.
            // Keep featureType so eligible WhatsApp Business App users can choose Coexistence.
            setup: {},
            featureType: 'whatsapp_business_app_onboarding',
          },
        },
      )
    } catch (launchError) {
      // Keep the browser's actual SDK exception in DevTools and show a useful,
      // non-secret summary. A generic popup-blocker message hid SDK/config bugs.
      console.error('[RedANT] Meta FB.login threw before opening signup:', launchError)
      setMessage('')
      const requestId = await reportSignupDiagnostic('login_launch_exception', {
        login_status: 'unknown',
        has_auth_response: false,
      })
      const detail = launchError instanceof Error && launchError.message
        ? launchError.message.slice(0, 180)
        : 'Unknown JavaScript SDK error'
      setError('Meta login could not start: ' + detail + (requestId ? ' Reference: ' + requestId : '') + '. Check the browser console for the full exception.')
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="size-5 text-primary" />
          Connect WhatsApp with Meta
        </CardTitle>
        <CardDescription>
          Connect a customer&apos;s WhatsApp Business number through Meta Embedded Signup.
          The Coexistence path is used so an eligible WhatsApp Business App number can remain in use.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button type="button" onClick={launch} disabled={disabled || busy || !sdkReady || !appId || !configId} className="w-full sm:w-auto">
          {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <MessageCircle className="mr-2 size-4" />}
          {busy ? 'Connecting…' : 'Connect WhatsApp'}
        </Button>
        {!sdkReady && !error && <p className="text-xs text-muted-foreground">Loading Meta SDK…</p>}
        {message && !error && <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-primary" />{message}</p>}
        {error && <p className="flex items-start gap-2 text-sm text-destructive"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><span>{error}</span></p>}
      </CardContent>
    </Card>
  )
}
