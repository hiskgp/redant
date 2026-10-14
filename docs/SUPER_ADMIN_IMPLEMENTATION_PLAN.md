# RedANT Super Admin — implementation plan

## Audit findings (repository: `hiskgp/redant`, branch `main`)

Inspected the current auth and data model before designing this feature:

- Next.js App Router with Supabase SSR cookies; `src/middleware.ts` authenticates users and currently protects customer-dashboard paths, but does not provide platform-admin authorization.
- Customer/team roles already exist as `profiles.account_role` with `owner | admin | agent | viewer`. These are tenant roles and must **not** be reused as RedANT platform-admin roles.
- `profiles.role` is explicitly marked legacy/unused in migration 017. Do not use it for platform authorization.
- Migration 034 protects `profiles.account_role` and `profiles.account_id` from direct authenticated updates. Preserve that trigger and all existing account/tenant RLS policies.
- The app already has a server-side service-role client helper at `src/lib/flows/admin-client.ts`. Service-role access bypasses RLS and must only be used server-side, with every query deliberately scoped.
- Existing business data includes `accounts`, `profiles`, and `whatsapp_config`. The migrations inspected do not establish a complete subscription/payment ledger, so billing/MRR cannot be shown as real data until a billing schema/provider integration exists.
- The existing WhatsApp configuration route includes encrypted token handling and Meta diagnostics. Super Admin screens should show health/status and safe error metadata, never raw access tokens, app secrets, or verification tokens.
- Repo scripts include `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build`. This connector-based change cannot run those scripts against a local checkout, so CI/build verification remains required.

## Security model

1. **Separate platform authorization from tenant roles.** Use a new `platform_admins` allow-list keyed by Supabase Auth user UUID. No public signup path can add rows.
2. **Fail closed.** Every Super Admin server page/API checks the authenticated Supabase user and active allow-list membership. A hidden link or middleware rule is not authorization.
3. **Keep the allow-list private.** Enable RLS and revoke Data API access for `anon` and `authenticated`; server-side service-role code reads it only after validating the user session.
4. **No self-promotion.** Do not accept role/admin status from request bodies, query strings, profile fields, or browser state. Bootstrap the first platform admin manually through a trusted Supabase SQL Editor session.
5. **Audit privileged actions.** Store actor, action, target, timestamp, and non-secret metadata. Never write credentials, message bodies, or raw customer secrets to audit metadata.
6. **Tenant safety.** Cross-tenant customer-management actions must be explicit, server-side, validated, and audited. Customer tenant roles remain separate.
7. **Secrets.** `SUPABASE_SERVICE_ROLE_KEY` and Meta credentials remain server-only. Never return secret fields from admin APIs.

## Scope and rollout

### Phase 0 — secure foundation (this PR)
- Add private platform-admin allow-list and audit table in a new migration; do not rewrite prior migrations.
- Add a server-only `requirePlatformAdmin` guard backed by Supabase Auth plus the allow-list.
- Add a protected, no-index `/super-admin` overview with live counts for accounts, user profiles, and connected WhatsApp configurations.
- Record overview access without making the dashboard fail if audit logging itself is temporarily unavailable.
- Document the one-time, trusted manual bootstrap and deployment verification.

### Phase 1 — customer operations
- Paginated account/customer search, account status, creation date, member count, WhatsApp connection status.
- Suspend/reactivate only after adding an explicit account-status model and checking all login/API paths; never silently delete customer data.
- Customer detail page with tenant-scoped diagnostics and safe support notes.

### Phase 2 — billing and plans
- Define authoritative plan, subscription, invoice/payment, renewal, currency, and entitlement tables or integrate a billing provider.
- Display real MRR only from reconciled active subscriptions; do not infer revenue from a hardcoded price table.
- Keep payment actions idempotent and audit all plan/entitlement changes.

### Phase 3 — WhatsApp / Meta operations
- Connection status, last successful check, WABA/phone-number identifiers (as appropriate), webhook/subscription status, Embedded Signup outcome, and sanitized error code / fbtrace ID.
- Do not reveal raw access tokens. Add safe re-check/retry operations with rate limits and audit events.
- Meta app review/business verification and WABA asset permissions still require external Meta-dashboard verification.

### Phase 4 — logs, staff access, and hardening
- Structured error events with correlation IDs, retention limits, redaction, filters, and export controls.
- Optional Support Admin role with narrower permissions; platform-admin roster changes remain owner-controlled.
- MFA/step-up verification for destructive actions, rate limiting, security headers, alerting, and periodic access review.
- Automated SQL/RLS tests for allowed and denied cases; verify with `supabase test db` where the local Supabase test stack is available.

## Acceptance criteria

- Anonymous visitors and ordinary signed-in users cannot open `/super-admin` or its API.
- A tenant account owner is **not** automatically a RedANT platform admin.
- Changing `profiles.role` or `profiles.account_role` cannot grant platform access.
- No existing customer RLS policy is broadened or removed.
- Admin metrics come from the database and handle query errors explicitly.
- No secret is returned to the browser or written to audit logs.
- Bootstrap is manual, auditable, and uses the trusted Auth user UUID.
- Typecheck, unit tests, lint, production build, and live database/RLS checks pass before merging/deploying.

## One-time bootstrap (trusted operator only)

After applying the new migration, replace the email placeholder with the exact email of the already-created RedANT owner login and run this only in the correct Supabase project's SQL Editor:

```sql
insert into public.platform_admins (user_id, note)
select id, 'Initial RedANT platform owner'
from auth.users
where lower(email) = lower('REPLACE_WITH_OWNER_LOGIN_EMAIL')
on conflict (user_id) do update
set active = true,
    note = excluded.note;
```

Before running, confirm the selected row is the intended account in the intended Supabase project. This migration intentionally does **not** auto-promote anyone and does not create a default admin identity.
