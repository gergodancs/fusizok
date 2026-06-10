-- Főkategória + al-tevékenység (sub-skills) matchmaking

ALTER TABLE public.craftsman_profiles
  ADD COLUMN IF NOT EXISTS sub_categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS sub_categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN public.craftsman_profiles.sub_categories IS
  'Fusizó által vállalt al-tevékenység kulcsok (pl. funyiras, szobafestes).';

COMMENT ON COLUMN public.jobs.sub_categories IS
  'Hirdetéshez tartozó konkrét al-tevékenység kulcsok.';

CREATE INDEX IF NOT EXISTS craftsman_profiles_sub_categories_gin_idx
  ON public.craftsman_profiles USING GIN (sub_categories);

CREATE INDEX IF NOT EXISTS jobs_sub_categories_gin_idx
  ON public.jobs USING GIN (sub_categories);

-- coverage_zip_codes NOT NULL javítás (profil mentési hiba)
UPDATE public.craftsman_profiles
SET coverage_zip_codes = ARRAY[]::TEXT[]
WHERE coverage_zip_codes IS NULL;

ALTER TABLE public.craftsman_profiles
  ALTER COLUMN coverage_zip_codes SET DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.craftsman_profiles
  ALTER COLUMN coverage_zip_codes SET NOT NULL;

-- Régi lapos kategóriák → új főkategória ID-k
UPDATE public.craftsman_profiles
SET profession = CASE
  WHEN profession ILIKE '%Villanyszerelés%' THEN 'villanyszereles'
  WHEN profession ILIKE '%Vízvezetékszerelés%' THEN 'viz_gaz'
  WHEN profession ILIKE '%Bútorösszeszerelés%' THEN 'butorosszeszereles'
  WHEN profession ILIKE '%fúrás%' OR profession ILIKE '%polcozás%' THEN 'ezermester'
  WHEN profession ILIKE '%Kerti%' OR profession ILIKE '%fűnyírás%' THEN 'kertgondozas'
  WHEN profession ILIKE '%Szállítás%' OR profession ILIKE '%költöztetés%' THEN 'szallitas'
  ELSE profession
END
WHERE profession IS NOT NULL
  AND profession NOT LIKE '%,%'
  AND profession NOT IN (
    'kertgondozas', 'festes_dekor', 'epitoipar', 'villanyszereles', 'viz_gaz',
    'klima', 'asztalos', 'lakatos', 'butorosszeszereles', 'szallitas', 'ezermester'
  );

UPDATE public.jobs
SET category = CASE category
  WHEN 'Villanyszerelés' THEN 'villanyszereles'
  WHEN 'Vízvezetékszerelés' THEN 'viz_gaz'
  WHEN 'Bútorösszeszerelés' THEN 'butorosszeszereles'
  WHEN 'Kisebb fúrás/polcozás' THEN 'ezermester'
  WHEN 'Kerti munka / fűnyírás' THEN 'kertgondozas'
  WHEN 'Szállítás / költöztetés' THEN 'szallitas'
  ELSE category
END
WHERE category IN (
  'Villanyszerelés',
  'Vízvezetékszerelés',
  'Bútorösszeszerelés',
  'Kisebb fúrás/polcozás',
  'Kerti munka / fűnyírás',
  'Szállítás / költöztetés'
);
