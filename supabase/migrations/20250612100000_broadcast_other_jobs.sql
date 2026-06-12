-- Egyéb hirdetések: minden, a zónában lévő fusizó értesítése / listázása

CREATE OR REPLACE FUNCTION public.job_is_broadcast_category(
  p_category TEXT,
  p_sub_categories TEXT[]
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT p_category = 'egyeb'
    OR EXISTS (
      SELECT 1
      FROM unnest(COALESCE(p_sub_categories, ARRAY[]::TEXT[])) AS sub(key)
      WHERE sub.key ~ '^egyeb_'
    );
$$;

CREATE OR REPLACE FUNCTION public.job_matches_craftsman_skills(
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
        public.job_is_broadcast_category(j.category, j.sub_categories)
        OR (
          cardinality(COALESCE(cp.sub_categories, ARRAY[]::TEXT[])) > 0
          AND cardinality(COALESCE(j.sub_categories, ARRAY[]::TEXT[])) > 0
          AND j.sub_categories && cp.sub_categories
        )
        OR (
          cardinality(COALESCE(j.sub_categories, ARRAY[]::TEXT[])) = 0
          AND j.category = ANY(public.craftsman_profession_ids(cp.profession))
        )
        OR (
          cardinality(COALESCE(cp.sub_categories, ARRAY[]::TEXT[])) = 0
          AND j.category = ANY(public.craftsman_profession_ids(cp.profession))
        )
      )
  );
$$;
