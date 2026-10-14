export type StructuredLogLevel = 'info' | 'warn' | 'error'

export type StructuredLogFields = Record<
  string,
  string | number | boolean | null | undefined
>

const SENSITIVE_FIELD = /token|secret|authorization|auth.?code|(^|_)code($|_)|state|cookie|password|phone|email|payload|body|credential|signature/i
const SENSITIVE_VALUE = /(access_token|refresh_token|client_secret|app_secret|authorization|auth_code|code|state|verify_token|phone_number|email)(["'\\s:=]+)([^&\\s,"'}]+)/gi

/** Redact common credentials and personal identifiers before a value reaches logs. */
export function sanitizeLogText(value: string): string {
  return value
    .replace(/Bearer\\s+[^\\s,;]+/gi, 'Bearer [REDACTED]')
    .replace(SENSITIVE_VALUE, '$1$2[REDACTED]')
    .replace(/([?&](?:access_token|refresh_token|client_secret|app_secret|code|state|verify_token)=)[^&#\\s]*/gi, '$1[REDACTED]')
    .slice(0, 800)
}

/** Build a predictable JSON log record; never accept arbitrary objects or request bodies. */
export function buildStructuredLogRecord(
  level: StructuredLogLevel,
  event: string,
  requestId: string,
  fields: StructuredLogFields = {},
  route = '/api/whatsapp/callback',
) {
  const safeFields: Record<string, string | number | boolean | null> = {}
  for (const [key, value] of Object.entries(fields)) {
    if (SENSITIVE_FIELD.test(key) || value === undefined) continue
    safeFields[key] = typeof value === 'string' ? sanitizeLogText(value) : value
  }

  return {
    timestamp: new Date().toISOString(),
    level,
    service: 'redant',
    route,
    event: sanitizeLogText(event),
    request_id: requestId,
    ...safeFields,
  }
}

export function writeStructuredLog(
  level: StructuredLogLevel,
  event: string,
  requestId: string,
  fields: StructuredLogFields = {},
  route?: string,
): void {
  const line = JSON.stringify(buildStructuredLogRecord(level, event, requestId, fields, route))
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.info(line)
}
