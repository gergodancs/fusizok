-- Fusizó-only üdvözlő chat üzenet pályázat elfogadásakor (a lakos nem látja).

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS visible_to_role TEXT;

ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_visible_to_role_check;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_visible_to_role_check
  CHECK (visible_to_role IS NULL OR visible_to_role IN ('craftsman', 'client'));

COMMENT ON COLUMN public.messages.visible_to_role IS
  'NULL = mindkét fél látja; craftsman/client = csak az adott szerepkör.';

DROP POLICY IF EXISTS "messages_select_participant" ON public.messages;
CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (
          c.client_id = auth.uid()
          OR c.craftsman_id = auth.uid()
        )
        AND (
          messages.visible_to_role IS NULL
          OR (messages.visible_to_role = 'craftsman' AND c.craftsman_id = auth.uid())
          OR (messages.visible_to_role = 'client' AND c.client_id = auth.uid())
        )
    )
  );

CREATE OR REPLACE FUNCTION public._insert_craftsman_welcome_message(
  p_conversation_id UUID,
  p_craftsman_id UUID,
  p_message TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_conversation_id IS NULL
     OR p_craftsman_id IS NULL
     OR p_message IS NULL
     OR btrim(p_message) = '' THEN
    RETURN;
  END IF;

  INSERT INTO public.messages (
    conversation_id,
    sender_id,
    content,
    is_system,
    visible_to_role
  ) VALUES (
    p_conversation_id,
    p_craftsman_id,
    btrim(p_message),
    true,
    'craftsman'
  );
END;
$$;

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

  PERFORM public._insert_craftsman_welcome_message(
    v_conversation_id,
    v_bid.craftsman_id,
    p_intro_message
  );

  RETURN jsonb_build_object(
    'success', true,
    'outcome', 'activated',
    'conversation_id', v_conversation_id,
    'job_id', v_bid.job_id,
    'craftsman_id', v_bid.craftsman_id
  );
END;
$$;

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

    PERFORM public._insert_craftsman_welcome_message(
      v_conversation_id,
      v_bid.craftsman_id,
      p_intro_message
    );
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
      m.visible_to_role IS NULL
      OR (m.visible_to_role = 'craftsman' AND c.craftsman_id = p_user_id)
      OR (m.visible_to_role = 'client' AND c.client_id = p_user_id)
    )
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

GRANT EXECUTE ON FUNCTION public.share_contact_with_credit(UUID, UUID, TEXT) TO authenticated;
