-- Pay-to-Apply: profil kreditek, tranzakció napló, pályázati RPC, szabad chat elfogadás után

-- =============================================================================
-- 1. Kredit egyenleg (profiles) + tranzakció napló
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits NUMERIC(10, 1) NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.profiles.credits IS
  'Fusizó pályázati kreditek (tizedes: pl. 2.5 pályázat / csomag).';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_credits_non_negative;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_credits_non_negative CHECK (credits >= 0);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  amount NUMERIC(10, 1) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('buy', 'spend')),
  description TEXT,
  job_id UUID REFERENCES public.jobs (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credit_transactions_profile_id_idx
  ON public.credit_transactions (profile_id, created_at DESC);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credit_transactions_select_own" ON public.credit_transactions;
CREATE POLICY "credit_transactions_select_own"
  ON public.credit_transactions FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

-- =============================================================================
-- 2. Pályázat csak RPC-n keresztül (kredit levonással)
-- =============================================================================

DROP POLICY IF EXISTS "job_bids_insert_craftsman" ON public.job_bids;

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

GRANT EXECUTE ON FUNCTION public.submit_job_bid_with_credits TO authenticated;

-- =============================================================================
-- 3. Kredit vásárlás Stripe után
-- =============================================================================

CREATE OR REPLACE FUNCTION public.add_credits_after_purchase(
  p_profile_id UUID,
  p_amount NUMERIC,
  p_description TEXT,
  p_idempotency_key TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_status TEXT;
  v_now TIMESTAMPTZ := now();
BEGIN
  IF p_profile_id IS NULL OR p_amount IS NULL OR p_amount <= 0 OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'invalid_input';
  END IF;

  INSERT INTO public.stripe_idempotency_keys (idempotency_key, status, metadata)
  VALUES (p_idempotency_key, 'processing', p_metadata)
  ON CONFLICT (idempotency_key) DO NOTHING;

  SELECT sik.status INTO v_existing_status
  FROM public.stripe_idempotency_keys sik
  WHERE sik.idempotency_key = p_idempotency_key;

  IF v_existing_status = 'completed' THEN
    RETURN jsonb_build_object('success', true, 'outcome', 'already_processed');
  END IF;

  UPDATE public.profiles
  SET credits = credits + p_amount
  WHERE id = p_profile_id;

  INSERT INTO public.credit_transactions (profile_id, amount, type, description)
  VALUES (p_profile_id, p_amount, 'buy', p_description);

  UPDATE public.stripe_idempotency_keys
  SET status = 'completed', completed_at = v_now
  WHERE idempotency_key = p_idempotency_key;

  RETURN jsonb_build_object('success', true, 'outcome', 'credits_added');
EXCEPTION
  WHEN OTHERS THEN
    UPDATE public.stripe_idempotency_keys
    SET status = 'failed', completed_at = now()
    WHERE idempotency_key = p_idempotency_key
      AND status = 'processing';
    RAISE;
END;
$$;

-- =============================================================================
-- 4. Kapcsolatmegosztás: azonnal aktív chat (nincs második fizetés)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.share_contact_with_credit(
  p_bid_id UUID,
  p_client_id UUID,
  p_intro_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bid public.job_bids%ROWTYPE;
  v_job public.jobs%ROWTYPE;
  v_conversation_id UUID;
  v_now TIMESTAMPTZ := now();
BEGIN
  IF p_bid_id IS NULL OR p_client_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_input');
  END IF;

  SELECT * INTO v_bid
  FROM public.job_bids
  WHERE id = p_bid_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'bid_not_found');
  END IF;

  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = v_bid.job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'job_not_found');
  END IF;

  IF v_job.client_id IS DISTINCT FROM p_client_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  IF v_job.status IN ('cancelled', 'completed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'job_closed');
  END IF;

  IF v_bid.status = 'rejected' THEN
    RETURN jsonb_build_object('success', false, 'error', 'bid_rejected');
  END IF;

  IF v_bid.contact_shared THEN
    SELECT c.id INTO v_conversation_id
    FROM public.conversations c
    WHERE c.job_id = v_bid.job_id
      AND c.craftsman_id = v_bid.craftsman_id;

    RETURN jsonb_build_object(
      'success', true,
      'outcome', 'already_active',
      'conversation_id', v_conversation_id,
      'job_id', v_bid.job_id,
      'craftsman_id', v_bid.craftsman_id
    );
  END IF;

  UPDATE public.job_bids
  SET
    contact_shared = true,
    contact_shared_at = v_now,
    status = 'active'
  WHERE id = p_bid_id;

  INSERT INTO public.conversations (job_id, client_id, craftsman_id)
  VALUES (v_bid.job_id, v_job.client_id, v_bid.craftsman_id)
  ON CONFLICT (job_id, craftsman_id) DO NOTHING
  RETURNING id INTO v_conversation_id;

  IF v_conversation_id IS NULL THEN
    SELECT c.id INTO v_conversation_id
    FROM public.conversations c
    WHERE c.job_id = v_bid.job_id
      AND c.craftsman_id = v_bid.craftsman_id;
  END IF;

  IF p_intro_message IS NOT NULL AND v_conversation_id IS NOT NULL THEN
    INSERT INTO public.messages (conversation_id, sender_id, content)
    VALUES (v_conversation_id, p_client_id, p_intro_message);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'outcome', 'activated',
    'conversation_id', v_conversation_id,
    'job_id', v_bid.job_id,
    'craftsman_id', v_bid.craftsman_id
  );
END;
$$;
