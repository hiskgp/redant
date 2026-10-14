import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  Activity,
  Building2,
  CircleDollarSign,
  ShieldCheck,
  Users,
  Wifi,
} from 'lucide-react';

import {
  logPlatformAdminEvent,
  PlatformAdminAuthError,
  requirePlatformAdmin,
} from '@/lib/platform-admin/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Super Admin',
  robots: { index: false, follow: false, nocache: true },
};

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: typeof Building2;
};

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {metric.value}
          </p>
        </div>
        <span className="rounded-xl border border-border bg-muted p-3">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{metric.detail}</p>
    </section>
  );
}

export default async function SuperAdminPage() {
  let context;
  try {
    context = await requirePlatformAdmin();
  } catch (error) {
    if (error instanceof PlatformAdminAuthError) {
      if (error.status === 401) redirect('/login?next=%2Fsuper-admin');
      if (error.status === 403) redirect('/dashboard');
      return (
        <main className="mx-auto max-w-3xl p-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Super Admin temporarily unavailable
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The server could not verify administrator access. Check the server
            configuration and migration status, then try again.
          </p>
        </main>
      );
    }
    throw error;
  }

  const { admin, userId, email } = context;
  const [accounts, profiles, connected, disconnected] = await Promise.all([
    admin.from('accounts').select('id', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin
      .from('whatsapp_config')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'connected'),
    admin
      .from('whatsapp_config')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'disconnected'),
  ]);

  const queryErrors = [accounts.error, profiles.error, connected.error, disconnected.error]
    .filter(Boolean)
    .map((error) => error?.code ?? 'unknown');

  if (queryErrors.length) {
    // Log codes only; don't leak SQL, row data, or credentials to the browser.
    console.error('[super-admin] overview query failed:', queryErrors);
  }

  await logPlatformAdminEvent({
    actorUserId: userId,
    action: 'overview.viewed',
    targetType: 'platform',
    metadata: { query_errors: queryErrors.length },
  });

  const metrics: Metric[] = [
    {
      label: 'Customer accounts',
      value: accounts.error ? '—' : (accounts.count ?? 0).toLocaleString(),
      detail: 'Total tenant accounts in RedANT',
      icon: Building2,
    },
    {
      label: 'User profiles',
      value: profiles.error ? '—' : (profiles.count ?? 0).toLocaleString(),
      detail: 'Members across customer accounts',
      icon: Users,
    },
    {
      label: 'WhatsApp connected',
      value: connected.error ? '—' : (connected.count ?? 0).toLocaleString(),
      detail: 'Configurations marked connected in the database',
      icon: Wifi,
    },
    {
      label: 'Needs attention',
      value: disconnected.error ? '—' : (disconnected.count ?? 0).toLocaleString(),
      detail: 'Configurations marked disconnected',
      icon: Activity,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            Restricted platform access
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            RedANT Super Admin
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Platform health and customer operations. These figures are read
            from the current database, not sample or hardcoded business data.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="mt-1 font-medium text-foreground">{email ?? 'Verified platform admin'}</p>
        </div>
      </header>

      {queryErrors.length > 0 && (
        <div
          role="status"
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-foreground"
        >
          Some metrics could not be loaded. The unavailable values are shown as
          dashes; check server logs for error codes.
        </div>
      )}

      <section aria-labelledby="overview-heading" className="space-y-4">
        <div>
          <h2 id="overview-heading" className="text-lg font-semibold text-foreground">
            Platform overview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Live database counts. A connected status is not a substitute for a
            fresh Meta API health check.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </section>

      <section aria-labelledby="modules-heading" className="space-y-4">
        <div>
          <h2 id="modules-heading" className="text-lg font-semibold text-foreground">
            Admin modules
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The security foundation is in place. The remaining modules are
            deliberately marked planned until their data model and controls are implemented.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ModuleCard
            icon={Building2}
            title="Customer management"
            status="Phase 1 · Planned"
            description="Search accounts, review member counts, inspect status, and suspend/reactivate through audited server actions."
          />
          <ModuleCard
            icon={CircleDollarSign}
            title="Plans & billing"
            status="Phase 2 · Data model required"
            description="Plans, subscriptions, invoices, renewals, entitlements, and reconciled MRR. No billing figures are fabricated."
          />
          <ModuleCard
            icon={Wifi}
            title="WhatsApp & Meta"
            status="Phase 3 · Planned"
            description="Connection checks, webhook health, Embedded Signup diagnostics, and sanitized Meta error details—never raw tokens."
          />
          <ModuleCard
            icon={Activity}
            title="System logs"
            status="Phase 4 · Planned"
            description="Searchable redacted errors, correlation IDs, retention controls, and operational alerts."
          />
          <ModuleCard
            icon={ShieldCheck}
            title="Roles & audit trail"
            status="Foundation · Active"
            description="Private platform-admin allow-list and protected audit storage. Staff role management remains owner-controlled."
          />
        </div>
      </section>

      <footer className="rounded-xl border border-border bg-card p-4 text-xs leading-5 text-muted-foreground">
        Security note: platform-admin access is separate from customer account
        ownership. Service-role credentials remain server-side. Never share or
        paste Supabase or Meta secrets into support notes.
      </footer>
    </main>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  status,
  description,
}: {
  icon: typeof Building2;
  title: string;
  status: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="rounded-xl border border-border bg-muted p-2.5">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </span>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mt-4 text-xs font-medium text-muted-foreground">{status}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </section>
  );
}
