-- Béta indulás: új fusizók 100 induló kreditet kapnak (egyszer, idempotensen).

ALTER TABLE public.credit_transactions
  DROP CONSTRAINT IF EXISTS credit_transactions_type_check;

ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_type_check
  CHECK (type IN ('buy', 'spend', 'bonus'));

CREATE OR REPLACE FUNCTION public._grant_craftsman_signup_credits(p_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_bonus NUMERIC(10, 1) := 100;
BEGIN
  IF p_profile_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT p.role INTO v_role
  FROM public.profiles p
  WHERE p.id = p_profile_id
  FOR UPDATE;

  IF v_role IS DISTINCT FROM 'craftsman' THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.credit_transactions ct
    WHERE ct.profile_id = p_profile_id
      AND ct.type = 'bonus'
      AND ct.description = 'Béta induló kredit'
  ) THEN
    RETURN false;
  END IF;

  UPDATE public.profiles
  SET credits = credits + v_bonus
  WHERE id = p_profile_id;

  INSERT INTO public.credit_transactions (profile_id, amount, type, description)
  VALUES (p_profile_id, v_bonus, 'bonus', 'Béta induló kredit');

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_craftsman_signup_credits()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_granted BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'unauthorized');
  END IF;

  v_granted := public._grant_craftsman_signup_credits(v_user_id);

  IF v_granted THEN
    RETURN jsonb_build_object('granted', true, 'amount', 100);
  END IF;

  RETURN jsonb_build_object('granted', false, 'reason', 'already_granted_or_not_craftsman');
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_craftsman_signup_credits() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    user_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    role = EXCLUDED.role;

  IF user_role = 'craftsman' THEN
    INSERT INTO public.craftsman_profiles (id, coverage_zip_codes)
    VALUES (NEW.id, ARRAY[]::text[])
    ON CONFLICT (id) DO NOTHING;

    PERFORM public._grant_craftsman_signup_credits(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;
