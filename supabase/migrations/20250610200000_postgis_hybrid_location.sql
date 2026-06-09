-- Hibrid helyszín: PostGIS GPS + megye/város szöveges fallback

CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================================================
-- jobs – GPS + city (település)
-- =============================================================================

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS location_gps geography(Point, 4326);

ALTER TABLE public.jobs
  ALTER COLUMN zip_code DROP NOT NULL;

COMMENT ON COLUMN public.jobs.city IS 'Település vagy kerület neve (kézi megadás).';
COMMENT ON COLUMN public.jobs.location_gps IS 'GPS koordináta (WGS84), ha a lakos helymeghatározást használt.';

UPDATE public.jobs
SET city = zip_code
WHERE city IS NULL
  AND zip_code IS NOT NULL
  AND btrim(zip_code) <> '';

-- =============================================================================
-- craftsman_profiles – bázis hely + vállalási sugár
-- =============================================================================

ALTER TABLE public.craftsman_profiles
  ADD COLUMN IF NOT EXISTS county TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS location_gps geography(Point, 4326),
  ADD COLUMN IF NOT EXISTS service_radius_km INTEGER NOT NULL DEFAULT 25;

ALTER TABLE public.craftsman_profiles
  DROP CONSTRAINT IF EXISTS craftsman_profiles_service_radius_km_check;

ALTER TABLE public.craftsman_profiles
  ADD CONSTRAINT craftsman_profiles_service_radius_km_check
  CHECK (service_radius_km BETWEEN 5 AND 100);

COMMENT ON COLUMN public.craftsman_profiles.location_gps IS 'Fusizó bázis pozíciója (GPS).';
COMMENT ON COLUMN public.craftsman_profiles.service_radius_km IS 'Vállalási sugár km-ben (GPS illesztéshez).';

CREATE INDEX IF NOT EXISTS jobs_location_gps_gix
  ON public.jobs USING GIST (location_gps);

CREATE INDEX IF NOT EXISTS craftsman_profiles_location_gps_gix
  ON public.craftsman_profiles USING GIST (location_gps);

CREATE INDEX IF NOT EXISTS jobs_city_idx ON public.jobs (city);
CREATE INDEX IF NOT EXISTS craftsman_profiles_city_idx ON public.craftsman_profiles (city);

-- =============================================================================
-- Segédfüggvények
-- =============================================================================

CREATE OR REPLACE FUNCTION public.geog_from_latlng(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS geography
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
$$;

CREATE OR REPLACE FUNCTION public.job_city_name(
  p_city TEXT,
  p_zip TEXT
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT COALESCE(NULLIF(btrim(p_city), ''), NULLIF(btrim(p_zip), ''));
$$;

CREATE OR REPLACE FUNCTION public.locations_text_match(
  p_job_county TEXT,
  p_job_city TEXT,
  p_job_zip TEXT,
  p_craft_county TEXT,
  p_craft_city TEXT,
  p_craft_counties TEXT[],
  p_craft_cities TEXT[]
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT
    (
      p_job_county IS NOT NULL
      AND btrim(p_job_county) <> ''
      AND (
        (p_craft_county IS NOT NULL AND btrim(p_craft_county) <> '' AND p_job_county = p_craft_county)
        OR p_job_county = ANY (COALESCE(p_craft_counties, ARRAY[]::TEXT[]))
      )
    )
    OR (
      public.job_city_name(p_job_city, p_job_zip) IS NOT NULL
      AND (
        (
          p_craft_city IS NOT NULL
          AND btrim(p_craft_city) <> ''
          AND public.job_city_name(p_job_city, p_job_zip) = p_craft_city
        )
        OR public.job_city_name(p_job_city, p_job_zip) = ANY (COALESCE(p_craft_cities, ARRAY[]::TEXT[]))
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.set_job_location_gps(
  p_job_id UUID,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.jobs
  SET location_gps = public.geog_from_latlng(p_lat, p_lng)
  WHERE id = p_job_id;
$$;

CREATE OR REPLACE FUNCTION public.clear_job_location_gps(p_job_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.jobs
  SET location_gps = NULL
  WHERE id = p_job_id;
$$;

CREATE OR REPLACE FUNCTION public.set_craftsman_location_gps(
  p_craftsman_id UUID,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.craftsman_profiles
  SET location_gps = public.geog_from_latlng(p_lat, p_lng)
  WHERE id = p_craftsman_id;
$$;

CREATE OR REPLACE FUNCTION public.clear_craftsman_location_gps(p_craftsman_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.craftsman_profiles
  SET location_gps = NULL
  WHERE id = p_craftsman_id;
$$;

-- =============================================================================
-- Illesztés: GPS ST_DWithin + szöveges fallback (megye VAGY város)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.job_matches_craftsman(
  p_job_id UUID,
  p_craftsman_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.jobs j
    INNER JOIN public.craftsman_profiles cp ON cp.id = p_craftsman_id
    WHERE j.id = p_job_id
      AND (
        (
          j.location_gps IS NOT NULL
          AND cp.location_gps IS NOT NULL
          AND ST_DWithin(
            cp.location_gps,
            j.location_gps,
            cp.service_radius_km * 1000.0
          )
        )
        OR public.locations_text_match(
          j.county,
          j.city,
          j.zip_code,
          cp.county,
          cp.city,
          cp.coverage_counties,
          cp.coverage_zip_codes
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.filter_matched_job_ids(
  p_craftsman_id UUID,
  p_job_ids UUID[]
)
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    array_agg(j.id) FILTER (WHERE public.job_matches_craftsman(j.id, p_craftsman_id)),
    ARRAY[]::UUID[]
  )
  FROM unnest(p_job_ids) AS job_id
  INNER JOIN public.jobs j ON j.id = job_id;
$$;

GRANT EXECUTE ON FUNCTION public.set_job_location_gps(UUID, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_job_location_gps(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_craftsman_location_gps(UUID, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_craftsman_location_gps(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.job_matches_craftsman(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.filter_matched_job_ids(UUID, UUID[]) TO authenticated;
