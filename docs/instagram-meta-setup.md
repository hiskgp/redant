# RedANT Instagram Login — Meta Dashboard Setup

This guide applies to the draft feature in PR #28. Do not enable production comment automation until the live verification checklist passes.

## 1. Choose the Instagram API product

The MVP is designed for **Instagram API with Instagram Login**, which supports Business and Creator accounts without requiring a linked Facebook Page. Current permission names used by the code:

- `instagram_business_basic`
- `instagram_business_manage_messages`
- `instagram_business_manage_comments`

Confirm the product and scopes available to the RedANT Meta App before continuing. Meta may require App Review and Advanced Access before serving accounts outside app roles/testers.

Official starting point: https://www.postman.com/meta/instagram/collection/6yqw8pt/instagram-api

## 2. Configure OAuth redirect URIs

Add the exact URI(s) for the deployment you are testing in the Instagram Login product's valid OAuth redirect URI settings.

Production example:

```text
https://redant.in/api/instagram/callback
```

Staging example:

```text
https://staging.redant.in/api/instagram/callback
```

Local development example:

```text
http://localhost:3000/api/instagram/callback
```

The URI in the Meta Dashboard must exactly match `INSTAGRAM_REDIRECT_URI` for that deployment: scheme, host, path, and trailing-slash behavior must match. Do not use a wildcard. Keep production and staging environment values separate.

## 3. Set server environment variables

Set these in Vercel for the relevant environment:

- `INSTAGRAM_APP_ID`: the Meta App ID configured for Instagram Login. It may be the same ID as `META_APP_ID` if using the same app.
- `INSTAGRAM_APP_SECRET`: the matching Meta App Secret. It may match `META_APP_SECRET`; never use a browser-exposed variable for it.
- `INSTAGRAM_REDIRECT_URI`: the exact callback URI from step 2.
- `INSTAGRAM_GRAPH_API_VERSION`: currently set in the example to `v25.0`; confirm the supported version before launch.
- `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`: generate a long random value and enter the same value in Meta Webhooks.
- `INSTAGRAM_CRON_SECRET`: a separate long random value for token refresh.
- `CRON_SECRET`: set to the same value as `INSTAGRAM_CRON_SECRET`. Vercel Cron uses this environment variable to send the scheduled request's `Authorization: Bearer` header.
- `INSTAGRAM_AUTOMATION_ENABLED=false`: keep false during setup and testing.
- Existing `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `ENCRYPTION_KEY` must already be configured.

Never put app secrets, service-role keys, cron secrets, or access tokens in `NEXT_PUBLIC_*` variables. Set production secrets in the Vercel Production environment; Preview deployments should use separate safe test values.

## 4. Configure Webhooks

Set the callback URL to:

```text
https://redant.in/api/instagram/webhook
```

Use the matching staging URL when testing staging. Enter the same `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` value and complete Meta's verification. Subscribe to the `comments` field required by the selected Instagram Login product. Confirm the exact field names and subscription steps in the current Meta App Dashboard and documentation.

The route verifies the raw-body `x-hub-signature-256` using the configured Instagram Meta App Secret. Keep the secret set correctly or webhook POSTs will be rejected.

## 5. Token refresh schedule

The repository includes a Vercel Cron entry in `vercel.json` that calls `GET /api/instagram/refresh-tokens` daily at 06:00 UTC on the production deployment. Vercel Cron is configured by deployment, so confirm the cron appears in the Vercel project after the feature is merged and deployed.

Set both `CRON_SECRET` and `INSTAGRAM_CRON_SECRET` to the same long random secret. The endpoint accepts Vercel's `Authorization: Bearer` header and the `x-cron-secret` header for manual/other scheduler integrations. Do not send either secret from the browser. The route checks tokens expiring within 14 days and attempts to refresh them. A missing or invalid token can require the customer to reconnect.

## 6. Go-live gate

Keep `INSTAGRAM_AUTOMATION_ENABLED=false` until all are true:

1. The test Instagram Business/Creator account completes OAuth.
2. RedANT displays the username after refresh.
3. Supabase contains connection metadata and an encrypted token row; the status API never returns token material.
4. Meta verifies the webhook and delivers a valid comment event.
5. A supported keyword comment triggers exactly one permitted private reply.
6. A duplicate webhook does not send a second reply.
7. The messaging/private-reply rules, logs, pause behavior, and error handling have been tested.
8. CI and migration checks pass.
9. The production Vercel Cron schedule is visible and its authenticated invocation is successful.

Meta private replies are not unrestricted cold DMs. The implementation is intended to send one private reply tied to the comment within the allowed window; follow-up messages remain subject to standard messaging rules.
