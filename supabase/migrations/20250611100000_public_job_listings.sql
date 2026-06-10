-- Publikus hirdetés részletek (SEO / vendég) – csak nem érzékeny mezők

CREATE OR REPLACE FUNCTION public.get_public_job_listing(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job public.jobs%ROWTYPE;
  v_display_name TEXT;
  v_bid_count INTEGER;
  v_has_images BOOLEAN;
BEGIN
  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = p_job_id
    AND status = 'open';

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(
    (regexp_match(btrim(COALESCE(p.full_name, '')), '(\S+)$'))[1],
    ''
  )
  INTO v_display_name
  FROM public.profiles p
  WHERE p.id = v_job.client_id;

  IF v_display_name IS NULL OR v_display_name = '' THEN
    v_display_name := 'Egy lakos';
  END IF;

  SELECT COUNT(*)::INTEGER
  INTO v_bid_count
  FROM public.job_bids jb
  WHERE jb.job_id = p_job_id;

  v_has_images := COALESCE(cardinality(v_job.image_urls), 0) > 0;

  RETURN jsonb_build_object(
    'id', v_job.id,
    'title', v_job.title,
    'description', v_job.description,
    'category', v_job.category,
    'sub_categories', COALESCE(v_job.sub_categories, ARRAY[]::TEXT[]),
    'county', v_job.county,
    'city', v_job.city,
    'required_completion_time', v_job.required_completion_time,
    'created_at', v_job.created_at,
    'client_display_name', v_display_name,
    'bid_count', v_bid_count,
    'has_images', v_has_images
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_job_listing(UUID) TO anon, authenticated;
