import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Search, Wifi } from 'lucide-react';

import {
  PlatformAdminAuthError,
  logPlatformAdminEvent,
  requirePlatformAdmin,
} from '@/lib/platform-admin/auth';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Customer Management · Super Admin',
  robots: { index: false, follow: false, nocache: true },
};

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function SuperAdminCustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  let context;
  try {
    context = await requirePlatformAdmin();
  } catch (error) {
    if (error instanceof PlatformAdminAuthError) {
      if (error.status === 401) redirect('/login?next=%2Fsuper-admin%2Fcustomers');
      if (error.status === 403) redirect('/dashboard');
      return <AdminUnavailable />;
    }
    throw error;
  }

  const params = await searchParams;
  const query = (params.q ?? '').trim().slice(0, 100);
  const requestedPage = Number.parseInt(params.page ?? '1', 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let accountQuery = context.admin
    .from('accounts')
    .select('id,name,owner_user_id,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (query) accountQuery = accountQuery.ilike('name', `%${query.replace(/[,%_]/g, '')}%`);

  const { data: accounts, count, error } = await accountQuery;
  const accountRows = accounts ?? [];
  const accountIds = accountRows.map((account: { id: string }) => account.id);

  const [profileResult, whatsappResult] = accountIds.length
    ? await Promise.all([
        context.admin
          .from('profiles')
          .select('account_id,user_id,full_name,email,account_role')
          .in('account_id', accountIds),
        context.admin
          .from('whatsapp_config')
          .select('account_id,status')
          .in('account_id', accountIds),
      ])
    : [
        { data: [], error: null },
        { data: [], error: null },
      ];

  const profiles = profileResult.data ?? [];
  const configs = whatsappResult.data ?? [];
  const lookupError = Boolean(profileResult.error || whatsappResult.error);

  await logPlatformAdminEvent({
    actorUserId: context.userId,
    action: 'customers.list_viewed',
    targetType: 'platform',
    metadata: { page, query_used: Boolean(query), query_errors: Number(Boolean(error)) + Number(lookupError) },
  });

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const pageUrl = (nextPage: number) => {
    const search = new URLSearchParams();
    if (query) search.set('q', query);
    search.set('page', String(nextPage));
    return `/super-admin/customers?${search.toString()}`;
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-3">
        <Link href="/super-admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to overview
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Customer management</h1>
        <p className="text-sm text-muted-foreground">
          Read-only tenant overview. Account suspension and billing actions are not enabled because the required status and billing models are not yet present.
        </p>
      </header>

      <form action="/super-admin/customers" method="get" className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search customer account names</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            name="q"
            defaultValue={query}
            maxLength={100}
            placeholder="Search account name…"
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <button type="submit" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          Search
        </button>
      </form>

      {(error || lookupError) && (
        <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-foreground">
          Some customer details could not be loaded. No account-changing actions are available on this page.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold text-foreground">Customer accounts</h2>
            <p className="mt-1 text-xs text-muted-foreground">{(count ?? 0).toLocaleString()} matching accounts</p>
          </div>
          <Link href="/super-admin/whatsapp" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <Wifi className="h-4 w-4" aria-hidden="true" /> WhatsApp diagnostics
          </Link>
        </div>
        {accountRows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">{error ? 'Customer data is unavailable.' : 'No matching accounts found.'}</p>
        ) : (
          <div className="divide-y divide-border">
            {accountRows.map((account: { id: string; name: string; owner_user_id: string; created_at: string }) => {
              const members = profiles.filter((profile: { account_id: string }) => profile.account_id === account.id);
              const owner = members.find((profile: { account_role: string | null }) => profile.account_role === 'owner');
              const whatsapp = configs.find((config: { account_id: string }) => config.account_id === account.id);
              return (
                <article key={account.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-foreground">{account.name}</h3>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{owner?.email ?? 'Owner profile unavailable'}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Created {new Date(account.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-border px-3 py-1.5 text-muted-foreground">{members.length} member{members.length === 1 ? '' : 's'}</span>
                    <span className="rounded-full border border-border px-3 py-1.5 text-muted-foreground">
                      WhatsApp: {whatsapp ? whatsapp.status : 'Not configured'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">ID: {account.id}</p>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <nav aria-label="Customer result pages" className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          {page > 1 && <Link href={pageUrl(page - 1)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Previous</Link>}
          {page < totalPages && <Link href={pageUrl(page + 1)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Next</Link>}
        </div>
      </nav>
    </main>
  );
}

function AdminUnavailable() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold text-foreground">Customer management temporarily unavailable</h1>
      <p className="mt-2 text-sm text-muted-foreground">The server could not verify administrator access or the platform-admin configuration.</p>
    </main>
  );
}
