-- Profil bővítés (telefon) + jobs RLS a megrendelői szerkesztéshez/törléshez

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

COMMENT ON COLUMN public.profiles.phone IS 'Opcionális telefonszám – önkéntesen megadva.';

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_select_authenticated" ON public.jobs;
CREATE POLICY "jobs_select_authenticated"
  ON public.jobs FOR SELECT TO authenticated
  USING (
    client_id = auth.uid()
    OR status = 'open'
    OR EXISTS (
      SELECT 1
      FROM public.job_bids jb
      WHERE jb.job_id = jobs.id
        AND jb.craftsman_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "jobs_insert_own" ON public.jobs;
CREATE POLICY "jobs_insert_own"
  ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "jobs_update_own" ON public.jobs;
CREATE POLICY "jobs_update_own"
  ON public.jobs FOR UPDATE TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());
