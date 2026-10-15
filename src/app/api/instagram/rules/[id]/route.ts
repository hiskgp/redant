import { NextResponse } from 'next/server';

import { requireRole, toErrorResponse } from '@/lib/auth/account';

const MATCH_TYPES = ['contains', 'exact', 'word'] as const;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase, accountId } = await requireRole('admin');
    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: 'Invalid rule ID.' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid rule update.' }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const patch: Record<string, unknown> = {};

    if (input.is_active !== undefined) {
      if (typeof input.is_active !== 'boolean') {
        return NextResponse.json({ error: 'is_active must be a boolean.' }, { status: 400 });
      }
      if (input.is_active && process.env.INSTAGRAM_AUTOMATION_ENABLED !== 'true') {
        return NextResponse.json({
          error: 'Instagram automation is paused until Meta webhook setup and live private-reply tests are verified.',
        }, { status: 409 });
      }
      patch.is_active = input.is_active;
    }

    if (input.name !== undefined) {
      if (typeof input.name !== 'string' || !input.name.trim() || input.name.trim().length > 80) {
        return NextResponse.json({ error: 'Rule name must be 1–80 characters.' }, { status: 400 });
      }
      patch.name = input.name.trim();
    }

    if (input.reply_text !== undefined) {
      if (typeof input.reply_text !== 'string' || !input.reply_text.trim() || input.reply_text.trim().length > 1000) {
        return NextResponse.json({ error: 'Reply must be 1–1000 characters.' }, { status: 400 });
      }
      patch.reply_text = input.reply_text.trim();
    }

    if (input.keywords !== undefined) {
      if (!Array.isArray(input.keywords)) {
        return NextResponse.json({ error: 'Keywords must be a list.' }, { status: 400 });
      }
      const keywords = input.keywords.filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim()).filter(Boolean);
      if (keywords.length < 1 || keywords.length > 20 || keywords.some((keyword) => keyword.length > 50)) {
        return NextResponse.json({ error: 'Provide 1–20 keywords, each up to 50 characters.' }, { status: 400 });
      }
      patch.keywords = [...new Set(keywords)];
    }

    if (input.match_type !== undefined) {
      if (typeof input.match_type !== 'string' || !MATCH_TYPES.includes(input.match_type as typeof MATCH_TYPES[number])) {
        return NextResponse.json({ error: 'Invalid keyword match type.' }, { status: 400 });
      }
      patch.match_type = input.match_type;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No supported fields to update.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('instagram_comment_rules')
      .update(patch)
      .eq('id', id)
      .eq('account_id', accountId)
      .select('id, name, keywords, match_type, reply_text, is_active, created_at, updated_at')
      .maybeSingle();

    if (error) {
      console.error('[instagram-rules] update failed', error.code ?? 'unknown');
      return NextResponse.json({ error: 'Could not update the Instagram rule.' }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Instagram rule not found.' }, { status: 404 });

    return NextResponse.json({ rule: data });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase, accountId } = await requireRole('admin');
    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: 'Invalid rule ID.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('instagram_comment_rules')
      .delete()
      .eq('id', id)
      .eq('account_id', accountId)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('[instagram-rules] delete failed', error.code ?? 'unknown');
      return NextResponse.json({ error: 'Could not delete the Instagram rule.' }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Instagram rule not found.' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
