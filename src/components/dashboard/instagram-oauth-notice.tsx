'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, X } from 'lucide-react';

function InstagramOAuthNoticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (searchParams.get('instagram_status') !== 'connected') return null;

  const dismiss = () => router.replace('/dashboard', { scroll: false });

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-foreground"
    >
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Instagram connected successfully.</p>
        <p className="mt-1 text-muted-foreground">
          RedANT saved your Instagram connection. You can manage automation settings from Settings.
        </p>
        <button
          type="button"
          onClick={() => router.push('/settings?tab=instagram')}
          className="mt-2 font-medium text-primary underline-offset-4 hover:underline"
        >
          Open Instagram settings
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss Instagram connection notice"
        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function InstagramOAuthNotice() {
  return (
    <Suspense fallback={null}>
      <InstagramOAuthNoticeContent />
    </Suspense>
  );
}
