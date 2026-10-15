import { createHmac, timingSafeEqual } from 'node:crypto';
import { after, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { decrypt } from '@/lib/whatsapp/encryption';
import { verifyMetaWebhookSignature } from '@/lib/whatsapp/webhook-signature';
import { matchesInstagramKeyword, type InstagramKeywordMatchType } from '@/lib/instagram/keyword-match';

export const maxDuration = 60;

const GRAPH_API_VERSION = process.env.INSTAGRAM_GRAPH_API_VERSION?.trim() || 'v25.0';

type InstagramCommentChange = {
  field?: string;
  value?: {
    id?: string;
    text?: string;
    from?: { id?: string; username?: string };
    media?: { id?: string };
  };
};

type InstagramWebhookPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: InstagramCommentChange[];
  }>;
};

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Instagram webhook persistence is not configured.');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function constantTimeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const challenge = url.searchParams.get('hub.challenge');
  const suppliedToken = url.searchParams.get('hub.verify_token');
  const expectedToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN?.trim();

  if (!expectedToken || mode !== 'subscribe' || !challenge || !suppliedToken ||
      !constantTimeEqual(suppliedToken, expectedToken)) {
    return NextResponse.json({ error: 'Instagram webhook verification failed.' }, { status: 403 });
  }

  return new Response(challenge, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyMetaWebhookSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let payload: InstagramWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as InstagramWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  if (payload.object !== 'instagram' || !Array.isArray(payload.entry)) {
    return NextResponse.json({ error: 'Unsupported webhook payload.' }, { status: 400 });
  }

  // Acknowledge Meta promptly; the runtime keeps the work alive after the
  // response. Each comment is claimed with a database unique constraint before
  // any outbound request, preventing duplicate private replies on webhook retry.
  after(async () => {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== 'comments') continue;
        try {
          await processComment(entry.id, change.value);
        } catch (error) {
          console.error('[instagram-webhook] comment processing failed', error instanceof Error ? error.name : 'UnknownError');
        }
      }
    }
  });

  return NextResponse.json({ status: 'received' }, { status: 200 });
}

async function processComment(
  instagramUserId: string | undefined,
  value: InstagramCommentChange['value'],
): Promise<void> {
  const commentId = typeof value?.id === 'string' ? value.id : '';
  const commentText = typeof value?.text === 'string' ? value.text.slice(0, 5000) : '';
  const mediaId = typeof value?.media?.id === 'string' ? value.media.id : null;
  const commenterId = typeof value?.from?.id === 'string' ? value.from.id : '';

  if (!instagramUserId || !/^\d+$/.test(instagramUserId) || !/^\d+$/.test(commentId) || !commenterId) {
    console.warn('[instagram-webhook] ignored malformed comment event');
    return;
  }

  const db = adminClient();
  const { data: connection, error: connectionError } = await db
    .from('instagram_connections')
    .select('id, account_id, instagram_user_id, status')
    .eq('instagram_user_id', instagramUserId)
    .eq('status', 'connected')
    .maybeSingle();

  if (connectionError || !connection) {
    console.warn('[instagram-webhook] no active connection for comment event');
    return;
  }

  const { data: event, error: claimError } = await db
    .from('instagram_comment_events')
    .insert({
      account_id: connection.account_id,
      connection_id: connection.id,
      comment_id: commentId,
      media_id: mediaId,
      status: 'processing',
      attempts: 1,
    })
    .select('id')
    .single();

  if (claimError?.code === '23505') return;
  if (claimError || !event) {
    console.error('[instagram-webhook] could not claim comment event', claimError?.code ?? 'unknown');
    return;
  }

  const mark = async (status: 'sent' | 'failed' | 'skipped', fields: Record<string, unknown> = {}) => {
    const { error } = await db
      .from('instagram_comment_events')
      .update({ status, processed_at: new Date().toISOString(), ...fields })
      .eq('id', event.id)
      .eq('account_id', connection.account_id);
    if (error) console.error('[instagram-webhook] event status update failed', error.code ?? 'unknown');
  };

  // The account must never DM itself. Record the event as skipped to make
  // retries deterministic.
  if (commenterId === instagramUserId) {
    await mark('skipped', { last_error_code: 'own_comment' });
    return;
  }

  const { data: rules, error: rulesError } = await db
    .from('instagram_comment_rules')
    .select('id, keywords, match_type, reply_text')
    .eq('connection_id', connection.id)
    .eq('account_id', connection.account_id)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (rulesError) {
    await mark('failed', { last_error_code: 'rule_lookup_failed' });
    return;
  }

  const rule = (rules ?? []).find((candidate: {
    id: string;
    keywords: string[] | null;
    match_type: string;
    reply_text: string;
  }) => matchesInstagramKeyword(
    commentText,
    candidate.keywords ?? [],
    (['contains', 'exact', 'word'].includes(candidate.match_type)
      ? candidate.match_type
      : 'contains') as InstagramKeywordMatchType,
  ));

  if (!rule) {
    await mark('skipped', { last_error_code: 'no_keyword_match' });
    return;
  }

  const { data: secret, error: secretError } = await db
    .from('instagram_connection_secrets')
    .select('access_token_encrypted')
    .eq('connection_id', connection.id)
    .eq('account_id', connection.account_id)
    .maybeSingle();

  if (secretError || !secret) {
    await mark('failed', { rule_id: rule.id, last_error_code: 'credential_missing' });
    return;
  }

  let accessToken: string;
  try {
    accessToken = decrypt(secret.access_token_encrypted);
  } catch {
    await mark('failed', { rule_id: rule.id, last_error_code: 'credential_decrypt_failed' });
    return;
  }

  // Private replies are addressed to the comment ID, not the commenter ID.
  // Meta permits only one private reply per comment within its documented
  // window. We deliberately do not retry ambiguous send outcomes.
  const endpoint = `https://graph.instagram.com/${GRAPH_API_VERSION}/${instagramUserId}/messages`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { comment_id: commentId },
        message: { text: rule.reply_text },
      }),
      cache: 'no-store',
    });
  } catch {
    await mark('failed', { rule_id: rule.id, last_error_code: 'provider_network_error' });
    return;
  }

  const responseBody: unknown = await response.json().catch(() => null);
  const body = responseBody && typeof responseBody === 'object'
    ? responseBody as Record<string, unknown>
    : {};
  if (!response.ok || typeof body.message_id !== 'string') {
    const nestedError = body.error && typeof body.error === 'object'
      ? body.error as Record<string, unknown>
      : {};
    const providerCode = typeof nestedError.code === 'number'
      ? String(nestedError.code)
      : 'provider_rejected';
    await mark('failed', { rule_id: rule.id, last_error_code: providerCode });
    console.warn('[instagram-webhook] private reply rejected', providerCode);
    return;
  }

  await mark('sent', {
    rule_id: rule.id,
    provider_message_id: body.message_id,
    last_error_code: null,
  });
}
