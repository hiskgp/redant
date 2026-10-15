# RedANT Instagram-First Revenue MVP

## Decision

Use a combined go-to-market model:
1. Offer a done-for-you Instagram automation setup to earn setup revenue from early customers.
2. Convert customers to a recurring RedANT subscription for continued automation, monitoring, and improvements.
3. Keep WhatsApp as a follow-on channel; do not mark Instagram automation as production-ready until Meta permissions, account eligibility, and live message flows are verified.

## First market

Start with Tamil Nadu boutiques and clothing stores that already receive Instagram comments and DMs. Expand to jewellery, beauty, creators, and broader D2C only after the first pilot results.

## MVP scope (in order)

### Phase 0 — Validate demand before building
- Speak with at least 10 relevant business owners.
- Ask how many DMs/comments they receive, what questions repeat, what is missed, and what they would pay to solve it.
- Offer a clearly scoped paid pilot to 3–5 businesses; do not promise unavailable features.
- Record objections, willingness to pay, and the most requested workflow.

### Phase 1 — Meta and repository readiness audit
- Review the existing RedANT architecture, auth/account model, automation engine, webhook patterns, secrets handling, database RLS, and audit logging.
- Confirm current official Meta Instagram API requirements and eligible professional account types.
- Confirm the exact app permissions, review requirements, webhook subscriptions, messaging-window rules, and comment-to-private-reply constraints.
- Decide the supported connection flow before implementing OAuth or storing tokens.
- Keep Instagram credentials separate from WhatsApp credentials and encrypt tokens at rest using existing secure patterns.

### Phase 2 — Smallest sellable workflow
- Connect an eligible Instagram professional account through Meta's official flow.
- Receive and verify supported webhooks.
- Configure a keyword-based comment trigger and send a permitted private reply where Meta rules allow it.
- Add safe deduplication, retries, rate limiting, idempotency, audit events, and visible error states.
- Provide a manual pause/disable control and human handoff.
- Do not implement cold-DM blasts, unrestricted follow-ups, or bypasses for Meta messaging restrictions.

### Phase 3 — Paid setup and recurring plan
- Proposed pricing to test, not yet validated:
  - Starter: ₹499/month for a tightly limited basic workflow.
  - Growth: ₹999/month for comment-to-DM and lead capture.
  - AI Pro: ₹1,999/month for AI replies and advanced workflows, only after usage costs and safety controls are measured.
- Consider a one-time setup fee for done-for-you onboarding; validate the amount in customer interviews before publishing it.
- State message/automation limits, support scope, AI usage limits, cancellation terms, and any third-party charges clearly.
- Track activation, weekly usage, successful automations, support burden, conversion to paid, churn, and gross margin.

## Initial acceptance criteria

- At least 10 customer interviews completed and findings recorded.
- At least 3 businesses agree to a paid pilot before expanding scope.
- A test Instagram professional account completes the approved Meta connection flow.
- Webhook signature/verification, deduplication, permission errors, and unsupported-account cases have automated tests.
- A supported comment trigger produces exactly one policy-compliant private reply in a real test.
- Customer data is tenant-isolated and access-controlled; tokens are never logged in plaintext.
- Automation can be paused and every execution has a diagnosable status.
- Production readiness is declared only after live Meta and database persistence tests pass.

## Immediate next actions

1. Audit current code for reusable automation engine, account membership, webhook verification, logging, and encryption.
2. Verify current official Meta documentation and dashboard requirements.
3. Prepare a one-page pilot offer and start customer discovery in parallel with the technical audit.
4. Implement only the smallest validated workflow, on a feature branch, with tests and CI passing.
5. Keep WhatsApp Embedded Signup work tracked separately so the existing integration is not destabilized.

## Revenue model hypothesis

Setup fee + recurring subscription is the initial hypothesis because it can generate service revenue while the SaaS workflow is being validated. Do not assume demand from the addressable market alone; validate willingness to pay and delivery effort with real businesses.
