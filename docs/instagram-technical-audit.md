# Instagram Automation — Repository Technical Audit

Audit date: 2026-10-15
Repository: `hiskgp/redant`, default branch `main`

This is a code-read audit, not a live Meta connection test. No production Instagram account was connected and no messages were sent during this audit.

## Findings from the current code

### Reusable foundations
- Next.js App Router API routes are the existing backend convention.
- Supabase account tenancy is established through `accounts`, `profiles.account_id`, and account-aware data access. The current automation engine filters automations by `account_id` and verifies contact ownership before dispatch.
- `src/lib/whatsapp/webhook-signature.ts` verifies Meta's `x-hub-signature-256` over the raw request body, fails closed if `META_APP_SECRET` is missing, supports multiple app secrets, and uses constant-time comparison. It is WhatsApp-named today and should not be imported blindly into an Instagram route until shared ownership/configuration requirements are clarified.
- `src/lib/whatsapp/encryption.ts` provides authenticated AES-256-GCM encryption for tokens and supports decrypt-only legacy CBC data. An Instagram integration should use a channel-neutral secure-token abstraction or a carefully tested reuse of this helper, not plaintext token columns.
- Existing structured diagnostic logging patterns can be adapted, with strict allowlists and no access tokens, auth codes, raw payloads, or customer message contents in logs.
- Existing Vitest coverage and CI scripts provide a path for unit and route regression tests.

### Gaps that block a production Instagram feature
- No Instagram-specific API route or Instagram integration file appeared in the repository path audit.
- `AutomationTriggerType` currently contains WhatsApp/CRM events only; there is no Instagram comment trigger.
- Existing `send_message` automation steps call the WhatsApp sender. They cannot safely be repurposed as Instagram sends without an explicit channel model and sender implementation.
- The current WhatsApp account configuration is not a suitable place to store Instagram account IDs/tokens. Instagram connection data needs a separate table or channel connection model, account-scoped policies, unique constraints, status fields, and encrypted token storage.
- Existing WhatsApp webhook signature helper is bound to the shared Meta app-secret env var and can be a starting point only after deciding whether Instagram uses the same Meta app, secret rotation strategy, and webhook verification configuration.
- No live Instagram OAuth, webhook subscription, comment private-reply, or database persistence test has been performed in this audit.

## Recommended implementation design

### 1. Separate Instagram connection model
Add a dedicated migration for an Instagram connection table, scoped by RedANT `account_id`. Before finalizing columns, confirm the chosen Meta login path and exact identifiers returned by the API. At minimum, plan for:
- primary key and `account_id` foreign key;
- Instagram professional account ID and display username/name if available;
- encrypted access token, token expiry/refresh metadata only as supported by the chosen auth flow;
- connection status and timestamps;
- unique constraints preventing the same provider account being claimed incorrectly;
- RLS that follows existing account membership/role rules;
- service-role-only token access, with no token returned to browser clients.

Never store Instagram credentials in `whatsapp_config`.

### 2. Dedicated Instagram API and webhook boundary
- Implement authenticated connect/callback routes using the selected official Meta login method and state/CSRF protection.
- Implement webhook verification and POST signature verification against the raw request body; reject invalid signatures.
- Subscribe only to the required webhook fields after verifying exact requirements in Meta's current official documentation and App Dashboard.
- Parse and validate webhook payloads as untrusted external input.
- Persist a deduplication key for provider event/comment IDs before sending a reply. Retries must not create duplicate replies.
- Use sanitized structured diagnostics with request/event IDs, stage, provider status/error codes, and no tokens, authorization codes, raw message bodies, or full webhook payloads.

### 3. Explicit channel-aware automation
Do not change the meaning of existing WhatsApp triggers or send steps. Introduce Instagram as an explicit channel only after its data model and supported workflows are agreed:
- Instagram comment/private-reply trigger is distinct from an inbound DM trigger.
- Instagram sending uses the official Instagram Messaging API and its permission/eligibility/messaging-window rules.
- Existing WhatsApp sender and behavior remain unchanged.
- Each execution must be account-scoped, idempotent, pausable, rate-limited, and observable.
- Human handoff and an account-level automation pause must be available before customer pilots.

### 4. Test plan
Unit and integration tests must cover:
- malformed and forged webhook signatures;
- valid signatures and webhook verification challenge;
- unsupported/invalid payloads;
- duplicate webhook deliveries and repeated comment events;
- disconnected or unsupported accounts and missing permissions;
- encrypted token round-trip and absence of token/code/message-body leakage in logs;
- account isolation and attempts to use another tenant's connection;
- Meta API errors, retryable failures, rate limits, and safe retry behavior;
- pause/disable behavior;
- exactly one permitted private reply in a live Meta test account.

## Go/no-go gates

Do not claim the feature is production-ready until:
1. Meta app permissions, login method, webhook fields, and review requirements are verified in current official documentation and the actual app dashboard.
2. A test Instagram Professional account connects through the intended flow.
3. The account record persists to Supabase and appears in the UI after refresh.
4. A supported test comment triggers one permitted private reply, with duplicates suppressed.
5. CI passes and tenant-isolation/security checks are reviewed.
6. A pilot customer has explicitly approved the test and understands the pilot's scope.

## Immediate engineering order

1. Confirm the Meta login/API path and permissions before defining the connection schema.
2. Add the schema and security tests in a feature branch.
3. Add connect/callback and webhook routes with mocked Meta API tests.
4. Add the minimal comment-to-private-reply workflow, event dedupe, pause switch, and diagnostics.
5. Verify against a real test account, then run a paid pilot only after the go/no-go gates pass.

## Official reference starting points

- Meta Instagram API collection: https://www.postman.com/meta/instagram/collection/6yqw8pt/instagram-api
- Meta's Instagram Messaging documentation: https://developers.facebook.com/docs/messenger-platform/instagram
- Private replies feature: https://developers.facebook.com/docs/business-messaging/instagram-messaging/features/private-replies

Re-check these references and the app dashboard immediately before implementation; permissions and onboarding requirements can change.
