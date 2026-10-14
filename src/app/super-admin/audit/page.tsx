import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import {
  PlatformAdminAuthError,
  logPlatformAdminEvent,
  requirePlatformAdmin,
} from '@/lib/platform-admin/auth';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Audit Trail · Super Admin',
  robots: { index: false, follow: false, nocache: true },
};

type SearchParams = Promise<{ page?: string }>;

const SAFE_METADATA_KEYS = [
  'page',
  'query_used',
  'query_errors',
  'rows_returned',
  'query_error',
] as const;

type AuditEvent = {
  id: number;
  actor_user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function safeMetadata(metadata: AuditEvent['metadata']) {
  if (!metadata) return [];
  return SAFE_METADATA_KEYS.flatMap((key) => {
    if (!(key in metadata)) return [];
    const value = metadata[key];
    if (
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'boolean' &&
      value !== null
    ) return [];
    return [{ key, value: value === null ? 'null' : String(value) }];
  });
}

export default async function SuperAdminAuditPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  let context;
  try {
    context = await requirePlatformAdmin();
  } catch (error) {
    if (error instanceof PlatformAdminAuthError) {
      if (error.status === 401) redirect('/login?next=%2Fsuper-admin%2Faudit');
      if (error.status === 403) redirect('/dashboard');
      return <main className="mx-auto max-w-3xl p-6 text-sm text-muted-foreground">Audit trail temporarily unavailable. Verify server configuration.</main>;
    }
    throw error;
  }

  const params = await searchParams;
  const parsedPage = Number.parseInt(params.page ?? '1', 10);
  const page = Number.isFinite(parsedPage) ? Math.min(10_000, Math.max(1, parsedPage)) : 1;
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  const { data, count, error } = await context.admin
    .from('platform_admin_audit_log')
    .select('id,actor_user_id,action,target_type,target_id,metadata,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const events = (data ?? []) as AuditEvent[];

  await logPlatformAdminEvent({
    actorUserId: context.userId,
    action: 'audit_trail.viewed',
    targetType: 'platform',
    metadata: { page, query_errors: Number(Boolean(error)) },
  });

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const pageUrl = (nextPage: number) => `/super-admin/audit?page=${nextPage}`;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-3">
        <Link href="/super-admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to overview
        </Link>
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-border bg-muted p-3">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Platform audit trail</h1>
            <p className="mt-1 text-sm text-muted-foreground">Recent privileged access events. This view deliberately displays only approved, non-secret metadata fields.</p>
          </div>
        </div>
      </header>

      {error ? (
        <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-foreground">
          Audit events could not be loaded. Confirm migration 043 is applied to this Supabase project and check server logs for the database error code.
        </div>
      ) : (
        <>
          <section className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              { (count ?? 0).toLocaleString() } recorded events · showing up to {pageSize} per page
            </p>
          </section>
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            {events.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No audit events are recorded on this page yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {events.map((event) => (
                  <article key={event.id} className="space-y-3 p-5">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <h2 className="break-words font-semibold text-foreground">{event.action}</h2>
                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          Actor: {event.actor_user_id ?? 'System / deleted user'}
                        </p>
                      </div>
                      <time dateTime={event.created_at} className="shrink-0 text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </time>
                    </div>
                    {(event.target_type || event.target_id) && (
                      <p className="break-all text-xs text-muted-foreground">
                        Target: {event.target_type ?? 'unspecified'}{event.target_id ? ` · ${event.target_id}` : ''}
                      </p>
                    )}
                    {safeMetadata(event.metadata).length > 0 && (
                      <dl className="flex flex-wrap gap-2">
                        {safeMetadata(event.metadata).map(({ key, value }) => (
                          <div key={key} className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
                            <dt className="inline font-medium text-foreground">{key}: </dt>
                            <dd className="inline break-all text-muted-foreground">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
          <nav aria-label="Audit result pages" className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={pageUrl(page - 1)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Previous</Link>}
              {page < totalPages && <Link href={pageUrl(page + 1)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Next</Link>}
            </div>
          </nav>
        </>
      )}
    </main>
  );
}
