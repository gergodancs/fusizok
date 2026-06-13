-- Béta tesztidőszak: fusizó kreditek automatikus feltöltése pályázáskor, ha elfogytak.

CREATE OR REPLACE FUNCTION public.refill_beta_craftsman_credits(
  p_profile_id UUID,
  p_minimum NUMERIC DEFAULT 0
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_credits NUMERIC(10, 1);
  v_refill_amount NUMERIC(10, 1) := 100;
  v_beta_ends TIMESTAMPTZ := '2026-07-07T23:59:59+02';
  v_topup NUMERIC(10, 1);
BEGIN
  IF p_profile_id IS NULL THEN
    RETURN false;
  END IF;

  IF now() > v_beta_ends THEN
    RETURN false;
  END IF;

  SELECT p.role, p.credits
  INTO v_role, v_credits
  FROM public.profiles p
  WHERE p.id = p_profile_id
  FOR UPDATE;

  IF v_role IS DISTINCT FROM 'craftsman' THEN
    RETURN false;
  END IF;

  IF v_credits IS NULL OR v_credits >= COALESCE(p_minimum, 0) THEN
    RETURN false;
  END IF;

  v_topup := v_refill_amount - v_credits;

  IF v_topup <= 0 THEN
    RETURN false;
  END IF;

  UPDATE public.profiles
  SET credits = v_refill_amount
  WHERE id = p_profile_id;

  INSERT INTO public.credit_transactions (profile_id, amount, type, description)
  VALUES (p_profile_id, v_topup, 'bonus', 'Béta tesztidőszak – kredit feltöltés');

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_job_bid_with_credits(
  p_craftsman_id UUID,
  p_job_id UUID,
  p_price NUMERIC DEFAULT NULL,
  p_message TEXT DEFAULT NULL,
  p_availability_duration TEXT DEFAULT NULL,
  p_credit_cost NUMERIC DEFAULT 2.5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job public.jobs%ROWTYPE;
  v_role TEXT;
  v_credits NUMERIC(10, 1);
  v_bid_id UUID;
  v_refilled BOOLEAN;
BEGIN
  IF p_craftsman_id IS NULL OR p_job_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_input');
  END IF;

  IF p_craftsman_id IS DISTINCT FROM auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  IF p_availability_duration IS NULL OR btrim(p_availability_duration) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'missing_availability');
  END IF;

  SELECT role INTO v_role FROM public.profiles WHERE id = p_craftsman_id;
  IF v_role IS DISTINCT FROM 'craftsman' THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_craftsman');
  END IF;

  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = p_job_id
  FOR UPDATE;

  IF NOT FOUND OR v_job.status IS DISTINCT FROM 'open' THEN
    RETURN jsonb_build_object('success', false, 'error', 'job_unavailable');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.job_bids jb
    WHERE jb.job_id = p_job_id AND jb.craftsman_id = p_craftsman_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_applied');
  END IF;

  SELECT p.credits INTO v_credits
  FROM public.profiles p
  WHERE p.id = p_craftsman_id
  FOR UPDATE;

  IF v_credits IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'profile_not_found');
  END IF;

  IF v_credits < p_credit_cost THEN
    v_refilled := public.refill_beta_craftsman_credits(p_craftsman_id, p_credit_cost);

    IF v_refilled THEN
      SELECT p.credits INTO v_credits
      FROM public.profiles p
      WHERE p.id = p_craftsman_id;
    END IF;
  END IF;

  IF v_credits < p_credit_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_credits',
      'credits', v_credits,
      'required', p_credit_cost
    );
  END IF;

  UPDATE public.profiles
  SET credits = credits - p_credit_cost
  WHERE id = p_craftsman_id;

  INSERT INTO public.credit_transactions (
    profile_id, amount, type, description, job_id
  ) VALUES (
    p_craftsman_id,
    p_credit_cost,
    'spend',
    'Pályázat: ' || v_job.title,
    p_job_id
  );

  INSERT INTO public.job_bids (
    job_id,
    craftsman_id,
    price,
    message,
    availability_duration,
    contact_shared,
    status
  ) VALUES (
    p_job_id,
    p_craftsman_id,
    p_price,
    NULLIF(btrim(p_message), ''),
    p_availability_duration,
    false,
    'pending'
  )
  RETURNING id INTO v_bid_id;

  RETURN jsonb_build_object(
    'success', true,
    'bid_id', v_bid_id,
    'credits_remaining', v_credits - p_credit_cost
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_applied');
END;
$$;

GRANT EXECUTE ON FUNCTION public.refill_beta_craftsman_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_job_bid_with_credits TO authenticated;
