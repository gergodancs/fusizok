-- fusizok.hu – production-ready séma bővítés
-- Futtasd a Supabase Dashboard → SQL Editor felületén.

-- =============================================================================
-- 1. jobs.status frissítése
-- =============================================================================

-- Régi 'closed' érték átvezetése az új modellbe
UPDATE public.jobs
SET status = 'completed'
WHERE status = 'closed';

ALTER TABLE public.jobs
  ALTER COLUMN status SET DEFAULT 'open';

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('open', 'assigned', 'completed', 'cancelled'));

-- =============================================================================
-- 2. job_bids – fusizó ajánlatok
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.job_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs (id) ON DELETE CASCADE,
  craftsman_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, craftsman_id)
);

CREATE INDEX IF NOT EXISTS job_bids_job_id_idx ON public.job_bids (job_id);
CREATE INDEX IF NOT EXISTS job_bids_craftsman_id_idx ON public.job_bids (craftsman_id);
CREATE INDEX IF NOT EXISTS job_bids_status_idx ON public.job_bids (status);

-- =============================================================================
-- 3. reviews – kölcsönös értékelések
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs (id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (reviewer_id <> reviewee_id),
  UNIQUE (job_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS reviews_job_id_idx ON public.reviews (job_id);
CREATE INDEX IF NOT EXISTS reviews_reviewee_id_idx ON public.reviews (reviewee_id);

-- =============================================================================
-- 4. craftsman_profiles.coverage_zip_codes → text[]
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'craftsman_profiles'
      AND column_name = 'coverage_zip_codes'
      AND udt_name = 'text'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE public.craftsman_profiles
      ALTER COLUMN coverage_zip_codes TYPE text[]
      USING (
        CASE
          WHEN coverage_zip_codes IS NULL OR btrim(coverage_zip_codes) = '' THEN ARRAY[]::text[]
          ELSE string_to_array(btrim(coverage_zip_codes), ',')
        END
      );
  END IF;
END $$;

-- Ha még nincs oszlop, hozzuk létre text[] típussal
ALTER TABLE public.craftsman_profiles
  ADD COLUMN IF NOT EXISTS coverage_zip_codes text[] DEFAULT ARRAY[]::text[];

-- Üres stringek eltávolítása a tömbökből (egyszeri tisztítás)
UPDATE public.craftsman_profiles
SET coverage_zip_codes = (
  SELECT COALESCE(array_agg(DISTINCT btrim(z)), ARRAY[]::text[])
  FROM unnest(coverage_zip_codes) AS z
  WHERE btrim(z) <> ''
)
WHERE coverage_zip_codes IS NOT NULL;

-- =============================================================================
-- RLS (alap production beállítások)
-- =============================================================================

ALTER TABLE public.job_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- job_bids: fusizó beszúrhat saját ajánlatot, mindenki olvashatja a saját / kapcsolódó melóit
DROP POLICY IF EXISTS "job_bids_select_authenticated" ON public.job_bids;
CREATE POLICY "job_bids_select_authenticated"
  ON public.job_bids FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "job_bids_insert_craftsman" ON public.job_bids;
CREATE POLICY "job_bids_insert_craftsman"
  ON public.job_bids FOR INSERT TO authenticated
  WITH CHECK (craftsman_id = auth.uid());

DROP POLICY IF EXISTS "job_bids_update_own" ON public.job_bids;
CREATE POLICY "job_bids_update_own"
  ON public.job_bids FOR UPDATE TO authenticated
  USING (craftsman_id = auth.uid());

-- reviews: bejelentkezett user írhat/saját értékelést olvashat
DROP POLICY IF EXISTS "reviews_select_authenticated" ON public.reviews;
CREATE POLICY "reviews_select_authenticated"
  ON public.reviews FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = auth.uid());
