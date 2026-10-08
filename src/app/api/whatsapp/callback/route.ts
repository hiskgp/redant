import { NextResponse } from 'next/server'

/**
 * OAuth callback endpoint for Meta/Facebook Login for Business.
 *
 * The current WhatsApp Embedded Signup flow is launched with FB.login(),
 * so the normal success callback is delivered to the browser callback and
 * WA_EMBEDDED_SIGNUP postMessage events. This endpoint exists as the
 * registered HTTPS callback/redirect target and prevents Meta from landing
 * on a 404 if a redirect-based flow is used.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error,
        error_description: errorDescription,
      },
      { status: 400 },
    )
  }

  return NextResponse.json({
    success: true,
    service: 'RedANT WhatsApp Embedded Signup callback',
    message:
      'Callback endpoint is reachable. Complete Embedded Signup through the RedANT WhatsApp connection flow.',
  })
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') ?? ''
  let body: Record<string, unknown> = {}

  try {
    if (contentType.includes('application/json')) {
      const value = await request.json()
      if (value && typeof value === 'object') body = value
    } else {
      const form = await request.formData()
      form.forEach((value, key) => {
        body[key] = typeof value === 'string' ? value : String(value)
      })
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid callback payload.' },
      { status: 400 },
    )
  }

  const error = typeof body.error === 'string' ? body.error : null

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error,
        error_description:
          typeof body.error_description === 'string'
            ? body.error_description
            : null,
      },
      { status: 400 },
    )
  }

  return NextResponse.json({
    success: true,
    received: true,
  })
}
