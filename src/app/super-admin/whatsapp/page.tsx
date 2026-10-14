import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Wifi } from 'lucide-react';

import {
  PlatformAdminAuthError,
  logPlatformAdminEvent,
  requirePlatformAdmin,
} from '@/lib/platform-admin/auth';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'WhatsApp Diagnostics · Super Admin',
  robots: { index: false, follow: false, nocache: true },
};

export default async function SuperAdminWhatsAppPage() {
  let context;
  try {
    context = await requirePlatformAdmin();
  } catch (error) {
    if (error instanceof PlatformAdminAuthError) {
      if (error.status === 401) redirect('/login?next=%2Fsuper-admin%2Fwhatsapp');
      if (error.status === 403) redirect('/dashboard');
      return <main className="p-6 text-sm text-muted-foreground">WhatsApp diagnostics temporarily unavailable. Verify server configuration.</main>;
    }
    throw error;
  }

  // Never select access_token or verify_token from this table.
  const { data: configurations, error } = await context.admin
    .from('whatsapp_config')
    .select('id,account_id,phone_number_id,waba_id,status,connected_at,updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);

  const rows = configurations ?? [];
  const accountIds = [...new Set(rows.map((row: { account_id: string }) => row.account_id))];
  const accountResult = accountIds.length
    ? await context.admin.from('accounts').select('id,name').in('id', accountIds)
    : { data: [], error: null };
  const accountNames = new Map((accountResult.data ?? []).map((account: { id: string; name: string }) => [account.id, account.name]));

  await logPlatformAdminEvent({
    actorUserId: context.userId,
    action: 'whatsapp_diagnostics.viewed',
    targetType: 'platform',
    metadata: { rows_returned: rows.length, query_error: Boolean(error || accountResult.error) },
  });

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-3">
        <Link href="/super-admin/audit" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">Audit trail</Link>
        <Link href="/super-admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to overview
        </Link>
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-border bg-muted p-3"><Wifi className="h-5 w-5 text-primary" aria-hidden="true" /></span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">WhatsApp diagnostics</h1>
            <p className="mt-1 text-sm text-muted-foreground">Stored connection state only; live Meta API health and webhook delivery are not checked by this read-only view.</p>
          </div>
        </div>
      </header>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        Raw access tokens and verification tokens are not queried or displayed on this page.
      </div>

      {error || accountResult.error ? (
        <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-foreground">
          WhatsApp configuration data could not be fully loaded. Check server logs; no secret fields were requested.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Recent configurations</h2>
          <p className="mt-1 text-xs text-muted-foreground">Showing up to 100 most recently updated connections</p>
        </div>
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">{error ? 'Connection data is unavailable.' : 'No WhatsApp configurations found.'}</p>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((row: { id: string; account_id: string; phone_number_id: string; waba_id: string | null; status: string; connected_at: string | null; updated_at: string }) => (
              <article key={row.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-foreground">{accountNames.get(row.account_id) ?? 'Unknown account'}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Account ID: {row.account_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone number ID</p>
                  <p className="mt-1 break-all text-sm text-foreground">{row.phone_number_id}</p>
                  <p className="mt-1 text-xs text-muted-foreground">WABA: {row.waba_id ?? 'Not recorded'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stored status</p>
                  <p className="mt-1 text-sm text-foreground">{row.status}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Updated {new Date(row.updated_at).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Connected: {row.connected_at ? new Date(row.connected_at).toLocaleDateString('en-IN') : 'Not recorded'}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
