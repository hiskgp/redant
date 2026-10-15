import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { requireRole, toErrorResponse } from '@/lib/auth/account';
import { encrypt } from '@/lib/whatsapp/encryption';
import {
  exchangeInstagramAuthorizationCode,
  getInstagramOAuthConfig,
} from '@/lib/instagram/oauth';

const OAUTH_STATE_COOKIE = 'redant_instagram_oauth_state';

function settingsUrl(status: 'connected' | 'error', reason?: string): URL {
  let base = 'https://redant.in';
  try {
    base = new URL(getInstagramOAuthConfig().redirectUri).origin;
  } catch {
    // Use the production origin if the redirect URI is not configured.
  }
  const url = new URL('/settings', base);
  url.searchParams.set('tab', 'instagram');
  url.searchParams.set('instagram_status', status);
  if (reason) url.searchParams.set('instagram_reason', reason);
  return url;
}

function redirectToSettings(
  status: 'connected' | 'error',
  reason?: string,
): NextResponse {
  const response = NextResponse.redirect(settingsUrl(status, reason));
  response.cookies.set(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/instagram/callback',
    maxAge: 0,
  });
  return response;
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Instagram persistence is not configured.');
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const providerError = url.searchParams.get('error');
  if (providerError) {
    return redirectToSettings('error', 'authorization_denied');
  }

  const code = url.searchParams.get('code')?.trim() ?? '';
  const returnedState = url.searchParams.get('state') ?? '';
  const cookieValue = request.cookies.get(OAUTH_STATE_COOKIE)?.value ?? '';
  const [expectedState, expectedAccountId] = cookieValue.split('.');
  if (
    !returnedState ||
    !expectedState ||
    returnedState !== expectedState ||
    !/^[0-9a-f-]{36}$/i.test(expectedAccountId ?? '')
  ) {
    return redirectToSettings('error', 'invalid_oauth_state');
  }

  if (!code || code.length > 4096) {
    return redirectToSettings('error', 'missing_authorization_code');
  }

  try {
    const { accountId, userId } = await requireRole('admin');
    if (accountId !== expectedAccountId) {
      return redirectToSettings('error', 'account_changed_during_connection');
    }

    const config = getInstagramOAuthConfig();
    const connected = await exchangeInstagramAuthorizationCode(code, config);
    const expiresAt = new Date(Date.now() + connected.expiresIn * 1000).toISOString();
    const db = adminClient();

    // Mark metadata as incomplete until the encrypted credential has also
    // persisted. The UI must not show a connected state for a half-written row.
    const { data: row, error: connectionError } = await db
      .from('instagram_connections')
      .upsert({
        account_id: accountId,
        connected_by_user_id: userId,
        instagram_user_id: connected.profile.userId,
        username: connected.profile.username,
        status: 'error',
        token_expires_at: expiresAt,
        last_synced_at: new Date().toISOString(),
        last_error_code: null,
      }, { onConflict: 'account_id' })
      .select('id')
      .single();

    if (connectionError || !row) {
      if (connectionError?.code === '23505') {
        return redirectToSettings('error', 'instagram_account_already_connected');
      }
      console.error('[instagram-oauth] connection metadata persistence failed', connectionError?.code ?? 'unknown');
      return redirectToSettings('error', 'database_save_failed');
    }

    const { error: secretError } = await db
      .from('instagram_connection_secrets')
      .upsert({
        connection_id: row.id,
        account_id: accountId,
        access_token_encrypted: encrypt(connected.accessToken),
      }, { onConflict: 'connection_id' });

    if (secretError) {
      console.error('[instagram-oauth] encrypted credential persistence failed', secretError.code ?? 'unknown');
      await db.from('instagram_connections')
        .update({ status: 'error', last_error_code: 'credential_persistence_failed' })
        .eq('id', row.id)
        .eq('account_id', accountId);
      return redirectToSettings('error', 'database_save_failed');
    }

    const { error: activateError } = await db
      .from('instagram_connections')
      .update({ status: 'connected', last_error_code: null })
      .eq('id', row.id)
      .eq('account_id', accountId);

    if (activateError) {
      console.error('[instagram-oauth] connection activation failed', activateError.code ?? 'unknown');
      return redirectToSettings('error', 'database_save_failed');
    }

    return redirectToSettings('connected');
  } catch (error) {
    // Never log authorization codes, provider URLs, raw payloads, or tokens.
    console.error('[instagram-oauth] callback failed', error instanceof Error ? error.name : 'UnknownError');
    if (error instanceof Error && error.message === 'Instagram persistence is not configured.') {
      return redirectToSettings('error', 'server_configuration');
    }
    return redirectToSettings('error', 'connection_failed');
  }
}
