-- Országos helyszín: megye + település/kerület (indexelhető mezők)

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS county TEXT;

COMMENT ON COLUMN public.jobs.county IS 'Megye neve (pl. Pest, Budapest).';
COMMENT ON COLUMN public.jobs.zip_code IS 'Település vagy budapesti kerület neve (pl. Gödöllő, Budapest XI. kerület).';

ALTER TABLE public.craftsman_profiles
  ADD COLUMN IF NOT EXISTS coverage_counties TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN public.craftsman_profiles.coverage_counties IS 'Lefedett megyék – coverage_zip_codes-szal párosítva.';
COMMENT ON COLUMN public.craftsman_profiles.coverage_zip_codes IS 'Lefedett települések/kerületek – coverage_counties-szel párosítva.';

-- Régi budapesti „N. kerület” → megye + új kerületnév (alkalmazás is kezeli olvasáskor)
UPDATE public.jobs
SET county = 'Budapest'
WHERE county IS NULL
  AND zip_code ~ '^\d{1,2}\.\s*kerület$';

CREATE INDEX IF NOT EXISTS jobs_county_idx ON public.jobs (county);
CREATE INDEX IF NOT EXISTS jobs_zip_code_idx ON public.jobs (zip_code);
CREATE INDEX IF NOT EXISTS jobs_county_place_idx ON public.jobs (county, zip_code);
