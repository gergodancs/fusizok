-- Illesztés bővítése: fusizó GPS + kézi munka (geokódolt pont) és szöveges fallback

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
