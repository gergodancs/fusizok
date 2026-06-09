-- Teszt: 1 ingyenes kapcsolatfelvétel / fusizó.
-- 2. esetben: chat létrejön, de a fusizó csak fizetés után válaszolhat.

ALTER TABLE public.craftsman_profiles
  ALTER COLUMN free_credits SET DEFAULT 1;

COMMENT ON COLUMN public.craftsman_profiles.free_credits IS
  'Ingyenes chat-válasz jogosultságok száma. 0-nál a fusizó fizetés után válaszolhat.';

-- Teszteléshez: minden fusizó 1 kredit (ne legyen 7)
UPDATE public.craftsman_profiles
SET free_credits = 1
WHERE free_credits > 1;

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
  v_credits INTEGER;
  v_conversation_id UUID;
  v_now TIMESTAMPTZ := now();
  v_needs_craftsman_payment BOOLEAN := false;
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
      'craftsman_id', v_bid.craftsman_id,
      'craftsman_payment_required', v_bid.status = 'pending_payment'
    );
  END IF;

  SELECT cp.free_credits INTO v_credits
  FROM public.craftsman_profiles cp
  WHERE cp.id = v_bid.craftsman_id
  FOR UPDATE;

  IF v_credits IS NULL THEN
    v_credits := 0;
  END IF;

  IF v_credits > 0 THEN
    UPDATE public.craftsman_profiles
    SET free_credits = free_credits - 1
    WHERE id = v_bid.craftsman_id;

    UPDATE public.job_bids
    SET
      contact_shared = true,
      contact_shared_at = v_now,
      status = 'active'
    WHERE id = p_bid_id;
  ELSE
    v_needs_craftsman_payment := true;

    UPDATE public.job_bids
    SET
      contact_shared = true,
      contact_shared_at = v_now,
      status = 'pending_payment'
    WHERE id = p_bid_id;
  END IF;

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

  IF v_needs_craftsman_payment THEN
    RETURN jsonb_build_object(
      'success', true,
      'outcome', 'craftsman_payment_required',
      'conversation_id', v_conversation_id,
      'used_credit', false,
      'job_id', v_bid.job_id,
      'craftsman_id', v_bid.craftsman_id
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'outcome', 'activated',
    'conversation_id', v_conversation_id,
    'used_credit', true,
    'job_id', v_bid.job_id,
    'craftsman_id', v_bid.craftsman_id
  );
END;
$$;

