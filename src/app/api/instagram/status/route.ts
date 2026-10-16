import { NextResponse } from 'next/server';

import { requireRole, toErrorResponse } from '@/lib/auth/account';

export async function GET() {
  try {
    const { supabase, accountId } = await requireRole('viewer');
    const { data, error } = await supabase
      .from('instagram_connections')
      .select('id, instagram_user_id, username, status, token_expires_at, last_synced_at, last_error_code')
      .eq('account_id', accountId)
      .maybeSingle();

    if (error) {
      console.error('[instagram-status] metadata query failed', error.code ?? 'unknown');
      return NextResponse.json({ error: 'Could not load Instagram connection status.' }, { status: 500 });
    }

    return NextResponse.json({
      automation_enabled: process.env.INSTAGRAM_AUTOMATION_ENABLED === 'true',
      connection: data
        ? {
            id: data.id,
            instagram_user_id: data.instagram_user_id,
            username: data.username,
            status: data.status,
            token_expires_at: data.token_expires_at,
            last_synced_at: data.last_synced_at,
          }
        : null,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
