-- 043_platform_super_admin_foundation.sql
-- Platform-level administration is intentionally separate from
-- profiles.role (legacy) and profiles.account_role (tenant membership).
-- This migration does not modify existing customer RLS policies.

CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_admins_active
  ON public.platform_admins(active)
  WHERE active = TRUE;

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Deliberately no policy for anon/authenticated. The server-only
-- service-role client is the only application path to this allow-list.
REVOKE ALL ON TABLE public.platform_admins FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_admins TO service_role;

CREATE TABLE IF NOT EXISTS public.platform_admin_audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (length(action) BETWEEN 1 AND 120),
  target_type TEXT CHECK (target_type IS NULL OR length(target_type) <= 80),
  target_id TEXT CHECK (target_id IS NULL OR length(target_id) <= 200),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(metadata) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_admin_audit_created_at
  ON public.platform_admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_admin_audit_actor
  ON public.platform_admin_audit_log(actor_user_id, created_at DESC);

ALTER TABLE public.platform_admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Audit records are not readable or writable through the public Data API.
-- Trusted server-side admin code writes through service_role only.
REVOKE ALL ON TABLE public.platform_admin_audit_log FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.platform_admin_audit_log TO service_role;
REVOKE ALL ON SEQUENCE public.platform_admin_audit_log_id_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.platform_admin_audit_log_id_seq TO service_role;

COMMENT ON TABLE public.platform_admins IS
  'Private allow-list of RedANT platform administrators; distinct from tenant roles.';
COMMENT ON TABLE public.platform_admin_audit_log IS
  'Append-only-by-convention audit events for privileged RedANT platform operations. Never store secrets.';
