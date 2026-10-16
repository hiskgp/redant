'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Instagram,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Unplug,
} from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';

interface InstagramConnection {
  id: string;
  instagram_user_id: string;
  username: string | null;
  status: 'connected' | 'disconnected' | 'reauthorization_required' | 'error';
  token_expires_at: string | null;
  last_synced_at: string | null;
}

interface InstagramRule {
  id: string;
  name: string;
  keywords: string[];
  match_type: 'contains' | 'exact' | 'word';
  reply_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function resultMessage(status: string | null, reason: string | null): string | null {
  if (status === 'connected') return 'Instagram connected successfully. Your account details are saved in RedANT.';
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
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [rules, setRules] = useState<InstagramRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ruleError, setRuleError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [savingRule, setSavingRule] = useState(false);
  const [ruleName, setRuleName] = useState('Product enquiry');
  const [keywords, setKeywords] = useState('price, link');
  const [matchType, setMatchType] = useState<InstagramRule['match_type']>('contains');
  const [replyText, setReplyText] = useState('Thanks for your interest! Please reply here and our team will help you with the product details.');
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
      setAutomationEnabled(payload?.automation_enabled === true);

      if (canManage) {
        const rulesResponse = await fetch('/api/instagram/rules', { cache: 'no-store' });
        const rulesPayload = await rulesResponse.json().catch(() => null);
        if (!rulesResponse.ok) {
          throw new Error(rulesPayload?.error || 'Could not load Instagram rules.');
        }
        setRules(Array.isArray(rulesPayload?.rules) ? rulesPayload.rules : []);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load Instagram connection status.');
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const disconnectInstagram = async () => {
    if (!window.confirm('Disconnect Instagram from this RedANT workspace? Automation rules will be paused and the saved token will be removed.')) return;
    setDisconnecting(true);
    setError(null);
    try {
      const response = await fetch('/api/instagram/disconnect', { method: 'POST' });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || 'Could not disconnect Instagram.');
      await loadStatus();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not disconnect Instagram.');
    } finally {
      setDisconnecting(false);
    }
  };

  const createRule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingRule(true);
    setRuleError(null);
    try {
      const response = await fetch('/api/instagram/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ruleName,
          keywords: keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean),
          match_type: matchType,
          reply_text: replyText,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || 'Could not save this rule.');
      setRules((current) => [...current, payload.rule as InstagramRule]);
      setRuleName('');
      setKeywords('');
    } catch (cause) {
      setRuleError(cause instanceof Error ? cause.message : 'Could not save this rule.');
    } finally {
      setSavingRule(false);
    }
  };

  const updateRule = async (id: string, patch: Partial<Pick<InstagramRule, 'is_active'>>) => {
    setRuleError(null);
    try {
      const response = await fetch(`/api/instagram/rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || 'Could not update this rule.');
      setRules((current) => current.map((rule) => rule.id === id ? payload.rule as InstagramRule : rule));
    } catch (cause) {
      setRuleError(cause instanceof Error ? cause.message : 'Could not update this rule.');
    }
  };

  const deleteRule = async (id: string) => {
    setRuleError(null);
    try {
      const response = await fetch(`/api/instagram/rules/${id}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || 'Could not delete this rule.');
      setRules((current) => current.filter((rule) => rule.id !== id));
    } catch (cause) {
      setRuleError(cause instanceof Error ? cause.message : 'Could not delete this rule.');
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Instagram automation</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Connect an Instagram professional account and prepare comment-to-private-reply rules.
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
                Access token expires: {new Date(connection.token_expires_at).toLocaleDateString()}
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
          {canManage && connection?.status === 'connected' ? (
            <button
              type="button"
              onClick={() => void disconnectInstagram()}
              disabled={disconnecting || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {disconnecting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Unplug className="size-4" aria-hidden="true" />}
              Disconnect Instagram
            </button>
          ) : null}
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

      {connection?.status === 'connected' && canManage ? (
        <div className="space-y-5 rounded-xl border border-border bg-card p-5">
          <div>
            <h3 className="font-semibold text-foreground">Comment-to-DM rules</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure one private reply for a matching comment. Meta permits only one private reply per comment, within the allowed time window.
            </p>
          </div>

          {!automationEnabled ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-foreground">
              <p className="font-medium">Automation is safely paused</p>
              <p className="mt-1 text-muted-foreground">
                You can draft rules now. Rules cannot be activated until the Meta webhook subscription and live private-reply test are verified and the server-side kill switch is enabled.
              </p>
            </div>
          ) : null}

          {ruleError ? (
            <p role="alert" className="rounded-lg bg-destructive/5 p-3 text-sm text-destructive">{ruleError}</p>
          ) : null}

          <form onSubmit={createRule} className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-foreground">Rule name</span>
              <input
                value={ruleName}
                onChange={(event) => setRuleName(event.target.value)}
                maxLength={80}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Product enquiry"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-foreground">Keywords (comma-separated)</span>
              <input
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="price, link, details"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-foreground">Match type</span>
              <select
                value={matchType}
                onChange={(event) => setMatchType(event.target.value as InstagramRule['match_type'])}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="contains">Contains keyword</option>
                <option value="exact">Exact comment</option>
                <option value="word">Whole word</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm md:col-span-2">
              <span className="font-medium text-foreground">Private reply text</span>
              <textarea
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                maxLength={1000}
                rows={3}
                required
                className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Write a concise first reply..."
              />
              <span className="block text-xs text-muted-foreground">{replyText.length}/1000 characters</span>
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={savingRule || !connection || connection.status !== 'connected'}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingRule ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
                Save draft rule
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {rules.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No rules yet. Create a draft above; it will remain inactive until the integration is verified.
              </p>
            ) : rules.map((rule) => (
              <div key={rule.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-foreground">{rule.name}</h4>
                      <span className={rule.is_active
                        ? 'rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400'
                        : 'rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'}>
                        {rule.is_active ? 'Active' : 'Draft / paused'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Keywords: {rule.keywords.join(', ')} · {rule.match_type}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{rule.reply_text}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => void updateRule(rule.id, { is_active: !rule.is_active })}
                      disabled={!automationEnabled}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      title={!automationEnabled ? 'Automation is paused by the server safety switch' : undefined}
                    >
                      {rule.is_active ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteRule(rule.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Safe by design</p>
            <p>RedANT never asks for your Instagram password. Access tokens are stored encrypted on the server and are not returned by the status API.</p>
            <p>Comment automation remains paused until the actual Meta webhook setup and live private-reply flow have been verified.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
