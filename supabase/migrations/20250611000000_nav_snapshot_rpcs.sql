-- Nav badge és layout gyorsítás: egy RPC hívás layoutonként + olvasatlan üzenetek egy queryben

CREATE INDEX IF NOT EXISTS jobs_open_created_at_idx
  ON public.jobs (created_at DESC)
  WHERE status = 'open';

CREATE OR REPLACE FUNCTION public.craftsman_profession_ids(p_profession TEXT)
RETURNS TEXT[]
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    array_agg(DISTINCT btrim(x)) FILTER (WHERE btrim(x) <> ''),
    ARRAY[]::TEXT[]
  )
  FROM unnest(string_to_array(COALESCE(p_profession, ''), ',')) AS x;
$$;

CREATE OR REPLACE FUNCTION public.craftsman_has_service_base(p_craftsman_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.craftsman_profiles cp
    WHERE cp.id = p_craftsman_id
      AND (
        (btrim(COALESCE(cp.county, '')) <> '' AND btrim(COALESCE(cp.city, '')) <> '')
        OR cp.location_gps IS NOT NULL
        OR cardinality(COALESCE(cp.coverage_zip_codes, ARRAY[]::TEXT[])) > 0
        OR cardinality(COALESCE(cp.coverage_counties, ARRAY[]::TEXT[])) > 0
      )
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
        (
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

CREATE OR REPLACE FUNCTION public.count_unseen_open_jobs_for_craftsman(
  p_craftsman_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seen_at TIMESTAMPTZ;
  v_sub_count INTEGER;
BEGIN
  IF p_craftsman_id IS DISTINCT FROM auth.uid() THEN
    RETURN 0;
  END IF;

  SELECT
    cp.open_jobs_seen_at,
    cardinality(COALESCE(cp.sub_categories, ARRAY[]::TEXT[]))
  INTO v_seen_at, v_sub_count
  FROM public.craftsman_profiles cp
  WHERE cp.id = p_craftsman_id;

  IF NOT FOUND OR v_sub_count = 0 OR NOT public.craftsman_has_service_base(p_craftsman_id) THEN
    RETURN 0;
  END IF;

  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.jobs j
    WHERE j.status = 'open'
      AND (v_seen_at IS NULL OR j.created_at > v_seen_at)
      AND public.job_matches_craftsman_skills(j.id, p_craftsman_id)
      AND public.job_matches_craftsman(j.id, p_craftsman_id)
      AND NOT EXISTS (
        SELECT 1
        FROM public.job_bids jb
        WHERE jb.job_id = j.id
          AND jb.craftsman_id = p_craftsman_id
      )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.count_unread_messages_for_user(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.messages m
  INNER JOIN public.conversations c ON c.id = m.conversation_id
  LEFT JOIN public.conversation_reads cr
    ON cr.conversation_id = c.id
    AND cr.user_id = p_user_id
  WHERE p_user_id = auth.uid()
    AND m.sender_id <> p_user_id
    AND m.created_at > COALESCE(cr.last_read_at, '1970-01-01'::TIMESTAMPTZ)
    AND (
      c.client_id = p_user_id
      OR (
        c.craftsman_id = p_user_id
        AND EXISTS (
          SELECT 1
          FROM public.job_bids jb
          WHERE jb.job_id = c.job_id
            AND jb.craftsman_id = p_user_id
            AND jb.contact_shared = true
        )
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.get_craftsman_layout_snapshot()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_credits NUMERIC(10, 1);
  v_new_open_jobs INTEGER;
  v_new_activity INTEGER;
  v_unread_messages INTEGER;
  v_payment_required INTEGER;
  v_sub_count INTEGER;
  v_has_service_base BOOLEAN;
  v_has_bio BOOLEAN;
  v_has_avatar BOOLEAN;
  v_portfolio_count INTEGER;
  v_has_bid BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'unauthorized');
  END IF;

  SELECT COALESCE(p.credits, 0)
  INTO v_credits
  FROM public.profiles p
  WHERE p.id = v_user_id;

  v_new_open_jobs := public.count_unseen_open_jobs_for_craftsman(v_user_id);

  SELECT COUNT(*)::INTEGER
  INTO v_new_activity
  FROM public.job_bids jb
  WHERE jb.craftsman_id = v_user_id
    AND jb.activity_seen_by_craftsman_at IS NULL
    AND (jb.contact_shared = true OR jb.status = 'rejected');

  SELECT COUNT(*)::INTEGER
  INTO v_payment_required
  FROM public.job_bids jb
  WHERE jb.craftsman_id = v_user_id
    AND jb.contact_shared = true
    AND jb.status = 'pending_payment';

  v_unread_messages := public.count_unread_messages_for_user(v_user_id);

  SELECT
    cardinality(COALESCE(cp.sub_categories, ARRAY[]::TEXT[])),
    btrim(COALESCE(cp.bio, '')) <> ''
  INTO v_sub_count, v_has_bio
  FROM public.craftsman_profiles cp
  WHERE cp.id = v_user_id;

  v_has_service_base := public.craftsman_has_service_base(v_user_id);

  SELECT btrim(COALESCE(p.avatar_url, '')) <> ''
  INTO v_has_avatar
  FROM public.profiles p
  WHERE p.id = v_user_id;

  SELECT COUNT(*)::INTEGER
  INTO v_portfolio_count
  FROM public.portfolio_images pi
  WHERE pi.craftsman_id = v_user_id;

  SELECT EXISTS (
    SELECT 1 FROM public.job_bids jb WHERE jb.craftsman_id = v_user_id LIMIT 1
  )
  INTO v_has_bid;

  RETURN jsonb_build_object(
    'credits', COALESCE(v_credits, 0),
    'nav', jsonb_build_object(
      'new_open_jobs', COALESCE(v_new_open_jobs, 0),
      'new_activity', COALESCE(v_new_activity, 0),
      'unread_messages', COALESCE(v_unread_messages, 0),
      'payment_required', COALESCE(v_payment_required, 0)
    ),
    'onboarding', jsonb_build_object(
      'has_sub_categories', COALESCE(v_sub_count, 0) > 0,
      'has_service_area', COALESCE(v_has_service_base, false),
      'has_bio', COALESCE(v_has_bio, false),
      'has_avatar', COALESCE(v_has_avatar, false),
      'portfolio_count', COALESCE(v_portfolio_count, 0),
      'has_bid', COALESCE(v_has_bid, false)
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_client_layout_snapshot()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_unread_messages INTEGER;
  v_new_offers INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'unauthorized');
  END IF;

  v_unread_messages := public.count_unread_messages_for_user(v_user_id);

  SELECT COUNT(*)::INTEGER
  INTO v_new_offers
  FROM public.job_bids jb
  INNER JOIN public.jobs j ON j.id = jb.job_id
  WHERE j.client_id = v_user_id
    AND jb.viewed_by_client_at IS NULL;

  RETURN jsonb_build_object(
    'unread_messages', COALESCE(v_unread_messages, 0),
    'new_offers', COALESCE(v_new_offers, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.count_unseen_open_jobs_for_craftsman(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_unread_messages_for_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_craftsman_layout_snapshot() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_client_layout_snapshot() TO authenticated;
