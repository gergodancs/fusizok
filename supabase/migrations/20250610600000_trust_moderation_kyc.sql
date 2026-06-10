-- Moderáció, chat lezárás, jelentések, hitelesített szaki (KYC)

-- =============================================================================
-- 1. Chat státusz + rendszerüzenetek
-- =============================================================================

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';

ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_status_check;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_status_check
  CHECK (status IN ('open', 'closed'));

COMMENT ON COLUMN public.conversations.status IS
  'open = aktív chat, closed = lezárt (pl. másik szakit választottak).';

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.messages.is_system IS
  'Rendszerüzenet (pl. chat lezárás) – nem felhasználói tartalom.';

-- =============================================================================
-- 2. Hitelesített szaki + KYC
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.is_verified IS
  'Hitelesített fusizó jelvény – admin jóváhagyás után TRUE.';

ALTER TABLE public.craftsman_profiles
  ADD COLUMN IF NOT EXISTS kyc_status TEXT NOT NULL DEFAULT 'none';

ALTER TABLE public.craftsman_profiles
  DROP CONSTRAINT IF EXISTS craftsman_profiles_kyc_status_check;

ALTER TABLE public.craftsman_profiles
  ADD CONSTRAINT craftsman_profiles_kyc_status_check
  CHECK (kyc_status IN ('none', 'pending', 'approved', 'rejected'));

ALTER TABLE public.craftsman_profiles
  ADD COLUMN IF NOT EXISTS kyc_id_path TEXT,
  ADD COLUMN IF NOT EXISTS kyc_selfie_path TEXT,
  ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ;

-- =============================================================================
-- 3. Felhasználói jelentések
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'fraud', 'other')),
  details TEXT,
  context_type TEXT CHECK (context_type IN ('chat', 'profile')),
  context_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_reporter_id_idx ON public.reports (reporter_id);
CREATE INDEX IF NOT EXISTS reports_reported_user_id_idx ON public.reports (reported_user_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_insert_own" ON public.reports;
CREATE POLICY "reports_insert_own"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "reports_select_own" ON public.reports;
CREATE POLICY "reports_select_own"
  ON public.reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

-- =============================================================================
-- 4. KYC dokumentumok – privát Storage bucket
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "kyc_documents_select_own" ON storage.objects;
CREATE POLICY "kyc_documents_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "kyc_documents_insert_own" ON storage.objects;
CREATE POLICY "kyc_documents_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "kyc_documents_update_own" ON storage.objects;
CREATE POLICY "kyc_documents_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
