import { describe, expect, it } from 'vitest'
import { buildStructuredLogRecord, sanitizeLogText } from './structured-log'

describe('structured logging redaction', () => {
  it('redacts bearer tokens and sensitive key-value pairs', () => {
    const text = sanitizeLogText(
      'Bearer topsecret access_token=abc123 client_secret:shhh code=oauth-code state=state123',
    )
    expect(text).not.toContain('topsecret')
    expect(text).not.toContain('abc123')
    expect(text).not.toContain('shhh')
    expect(text).not.toContain('oauth-code')
    expect(text).not.toContain('state123')
    expect(text).toContain('[REDACTED]')
  })

  it('omits sensitive fields and keeps safe correlation metadata', () => {
    const record = buildStructuredLogRecord('warn', 'oauth.callback.rejected', 'req-123', {
      http_status: 400,
      error_description: 'Invalid redirect_uri',
      access_token: 'must-not-log',
      phone_number: 'must-not-log',
    })

    expect(record.request_id).toBe('req-123')
    expect(record.event).toBe('oauth.callback.rejected')
    expect(record.http_status).toBe(400)
    expect(record.error_description).toBe('Invalid redirect_uri')
    expect(record).not.toHaveProperty('access_token')
    expect(record).not.toHaveProperty('phone_number')
    expect(JSON.stringify(record)).not.toContain('must-not-log')
  })

  it('bounds potentially untrusted text', () => {
    expect(sanitizeLogText('x'.repeat(2000))).toHaveLength(800)
  })
})
