-- Körzet aktivitás számlálók (üres körzet / úttörő logika)

CREATE OR REPLACE FUNCTION public.count_craftsmen_for_job_location(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_county TEXT,
  p_city TEXT,
  p_exclude_user_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.craftsman_profiles cp
  INNER JOIN public.profiles p ON p.id = cp.id AND p.role = 'craftsman'
  WHERE (p_exclude_user_id IS NULL OR cp.id <> p_exclude_user_id)
    AND (
      (
        p_lat IS NOT NULL
        AND p_lng IS NOT NULL
        AND cp.location_gps IS NOT NULL
        AND ST_DWithin(
          cp.location_gps,
          public.geog_from_latlng(p_lat, p_lng),
          cp.service_radius_km * 1000.0
        )
      )
      OR public.locations_text_match(
        p_county,
        p_city,
        NULL,
        cp.county,
        cp.city,
        cp.coverage_counties,
        cp.coverage_zip_codes
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.count_open_jobs_for_craftsman_zone(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_km INTEGER,
  p_county TEXT,
  p_city TEXT
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.jobs j
  WHERE j.status = 'open'
    AND (
      (
        p_lat IS NOT NULL
        AND p_lng IS NOT NULL
        AND j.location_gps IS NOT NULL
        AND ST_DWithin(
          public.geog_from_latlng(p_lat, p_lng),
          j.location_gps,
          GREATEST(p_radius_km, 5) * 1000.0
        )
      )
      OR public.locations_text_match(
        j.county,
        j.city,
        j.zip_code,
        p_county,
        p_city,
        CASE WHEN p_county IS NOT NULL THEN ARRAY[p_county] ELSE ARRAY[]::TEXT[] END,
        CASE WHEN p_city IS NOT NULL THEN ARRAY[p_city] ELSE ARRAY[]::TEXT[] END
      )
    );
$$;

GRANT EXECUTE ON FUNCTION public.count_craftsmen_for_job_location(DOUBLE PRECISION, DOUBLE PRECISION, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_open_jobs_for_craftsman_zone(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER, TEXT, TEXT) TO authenticated;
