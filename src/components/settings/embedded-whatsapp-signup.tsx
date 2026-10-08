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

type Props = { disabled?: boolean; onConnected?: () => void }

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
        submittedRef.current = false
        codeRef.current = null
        accessTokenRef.current = null
        dataRef.current = null
        setBusy(false)
        setMessage('')
        setError('Embedded Signup was cancelled at ' + (data.data?.current_step ?? 'the current step') + '.')
      } else if (data.event === 'ERROR') {
        submittedRef.current = false
        codeRef.current = null
        dataRef.current = null
        setBusy(false)
        setMessage('')
        setError(data.data?.error_message || 'Meta reported an Embedded Signup error.')
      }
    }

    window.addEventListener('message', handleMessage)

    if (window.FB) {
      setSdkReady(true)
      return () => window.removeEventListener('message', handleMessage)
    }

    window.fbAsyncInit = () => {
      window.FB?.init({ appId, autoLogAppEvents: true, cookie: true, xfbml: true, version: 'v25.0', fedCM: false })
      setSdkReady(true)
    }

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      document.body.appendChild(script)
    }

    return () => {
      window.removeEventListener('message', handleMessage)
      if (window.fbAsyncInit) delete window.fbAsyncInit
    }
  }, [appId, configId, completeSignup])

  const launch = () => {
    if (!window.FB || !sdkReady || !configId) return
    codeRef.current = null
    accessTokenRef.current = null
    dataRef.current = null
    submittedRef.current = false
    setError('')
    setMessage('Opening Meta Embedded Signup…')

    window.FB.login(
      (response) => {
        const code = response.authResponse?.code
        const accessToken = response.authResponse?.accessToken
        if (!code && !accessToken) {
          setMessage('')
          setError('Meta login completed but returned neither an authorization code nor an access token. Please try again.')
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
          setup: {},
          featureType: 'whatsapp_business_app_onboarding',
        },
      },
    )
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
