-- Profilképek, fusizó portfólió galéria, értékelések fotóval + Storage bucketek

-- =============================================================================
-- 1. Profilképek
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.profiles.avatar_url IS
  'Publikus profilkép URL (Supabase Storage avatars bucket).';

-- =============================================================================
-- 2. Fusizó referencia galéria
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  craftsman_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portfolio_images_craftsman_id_idx
  ON public.portfolio_images (craftsman_id);

CREATE INDEX IF NOT EXISTS portfolio_images_created_at_idx
  ON public.portfolio_images (craftsman_id, created_at DESC);

ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portfolio_images_select_authenticated" ON public.portfolio_images;
CREATE POLICY "portfolio_images_select_authenticated"
  ON public.portfolio_images FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "portfolio_images_insert_own" ON public.portfolio_images;
CREATE POLICY "portfolio_images_insert_own"
  ON public.portfolio_images FOR INSERT TO authenticated
  WITH CHECK (craftsman_id = auth.uid());

DROP POLICY IF EXISTS "portfolio_images_delete_own" ON public.portfolio_images;
CREATE POLICY "portfolio_images_delete_own"
  ON public.portfolio_images FOR DELETE TO authenticated
  USING (craftsman_id = auth.uid());

-- =============================================================================
-- 3. Értékelések – opcionális fotó
-- =============================================================================

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.reviews.image_url IS
  'Opcionális fotó az elvégzett munkáról (Supabase Storage review-images bucket).';

-- reviewer_id = lakos (user_id), reviewee_id = fusizó (craftsman_id)

DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.jobs j
      JOIN public.job_bids jb ON jb.job_id = j.id
      WHERE j.id = reviews.job_id
        AND j.client_id = auth.uid()
        AND jb.craftsman_id = reviews.reviewee_id
        AND jb.contact_shared = true
        AND j.status = 'completed'
    )
  );

-- =============================================================================
-- 4. Storage bucketek
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'avatars',
    'avatars',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'portfolio-images',
    'portfolio-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'review-images',
    'review-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Avatars: publikus olvasás, saját mappa írás
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Portfolio: publikus olvasás, fusizó saját mappába tölthet
DROP POLICY IF EXISTS "portfolio_public_read" ON storage.objects;
CREATE POLICY "portfolio_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

DROP POLICY IF EXISTS "portfolio_insert_own" ON storage.objects;
CREATE POLICY "portfolio_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "portfolio_delete_own" ON storage.objects;
CREATE POLICY "portfolio_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'portfolio-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Review images: publikus olvasás, lakos saját mappába tölthet
DROP POLICY IF EXISTS "review_images_public_read" ON storage.objects;
CREATE POLICY "review_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-images');

DROP POLICY IF EXISTS "review_images_insert_own" ON storage.objects;
CREATE POLICY "review_images_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'review-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
