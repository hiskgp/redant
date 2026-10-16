import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { decrypt, encrypt } from '@/lib/whatsapp/encryption';

const REFRESH_WINDOW_DAYS = 14;

function constantTimeEqual(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorized(request: Request): boolean {
  const expected = process.env.INSTAGRAM_CRON_SECRET;
  if (!expected) return false;

  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> when CRON_SECRET
  // is configured in the project environment. Keep the custom header for
  // manual/other scheduler integrations, but compare either value safely.
  const authorization = request.headers.get('authorization') ?? '';
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const custom = request.headers.get('x-cron-secret') ?? '';
  return constantTimeEqual(bearer, expected) || constantTimeEqual(custom, expected);
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Instagram token refresh is not configured.');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(request: Request) {
  if (!process.env.INSTAGRAM_CRON_SECRET) {
    return NextResponse.json({ error: 'Instagram token refresh is not configured.' }, { status: 503 });
  }
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let db;
  try {
    db = adminClient();
  } catch {
    return NextResponse.json({ error: 'Instagram token refresh is not configured.' }, { status: 503 });
  }

  const cutoff = new Date(Date.now() + REFRESH_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: connections, error } = await db
    .from('instagram_connections')
    .select('id, account_id, instagram_user_id, token_expires_at')
    .eq('status', 'connected')
    // Null expiry metadata must not silently exclude a connected credential
    // from maintenance; let Meta validate/refresh it instead of leaving it
    // indefinitely unexamined.
    .or(`token_expires_at.is.null,token_expires_at.lt.${cutoff}`)
    .order('token_expires_at', { ascending: true, nullsFirst: true })
    .limit(100);

  if (error) {
    console.error('[instagram-token-refresh] query failed', error.code ?? 'unknown');
    return NextResponse.json({ error: 'Could not load Instagram tokens for refresh.' }, { status: 500 });
  }

  let refreshed = 0;
  let reauthorizationRequired = 0;
  let failed = 0;

  for (const connection of connections ?? []) {
    const { data: secret, error: secretError } = await db
      .from('instagram_connection_secrets')
      .select('access_token_encrypted')
      .eq('connection_id', connection.id)
      .eq('account_id', connection.account_id)
      .maybeSingle();

    if (secretError || !secret) {
      failed++;
      console.warn('[instagram-token-refresh] encrypted credential missing');
      continue;
    }

    let accessToken: string;
    try {
      accessToken = decrypt(secret.access_token_encrypted);
    } catch {
      await db.from('instagram_connections')
        .update({ status: 'reauthorization_required', last_error_code: 'credential_decrypt_failed' })
        .eq('id', connection.id)
        .eq('account_id', connection.account_id);
      reauthorizationRequired++;
      continue;
    }

    const refreshUrl = new URL('https://graph.instagram.com/refresh_access_token');
    refreshUrl.searchParams.set('grant_type', 'ig_refresh_token');
    refreshUrl.searchParams.set('access_token', accessToken);

    let response: Response;
    try {
      response = await fetch(refreshUrl, { cache: 'no-store' });
    } catch {
      failed++;
      await db.from('instagram_connections')
        .update({ last_error_code: 'token_refresh_network_error' })
        .eq('id', connection.id)
        .eq('account_id', connection.account_id);
      continue;
    }

    const responseBody: unknown = await response.json().catch(() => null);
    const body = responseBody && typeof responseBody === 'object'
      ? responseBody as Record<string, unknown>
      : {};
    const refreshedToken = typeof body.access_token === 'string' ? body.access_token : '';
    const expiresIn = typeof body.expires_in === 'number' ? body.expires_in : 0;

    if (!response.ok || !refreshedToken || expiresIn <= 0) {
      const nestedError = body.error && typeof body.error === 'object'
        ? body.error as Record<string, unknown>
        : {};
      const providerCode = typeof nestedError.code === 'number' ? String(nestedError.code) : null;
      if (response.status === 400 || response.status === 401) {
        await db.from('instagram_connections')
          .update({ status: 'reauthorization_required', last_error_code: providerCode ?? 'token_refresh_rejected' })
          .eq('id', connection.id)
          .eq('account_id', connection.account_id);
        reauthorizationRequired++;
      } else {
        await db.from('instagram_connections')
          .update({ last_error_code: providerCode ?? 'token_refresh_failed' })
          .eq('id', connection.id)
          .eq('account_id', connection.account_id);
        failed++;
      }
      continue;
    }

    const { error: tokenWriteError } = await db
      .from('instagram_connection_secrets')
      .update({ access_token_encrypted: encrypt(refreshedToken) })
      .eq('connection_id', connection.id)
      .eq('account_id', connection.account_id);

    if (tokenWriteError) {
      failed++;
      console.error('[instagram-token-refresh] encrypted token update failed', tokenWriteError.code ?? 'unknown');
      continue;
    }

    const { error: metadataError } = await db
      .from('instagram_connections')
      .update({
        token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        last_synced_at: new Date().toISOString(),
        last_error_code: null,
        status: 'connected',
      })
      .eq('id', connection.id)
      .eq('account_id', connection.account_id);

    if (metadataError) {
      failed++;
      console.error('[instagram-token-refresh] metadata update failed', metadataError.code ?? 'unknown');
      continue;
    }

    refreshed++;
  }

  return NextResponse.json({
    checked: connections?.length ?? 0,
    refreshed,
    reauthorization_required: reauthorizationRequired,
    failed,
  });
}
