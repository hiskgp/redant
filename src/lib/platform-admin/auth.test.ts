import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createClient = vi.fn();
const supabaseAdmin = vi.fn();

vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase/server', () => ({ createClient: () => createClient() }));
vi.mock('@/lib/flows/admin-client', () => ({ supabaseAdmin: () => supabaseAdmin() }));

const { PlatformAdminAuthError, requirePlatformAdmin } = await import('./auth');

function makeAdminClient(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => result),
  };
  return { from: vi.fn(() => builder), builder };
}

describe('requirePlatformAdmin', () => {
  beforeEach(() => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only-service-role-key');
    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: 'user-123', email: 'owner@example.test' } },
          error: null,
        })),
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('rejects unauthenticated requests before reading the allow-list', async () => {
    createClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    });

    await expect(requirePlatformAdmin()).rejects.toMatchObject({
      name: 'PlatformAdminAuthError',
      status: 401,
    });
    expect(supabaseAdmin).not.toHaveBeenCalled();
  });

  it('fails closed if the service-role key is missing', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    await expect(requirePlatformAdmin()).rejects.toBeInstanceOf(PlatformAdminAuthError);
    await expect(requirePlatformAdmin()).rejects.toMatchObject({ status: 503 });
    expect(supabaseAdmin).not.toHaveBeenCalled();
  });

  it('rejects a signed-in tenant user who is not on the platform allow-list', async () => {
    const admin = makeAdminClient({ data: null, error: null });
    supabaseAdmin.mockReturnValue(admin);

    await expect(requirePlatformAdmin()).rejects.toMatchObject({ status: 403 });
    expect(admin.from).toHaveBeenCalledWith('platform_admins');
    expect(admin.builder.eq).toHaveBeenNthCalledWith(1, 'user_id', 'user-123');
    expect(admin.builder.eq).toHaveBeenNthCalledWith(2, 'active', true);
  });

  it('returns a server-only admin context for an active allow-list member', async () => {
    const admin = makeAdminClient({ data: { user_id: 'user-123' }, error: null });
    supabaseAdmin.mockReturnValue(admin);

    await expect(requirePlatformAdmin()).resolves.toMatchObject({
      userId: 'user-123',
      email: 'owner@example.test',
      admin,
    });
  });

  it('returns a service-unavailable error when allow-list lookup fails', async () => {
    const admin = makeAdminClient({ data: null, error: { code: '42P01' } });
    supabaseAdmin.mockReturnValue(admin);

    await expect(requirePlatformAdmin()).rejects.toMatchObject({ status: 503 });
  });
});
