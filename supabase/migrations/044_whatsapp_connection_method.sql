-- Track whether a WhatsApp number was connected through manual Cloud API
-- credentials or Meta Embedded Signup. The distinction matters because
-- Embedded Signup (including eligible Coexistence onboarding) completes
-- Meta's onboarding path without this app calling /{phone_number_id}/register.
-- Existing rows are conservatively treated as manual connections.
ALTER TABLE public.whatsapp_config
  ADD COLUMN IF NOT EXISTS connection_method TEXT NOT NULL DEFAULT 'manual'
  CHECK (connection_method IN ('manual', 'embedded_signup'));

COMMENT ON COLUMN public.whatsapp_config.connection_method IS
  'Connection path used for this WhatsApp number: manual Cloud API setup or Meta Embedded Signup.';
