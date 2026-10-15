-- Instagram automation foundation.
-- Credentials are deliberately stored in a separate service-role-only table:
-- account members can read connection metadata, never encrypted token material.

CREATE TABLE IF NOT EXISTS public.instagram_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  connected_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  instagram_user_id TEXT NOT NULL,
  username TEXT,
  status TEXT NOT NULL DEFAULT 'connected'
    CHECK (status IN ('connected', 'disconnected', 'reauthorization_required', 'error')),
  token_expires_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  last_error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT instagram_connections_account_id_key UNIQUE (account_id),
  CONSTRAINT instagram_connections_instagram_user_id_key UNIQUE (instagram_user_id),
  CONSTRAINT instagram_connections_id_account_id_key UNIQUE (id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_instagram_connections_account
  ON public.instagram_connections(account_id);

ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS instagram_connections_select ON public.instagram_connections;
CREATE POLICY instagram_connections_select
  ON public.instagram_connections FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS instagram_connections_insert ON public.instagram_connections;
CREATE POLICY instagram_connections_insert
  ON public.instagram_connections FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS instagram_connections_update ON public.instagram_connections;
CREATE POLICY instagram_connections_update
  ON public.instagram_connections FOR UPDATE
  USING (is_account_member(account_id, 'admin'))
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS instagram_connections_delete ON public.instagram_connections;
CREATE POLICY instagram_connections_delete
  ON public.instagram_connections FOR DELETE
  USING (is_account_member(account_id, 'admin'));

DROP TRIGGER IF EXISTS set_instagram_connections_updated_at ON public.instagram_connections;
CREATE TRIGGER set_instagram_connections_updated_at
  BEFORE UPDATE ON public.instagram_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Token material is separated from user-readable connection metadata.
-- RLS is enabled and intentionally has no authenticated policies.
CREATE TABLE IF NOT EXISTS public.instagram_connection_secrets (
  connection_id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  access_token_encrypted TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT instagram_connection_secrets_connection_account_fk
    FOREIGN KEY (connection_id, account_id)
    REFERENCES public.instagram_connections(id, account_id)
    ON DELETE CASCADE
);

ALTER TABLE public.instagram_connection_secrets ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_instagram_connection_secrets_updated_at ON public.instagram_connection_secrets;
CREATE TRIGGER set_instagram_connection_secrets_updated_at
  BEFORE UPDATE ON public.instagram_connection_secrets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- A small, explicit rule model keeps the first Instagram workflow separate
-- from WhatsApp's existing automation triggers and sender implementation.
CREATE TABLE IF NOT EXISTS public.instagram_comment_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  match_type TEXT NOT NULL DEFAULT 'contains'
    CHECK (match_type IN ('contains', 'exact', 'word')),
  reply_text TEXT NOT NULL CHECK (char_length(reply_text) BETWEEN 1 AND 1000),
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT instagram_comment_rules_connection_account_fk
    FOREIGN KEY (connection_id, account_id)
    REFERENCES public.instagram_connections(id, account_id)
    ON DELETE CASCADE,
  CONSTRAINT instagram_comment_rules_keywords_nonempty
    CHECK (cardinality(keywords) > 0)
);

CREATE INDEX IF NOT EXISTS idx_instagram_comment_rules_account_active
  ON public.instagram_comment_rules(account_id, is_active);

ALTER TABLE public.instagram_comment_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS instagram_comment_rules_select ON public.instagram_comment_rules;
CREATE POLICY instagram_comment_rules_select
  ON public.instagram_comment_rules FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS instagram_comment_rules_insert ON public.instagram_comment_rules;
CREATE POLICY instagram_comment_rules_insert
  ON public.instagram_comment_rules FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS instagram_comment_rules_update ON public.instagram_comment_rules;
CREATE POLICY instagram_comment_rules_update
  ON public.instagram_comment_rules FOR UPDATE
  USING (is_account_member(account_id, 'admin'))
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS instagram_comment_rules_delete ON public.instagram_comment_rules;
CREATE POLICY instagram_comment_rules_delete
  ON public.instagram_comment_rules FOR DELETE
  USING (is_account_member(account_id, 'admin'));

DROP TRIGGER IF EXISTS set_instagram_comment_rules_updated_at ON public.instagram_comment_rules;
CREATE TRIGGER set_instagram_comment_rules_updated_at
  BEFORE UPDATE ON public.instagram_comment_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Idempotency ledger for comment events. Do not store raw comment text or
-- webhook payloads here. One private reply is permitted per comment, so the
-- uniqueness constraint prevents duplicate processing/replies on retries.
CREATE TABLE IF NOT EXISTS public.instagram_comment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL,
  comment_id TEXT NOT NULL,
  media_id TEXT,
  rule_id UUID REFERENCES public.instagram_comment_rules(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'skipped')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  provider_message_id TEXT,
  last_error_code TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT instagram_comment_events_connection_account_fk
    FOREIGN KEY (connection_id, account_id)
    REFERENCES public.instagram_connections(id, account_id)
    ON DELETE CASCADE,
  CONSTRAINT instagram_comment_events_connection_comment_key
    UNIQUE (connection_id, comment_id)
);

CREATE INDEX IF NOT EXISTS idx_instagram_comment_events_account_recent
  ON public.instagram_comment_events(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_comment_events_pending
  ON public.instagram_comment_events(status, received_at)
  WHERE status IN ('pending', 'failed');

ALTER TABLE public.instagram_comment_events ENABLE ROW LEVEL SECURITY;
-- No user-facing policies: event processing and status writes are server-side
-- only, using the service-role client. Tenant-facing UI can later expose a
-- sanitized API endpoint instead of querying this table directly.
