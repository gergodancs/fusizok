-- Fusizó menü badge-ek: új munkák és aktivitás „láttam” időbélyegek

ALTER TABLE public.craftsman_profiles
  ADD COLUMN IF NOT EXISTS open_jobs_seen_at TIMESTAMPTZ;

COMMENT ON COLUMN public.craftsman_profiles.open_jobs_seen_at IS
  'Utolsó látogatás a Nyitott munkák oldalon (új munka badge).';

ALTER TABLE public.job_bids
  ADD COLUMN IF NOT EXISTS activity_seen_by_craftsman_at TIMESTAMPTZ;

COMMENT ON COLUMN public.job_bids.activity_seen_by_craftsman_at IS
  'Fusizó látta az aktivitás frissítést (kapcsolatfelvétel, elutasítás stb.).';
