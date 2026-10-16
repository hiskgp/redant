-- Interrupted Instagram webhook events are quarantined for manual review.
-- Never auto-resend: the provider may have accepted a private reply before the
-- process died, and retrying could violate Meta's one-private-reply limit.

ALTER TABLE public.instagram_comment_events
  DROP CONSTRAINT IF EXISTS instagram_comment_events_status_check;

ALTER TABLE public.instagram_comment_events
  ADD CONSTRAINT instagram_comment_events_status_check
  CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'skipped', 'review_required'));

CREATE INDEX IF NOT EXISTS idx_instagram_comment_events_stale_processing
  ON public.instagram_comment_events(processed_at, received_at)
  WHERE status = 'processing';
