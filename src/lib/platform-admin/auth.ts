import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/flows/admin-client';

export class PlatformAdminAuthError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403 | 503,
  ) {
    super(message);
    this.name = 'PlatformAdminAuthError';
  }
}

export interface PlatformAdminContext {
  userId: string;
  email: string | null;
  /** Server-only service-role client. Never return this from a route. */
  admin: ReturnType<typeof supabaseAdmin>;
}

/**
 * Require a signed-in Supabase user AND an active platform_admins allow-list
 * row. Tenant account roles and the legacy profiles.role field are not trusted
 * for platform authorization. This function must only be imported server-side.
 */
export async function requirePlatformAdmin(): Promise<PlatformAdminContext> {
  const sessionClient = await createClient();
  const {
    data: { user },
    error: userError,
  } = await sessionClient.auth.getUser();

  if (userError || !user) {
    throw new PlatformAdminAuthError('Authentication required', 401);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Fail closed rather than accidentally checking the allow-list with a
    // browser-scoped client or silently treating an auth error as permission.
    throw new PlatformAdminAuthError(
      'Platform administration is not configured on this server',
      503,
    );
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    console.error('[platform-admin] allow-list lookup failed:', error.code);
    throw new PlatformAdminAuthError(
      'Could not verify platform administrator access',
      503,
    );
  }

  if (!data) {
    throw new PlatformAdminAuthError('Platform administrator access required', 403);
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    admin,
  };
}

/**
 * Write only explicitly approved, non-secret metadata. Callers should never
 * pass access tokens, message bodies, credentials, or other sensitive values.
 * Audit failure is logged server-side and does not break read-only dashboards.
 */
export async function logPlatformAdminEvent(input: {
  actorUserId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  try {
    const { error } = await supabaseAdmin()
      .from('platform_admin_audit_log')
      .insert({
        actor_user_id: input.actorUserId,
        action: input.action,
        target_type: input.targetType ?? null,
        target_id: input.targetId ?? null,
        metadata: input.metadata ?? {},
      });

    if (error) {
      console.error('[platform-admin] audit insert failed:', error.code);
    }
  } catch (error) {
    console.error(
      '[platform-admin] audit insert failed:',
      error instanceof Error ? error.message : 'unknown error',
    );
  }
}
