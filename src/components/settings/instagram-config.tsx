'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Instagram, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';

interface InstagramConnection {
  id: string;
  instagram_user_id: string;
  username: string | null;
  status: 'connected' | 'disconnected' | 'reauthorization_required' | 'error';
  token_expires_at: string | null;
  last_synced_at: string | null;
}

function resultMessage(status: string | null, reason: string | null): string | null {
  if (status === 'connected') return 'Instagram connected successfully. Refresh the status below if it does not update yet.';
  if (status !== 'error') return null;

  const messages: Record<string, string> = {
    authorization_denied: 'Instagram authorization was cancelled or denied.',
    invalid_oauth_state: 'The security check expired. Start the connection again.',
    missing_authorization_code: 'Meta did not return an authorization code. Please retry.',
    account_changed_during_connection: 'Your active RedANT account changed during setup. Please retry from the correct account.',
    instagram_account_already_connected: 'This Instagram account is already connected to another RedANT workspace.',
    database_save_failed: 'Instagram authorized the connection, but RedANT could not save it completely. Please retry; if it persists, contact support.',
    server_configuration: 'Instagram connection is not configured on the server yet.',
    connection_failed: 'Instagram connection failed. Please retry and check the diagnostic logs if it continues.',
  };
  return messages[reason ?? ''] ?? 'Instagram could not be connected. Please retry.';
}

export function InstagramConfig() {
  const { accountRole } = useAuth();
  const searchParams = useSearchParams();
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const canManage = accountRole === 'owner' || accountRole === 'admin';
  const callbackMessage = resultMessage(
    searchParams.get('instagram_status'),
    searchParams.get('instagram_reason'),
  );

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/instagram/status', { cache: 'no-store' });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Could not load Instagram connection status.');
      }
      setConnection(payload?.connection ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load Instagram connection status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Instagram automation</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Connect an Instagram professional account to prepare comment-to-private-reply automation.
          Only official Meta authorization is supported; personal Instagram accounts cannot connect.
        </p>
      </div>

      {callbackMessage ? (
        <div
          role={searchParams.get('instagram_status') === 'connected' ? 'status' : 'alert'}
          className={searchParams.get('instagram_status') === 'connected'
            ? 'rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-foreground'
            : 'rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-foreground'}
        >
          {callbackMessage}
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600">
            <Instagram className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground">Instagram account</h3>
              {connection?.status === 'connected' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" /> Connected
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {connection?.status === 'reauthorization_required' ? 'Reconnect required' : 'Not connected'}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {connection?.username
                ? `Connected as @${connection.username}`
                : 'Connect a Business or Creator account to begin setup.'}
            </p>
            {connection?.token_expires_at ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Access expires: {new Date(connection.token_expires_at).toLocaleDateString()}
              </p>
            ) : null}
          </div>
        </div>

        {error ? (
          <p role="alert" className="mt-4 rounded-lg bg-destructive/5 p-3 text-sm text-destructive">{error}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {canManage ? (
            <button
              type="button"
              onClick={() => {
                setConnecting(true);
                window.location.assign('/api/instagram/connect');
              }}
              disabled={connecting || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {connecting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Instagram className="size-4" aria-hidden="true" />}
              {connection?.status === 'connected' ? 'Reconnect Instagram' : 'Connect Instagram'}
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">An account owner or admin must connect Instagram.</p>
          )}
          <button
            type="button"
            onClick={() => void loadStatus()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="size-4" aria-hidden="true" />}
            Refresh status
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Safe by design</p>
            <p>RedANT never asks for your Instagram password. Access tokens are stored encrypted on the server and are not returned by the status API.</p>
            <p>Comment automation is not enabled yet. It will be available only after Meta permissions, webhook delivery, duplicate protection, and private-reply limits are verified.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
