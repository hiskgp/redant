import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const STALE_PROCESSING_MINUTES = 10;

function constantTimeEqual(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorized(request: Request): boolean {
  const expected = process.env.INSTAGRAM_CRON_SECRET;
  if (!expected) return false;

  const authorization = request.headers.get('authorization') ?? '';
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const custom = request.headers.get('x-cron-secret') ?? '';
  return constantTimeEqual(bearer, expected) || constantTimeEqual(custom, expected);
}

export async function GET(request: Request) {
  if (!process.env.INSTAGRAM_CRON_SECRET) {
    return NextResponse.json({ error: 'Instagram event recovery is not configured.' }, { status: 503 });
  }
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Instagram event recovery is not configured.' }, { status: 503 });
  }

  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const cutoff = new Date(Date.now() - STALE_PROCESSING_MINUTES * 60 * 1000).toISOString();

  // Quarantine only; never send again from this maintenance job. A crash can
  // occur after Meta accepted the private reply but before our DB was updated.
  const { data, error } = await db
    .from('instagram_comment_events')
    .update({
      status: 'review_required',
      processed_at: new Date().toISOString(),
      last_error_code: 'processing_interrupted_manual_review',
    })
    .eq('status', 'processing')
    .lt('received_at', cutoff)
    .select('id');

  if (error) {
    console.error('[instagram-event-recovery] quarantine failed', error.code ?? 'unknown');
    return NextResponse.json({ error: 'Could not quarantine interrupted Instagram events.' }, { status: 500 });
  }

  return NextResponse.json({
    quarantined: data?.length ?? 0,
    action: 'manual_review_required_no_automatic_retry',
  });
}
