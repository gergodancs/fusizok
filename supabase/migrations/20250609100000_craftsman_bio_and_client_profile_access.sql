-- Fusizó bemutatkozás + lakos hozzáférés pályázat után

ALTER TABLE public.craftsman_profiles
  ADD COLUMN IF NOT EXISTS bio TEXT;

COMMENT ON COLUMN public.craftsman_profiles.bio IS
  'Rövid bemutatkozás / leírás a lakosoknak (max. ~2000 karakter).';

-- profiles: saját + olyan fusizók, akik pályáztak a lakos munkájára
DROP POLICY IF EXISTS "profiles_select_own_and_bid_craftsmen" ON public.profiles;
CREATE POLICY "profiles_select_own_and_bid_craftsmen"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.job_bids jb
      JOIN public.jobs j ON j.id = jb.job_id
      WHERE jb.craftsman_id = profiles.id
        AND j.client_id = auth.uid()
    )
  );

-- craftsman_profiles: saját (meglévő policy) + pályázat után lakos is olvashat
DROP POLICY IF EXISTS "craftsman_profiles_select_client_with_bid" ON public.craftsman_profiles;
CREATE POLICY "craftsman_profiles_select_client_with_bid"
  ON public.craftsman_profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.job_bids jb
      JOIN public.jobs j ON j.id = jb.job_id
      WHERE jb.craftsman_id = craftsman_profiles.id
        AND j.client_id = auth.uid()
    )
  );
