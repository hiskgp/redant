# Instagram Automation — Repository Technical Audit

Audit date: 2026-10-16  
Repository: `hiskgp/redant`  
Feature branch: `feat/instagram-automation-mvp`  
Pull request: https://github.com/hiskgp/redant/pull/28 (draft; not merged)

## Scope and confidence

This is a code and CI audit, not a live Meta integration test. No live Instagram account, webhook delivery, or private reply has been verified by this audit. The feature is **not production-ready** until the live go/no-go checks below pass.

## Implemented on the feature branch

- Account-scoped Instagram connection metadata, separate encrypted-token storage, keyword rules, and a comment-event idempotency ledger in migrations 044 and 045.
- Instagram Login OAuth connect/callback, account/admin checks, state-cookie validation, token exchange, and connection status/disconnect APIs.
- Instagram settings UI and keyword rule management.
- Webhook GET verification and POST raw-body signature verification; outbound private replies are guarded by the global `INSTAGRAM_AUTOMATION_ENABLED=false` safety switch.
- Duplicate comment IDs are rejected by a database uniqueness constraint before any send attempt. Ambiguous send outcomes are not automatically retried.
- Token-refresh endpoint and scheduled cron entry.
- Stale `processing` events are quarantined as `review_required` for manual review; the recovery job never automatically resends a private reply.
- Unit tests for OAuth helper and keyword matching, plus schema verification for the Instagram tables and key security boundaries.

## CI and deployment checks

For commit `6b777c08279636a6d08b645ce53d6556b87a12fb`:

- GitHub CI run 147: **passed** (lint, typecheck, tests, build).
- Migration workflow run 40: **passed** (replay all migrations against a clean database and verify resulting schema).
- Vercel commit check: **success**.

These checks validate code/build/schema replay. They do **not** prove the migration has been applied to the actual Supabase project, that Vercel production cron jobs are active, or that Meta OAuth/webhooks/private replies work against a real account.

## Meta product and messaging constraints

- The implementation targets Instagram API with Instagram Login and uses `instagram_business_basic`, `instagram_business_manage_messages`, and `instagram_business_manage_comments`. Confirm these permissions and product setup in the actual Meta App Dashboard before onboarding users.
- Configure the exact callback URL for each environment in Meta and `INSTAGRAM_REDIRECT_URI`; scheme, host, path, and trailing slash must match.
- Configure webhook callback `/api/instagram/webhook`, the matching `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`, and the required comment subscription for the selected product.
- Private replies are not unrestricted cold DMs. Keep replies tied to the comment and respect Meta's one-private-reply/window rules and all follow-up messaging restrictions.
- Official starting points: https://www.postman.com/meta/instagram/collection/6yqw8pt/instagram-api and https://developers.facebook.com/docs/instagram-platform/private-replies

## Security and operational notes

- Keep access tokens encrypted in `instagram_connection_secrets`; never expose token material through browser-facing status APIs or logs.
- Keep `INSTAGRAM_AUTOMATION_ENABLED=false` until all live tests pass. Connecting an account or activating a draft rule must not by itself enable outbound automation.
- Set `INSTAGRAM_CRON_SECRET` and `CRON_SECRET` to the same strong random value so Vercel Cron's Bearer authorization is accepted. The same cron secret protects token refresh and stale-event recovery routes; do not expose it to the browser.
- `vercel.json` schedules token refresh daily at 06:00 UTC and stale-event recovery at 06:15 UTC. Confirm the jobs appear in the Vercel project's production deployment after merge/deploy.
- Recovery deliberately quarantines stale events rather than resending them. This avoids duplicate private replies if Meta accepted a request before the process or database update failed.
- Migration CI only proves migrations replay on a clean CI database. Review compatibility with the real Supabase project's migration history before applying.
- The MVP allows one Instagram professional account per RedANT account; revisit only if product discovery requires multiple profiles.

## Required live go/no-go checks

1. Review Meta app product, permissions/review status, exact redirect URI, and webhook subscriptions.
2. Apply migrations 044 and 045 to the intended Supabase project using the team's normal migration process.
3. Connect a test Instagram Business/Creator account and confirm the username persists after page refresh.
4. Confirm token ciphertext is stored separately and never returned by status APIs.
5. Deliver a valid comment webhook to the deployed endpoint and confirm signature verification.
6. Verify a matching test comment sends exactly one permitted private reply.
7. Replay the same webhook and confirm no second reply is sent.
8. Test paused automation, no keyword match, disconnected account, provider rejection, token refresh, and stale-event quarantine.
9. Confirm authenticated cron invocations and scheduled jobs in the deployed Vercel project.
10. Only then consider enabling automation for an explicitly approved pilot account.

Until these checks are completed, describe the feature as an implementation-ready **draft MVP**, not a verified or production-ready Instagram automation service.
