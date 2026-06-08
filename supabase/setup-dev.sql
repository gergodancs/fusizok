-- Egyszeri fejlesztői beállítás: teszt profil + RLS szabályok anon beszúráshoz/olvasáshoz.
-- Futtasd a Supabase Dashboard → SQL Editor felületén, ha nincs SUPABASE_SERVICE_ROLE_KEY a .env.local-ban.

-- 1. Teszt lakossági profil (jobs.client_id foreign key)
INSERT INTO public.profiles (id, role, full_name)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'client',
  'Teszt Elek'
)
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;

-- 2. RLS: anon szerepkör beszúrhat és olvashat munkákat (fejlesztéshez)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dev_anon_insert_jobs" ON public.jobs;
CREATE POLICY "dev_anon_insert_jobs"
  ON public.jobs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "dev_anon_select_jobs" ON public.jobs;
CREATE POLICY "dev_anon_select_jobs"
  ON public.jobs
  FOR SELECT
  TO anon, authenticated
  USING (true);
