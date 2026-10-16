import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { requireRole, toErrorResponse } from '@/lib/auth/account';

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

export async function POST() {
  try {
    const { accountId } = await requireRole('admin');
    const db = adminClient();

    // Stop webhook processing first. Even if a later cleanup step fails,
    // the account is no longer eligible for outbound automation.
    const { data: connection, error: lookupError } = await db
      .from('instagram_connections')
      .select('id')
      .eq('account_id', accountId)
      .maybeSingle();

    if (lookupError) {
      console.error('[instagram-disconnect] connection lookup failed', lookupError.code ?? 'unknown');
      return NextResponse.json({ error: 'Could not disconnect Instagram.' }, { status: 500 });
    }
    if (!connection) return NextResponse.json({ success: true });

    const { error: stopError } = await db
      .from('instagram_connections')
      .update({ status: 'disconnected', last_error_code: null })
      .eq('id', connection.id)
      .eq('account_id', accountId);

    if (stopError) {
      console.error('[instagram-disconnect] status update failed', stopError.code ?? 'unknown');
      return NextResponse.json({ error: 'Could not safely stop Instagram automation.' }, { status: 500 });
    }

    const { error: rulesError } = await db
      .from('instagram_comment_rules')
      .update({ is_active: false })
      .eq('connection_id', connection.id)
      .eq('account_id', accountId);

    const { error: secretError } = await db
      .from('instagram_connection_secrets')
      .delete()
      .eq('connection_id', connection.id)
      .eq('account_id', accountId);

    if (rulesError || secretError) {
      console.error('[instagram-disconnect] cleanup incomplete', rulesError?.code ?? secretError?.code ?? 'unknown');
      return NextResponse.json({
        success: false,
        disconnected: true,
        warning: 'Instagram was disabled, but some stored data could not be cleaned up. Contact support.',
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, disconnected: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
