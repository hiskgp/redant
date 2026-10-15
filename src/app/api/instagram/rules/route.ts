import { NextResponse } from 'next/server';

import { requireRole, toErrorResponse } from '@/lib/auth/account';

const MATCH_TYPES = ['contains', 'exact', 'word'] as const;

function validateRule(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const value = body as Record<string, unknown>;
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const replyText = typeof value.reply_text === 'string' ? value.reply_text.trim() : '';
  const keywords = Array.isArray(value.keywords)
    ? value.keywords.filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim()).filter(Boolean)
    : [];
  const matchType = typeof value.match_type === 'string' && MATCH_TYPES.includes(value.match_type as typeof MATCH_TYPES[number])
    ? value.match_type
    : 'contains';

  if (!name || name.length > 80) return null;
  if (!replyText || replyText.length > 1000) return null;
  if (keywords.length < 1 || keywords.length > 20 || keywords.some((keyword) => keyword.length > 50)) return null;
  return { name, reply_text: replyText, keywords: [...new Set(keywords)], match_type: matchType };
}

export async function GET() {
  try {
    const { supabase, accountId } = await requireRole('admin');
    const { data: connection, error: connectionError } = await supabase
      .from('instagram_connections')
      .select('id, status')
      .eq('account_id', accountId)
      .maybeSingle();

    if (connectionError) {
      return NextResponse.json({ error: 'Could not load Instagram connection.' }, { status: 500 });
    }
    if (!connection) return NextResponse.json({ connection: null, rules: [] });

    const { data: rules, error } = await supabase
      .from('instagram_comment_rules')
      .select('id, name, keywords, match_type, reply_text, is_active, created_at, updated_at')
      .eq('account_id', accountId)
      .eq('connection_id', connection.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[instagram-rules] list failed', error.code ?? 'unknown');
      return NextResponse.json({ error: 'Could not load Instagram rules.' }, { status: 500 });
    }

    return NextResponse.json({
      connection: { status: connection.status },
      rules: rules ?? [],
      automation_enabled: process.env.INSTAGRAM_AUTOMATION_ENABLED === 'true',
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, accountId, userId } = await requireRole('admin');
    const body = await request.json().catch(() => null);
    const rule = validateRule(body);
    if (!rule) {
      return NextResponse.json({
        error: 'Provide a rule name, 1–20 keywords, and a reply of 1–1000 characters.',
      }, { status: 400 });
    }

    const { data: connection, error: connectionError } = await supabase
      .from('instagram_connections')
      .select('id, status')
      .eq('account_id', accountId)
      .maybeSingle();

    if (connectionError || !connection || connection.status !== 'connected') {
      return NextResponse.json({ error: 'Connect an Instagram professional account before creating rules.' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('instagram_comment_rules')
      .insert({
        ...rule,
        account_id: accountId,
        connection_id: connection.id,
        created_by_user_id: userId,
        is_active: false,
      })
      .select('id, name, keywords, match_type, reply_text, is_active, created_at, updated_at')
      .single();

    if (error || !data) {
      console.error('[instagram-rules] create failed', error?.code ?? 'unknown');
      return NextResponse.json({ error: 'Could not save the Instagram rule.' }, { status: 500 });
    }

    return NextResponse.json({ rule: data }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