-- Fusizó fizetés után: pending_payment → active (chat már létezik)
CREATE OR REPLACE FUNCTION public.activate_contact_after_payment(
  p_bid_id UUID,
  p_idempotency_key TEXT,
  p_client_id UUID,
  p_intro_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_status TEXT;
  v_bid public.job_bids%ROWTYPE;
  v_job public.jobs%ROWTYPE;
  v_conversation_id UUID;
  v_now TIMESTAMPTZ := now();
BEGIN
  IF p_bid_id IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'invalid_input';
  END IF;

  INSERT INTO public.stripe_idempotency_keys (idempotency_key, status, bid_id, metadata)
  VALUES (p_idempotency_key, 'processing', p_bid_id, p_metadata)
  ON CONFLICT (idempotency_key) DO NOTHING;

  SELECT sik.status INTO v_existing_status
  FROM public.stripe_idempotency_keys sik
  WHERE sik.idempotency_key = p_idempotency_key;

  IF v_existing_status = 'completed' THEN
    SELECT c.id INTO v_conversation_id
    FROM public.job_bids jb
    JOIN public.conversations c
      ON c.job_id = jb.job_id AND c.craftsman_id = jb.craftsman_id
    WHERE jb.id = p_bid_id;

    RETURN jsonb_build_object(
      'success', true,
      'outcome', 'already_processed',
      'conversation_id', v_conversation_id
    );
  END IF;

  IF v_existing_status = 'skipped_stale_job' THEN
    RETURN jsonb_build_object(
      'success', true,
      'outcome', 'skipped_stale_job'
    );
  END IF;

  SELECT * INTO v_bid
  FROM public.job_bids
  WHERE id = p_bid_id
  FOR UPDATE;

  IF NOT FOUND THEN
    UPDATE public.stripe_idempotency_keys
    SET status = 'failed', completed_at = v_now
    WHERE idempotency_key = p_idempotency_key;

    RAISE EXCEPTION 'bid_not_found';
  END IF;

  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = v_bid.job_id;

  IF NOT FOUND THEN
    UPDATE public.stripe_idempotency_keys
    SET
      status = 'skipped_stale_job',
      completed_at = v_now,
      metadata = COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object('reason', 'job_deleted')
    WHERE idempotency_key = p_idempotency_key;

    RETURN jsonb_build_object(
      'success', true,
      'outcome', 'skipped_stale_job',
      'reason', 'job_deleted'
    );
  END IF;

  IF v_job.status IN ('cancelled', 'completed') THEN
    UPDATE public.stripe_idempotency_keys
    SET
      status = 'skipped_stale_job',
      completed_at = v_now,
      metadata = COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object(
        'reason', 'job_closed',
        'job_status', v_job.status
      )
    WHERE idempotency_key = p_idempotency_key;

    RETURN jsonb_build_object(
      'success', true,
      'outcome', 'skipped_stale_job',
      'reason', 'job_closed'
    );
  END IF;

  SELECT c.id INTO v_conversation_id
  FROM public.conversations c
  WHERE c.job_id = v_bid.job_id
    AND c.craftsman_id = v_bid.craftsman_id;

  IF v_bid.status = 'active' AND v_bid.contact_shared THEN
    UPDATE public.stripe_idempotency_keys
    SET status = 'completed', completed_at = v_now
    WHERE idempotency_key = p_idempotency_key;

    RETURN jsonb_build_object(
      'success', true,
      'outcome', 'already_active',
      'conversation_id', v_conversation_id
    );
  END IF;

  IF v_bid.status = 'pending_payment' AND v_bid.contact_shared THEN
    UPDATE public.job_bids
    SET status = 'active'
    WHERE id = p_bid_id;

    UPDATE public.stripe_idempotency_keys
    SET status = 'completed', completed_at = v_now
    WHERE idempotency_key = p_idempotency_key;

    RETURN jsonb_build_object(
      'success', true,
      'outcome', 'activated',
      'conversation_id', v_conversation_id,
      'job_id', v_bid.job_id,
      'craftsman_id', v_bid.craftsman_id
    );
  END IF;

  -- Régi flow: chat még nem létezett (visszafelé kompatibilitás)
  UPDATE public.job_bids
  SET
    contact_shared = true,
    contact_shared_at = v_now,
    status = 'active'
  WHERE id = p_bid_id;

  IF v_conversation_id IS NULL THEN
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

    IF p_intro_message IS NOT NULL
       AND v_conversation_id IS NOT NULL
       AND p_client_id IS NOT NULL THEN
      INSERT INTO public.messages (conversation_id, sender_id, content)
      VALUES (v_conversation_id, p_client_id, p_intro_message);
    END IF;
  END IF;

  UPDATE public.stripe_idempotency_keys
  SET status = 'completed', completed_at = v_now
  WHERE idempotency_key = p_idempotency_key;

  RETURN jsonb_build_object(
    'success', true,
    'outcome', 'activated',
    'conversation_id', v_conversation_id,
    'job_id', v_bid.job_id,
    'craftsman_id', v_bid.craftsman_id
  );
EXCEPTION
  WHEN OTHERS THEN
    UPDATE public.stripe_idempotency_keys
    SET status = 'failed', completed_at = now()
    WHERE idempotency_key = p_idempotency_key
      AND status = 'processing';

    RAISE;
END;
$$;
