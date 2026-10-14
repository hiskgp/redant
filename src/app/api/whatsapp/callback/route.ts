import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { writeStructuredLog } from '@/lib/observability/structured-log'

/**
 * OAuth callback endpoint for Meta/Facebook Login for Business.
 *
 * The current WhatsApp Embedded Signup flow is launched with FB.login(),
 * so the normal success callback is delivered to the browser callback and
 * WA_EMBEDDED_SIGNUP postMessage events. This endpoint exists as the
 * registered HTTPS callback/redirect target and prevents Meta from landing
 * on a 404 if a redirect-based flow is used.
 */
function getRequestId(request: Request): string {
  const supplied = request.headers.get('x-request-id')
  return supplied && /^[a-zA-Z0-9._-]{1,100}$/.test(supplied) ? supplied : randomUUID()
}

function jsonResponse(
  payload: Record<string, unknown>,
  requestId: string,
  status = 200,
) {
  return NextResponse.json(payload, {
    status,
    headers: { 'x-request-id': requestId },
  })
}

export async function GET(request: Request) {
  const requestId = getRequestId(request)
  const url = new URL(request.url)
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  if (error) {
    writeStructuredLog('warn', 'oauth.callback.rejected', requestId, {
      oauth_error: error,
      error_description: errorDescription,
      http_status: 400,
    })
    return jsonResponse(
      {
        success: false,
        error,
        error_description: errorDescription,
        request_id: requestId,
      },
      requestId,
      400,
    )
  }

  writeStructuredLog('info', 'oauth.callback.reached', requestId)
  return jsonResponse({
    success: true,
    service: 'RedANT WhatsApp Embedded Signup callback',
    message:
      'Callback endpoint is reachable. Complete Embedded Signup through the RedANT WhatsApp connection flow.',
    request_id: requestId,
  }, requestId)
}

export async function POST(request: Request) {
  const requestId = getRequestId(request)
  const contentType = request.headers.get('content-type') ?? ''
  let body: Record<string, unknown> = {}

  try {
    if (contentType.includes('application/json')) {
      const value = await request.json()
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        body = value as Record<string, unknown>
      }
    } else {
      const form = await request.formData()
      form.forEach((value, key) => {
        // Retain only OAuth error fields; never copy arbitrary form values.
        if (key === 'error' || key === 'error_description') {
          body[key] = typeof value === 'string' ? value : '[non-text value]'
        }
      })
    }
  } catch {
    writeStructuredLog('warn', 'oauth.callback.invalid_payload', requestId, { http_status: 400 })
    return jsonResponse(
      { success: false, error: 'Invalid callback payload.', request_id: requestId },
      requestId,
      400,
    )
  }

  const error = typeof body.error === 'string' ? body.error : null
  const errorDescription = typeof body.error_description === 'string'
    ? body.error_description
    : null

  if (error) {
    writeStructuredLog('warn', 'oauth.callback.rejected', requestId, {
      oauth_error: error,
      error_description: errorDescription,
      http_status: 400,
    })
    return jsonResponse(
      {
        success: false,
        error,
        error_description: errorDescription,
        request_id: requestId,
      },
      requestId,
      400,
    )
  }

  writeStructuredLog('info', 'oauth.callback.received', requestId)
  return jsonResponse({ success: true, received: true, request_id: requestId }, requestId)
}
