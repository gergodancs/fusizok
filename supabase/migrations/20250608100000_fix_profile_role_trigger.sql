-- Javítás: regisztrációkor a user_metadata.role kerüljön a profiles táblába,
-- fusizó esetén craftsman_profiles sor is jöjjön létre.

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
  END IF;

  RETURN NEW;
END;
$$;

-- Meglévő fusizók javítása: auth metadata alapján
UPDATE public.profiles p
SET role = 'craftsman'
FROM auth.users u
WHERE p.id = u.id
  AND u.raw_user_meta_data->>'role' = 'craftsman'
  AND p.role IS DISTINCT FROM 'craftsman';

INSERT INTO public.craftsman_profiles (id, coverage_zip_codes)
SELECT p.id, ARRAY[]::text[]
FROM public.profiles p
WHERE p.role = 'craftsman'
ON CONFLICT (id) DO NOTHING;

-- RLS: saját profil frissítése / fusizó profil kezelése
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_upsert_own" ON public.profiles;
CREATE POLICY "profiles_upsert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

ALTER TABLE public.craftsman_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "craftsman_profiles_select_own" ON public.craftsman_profiles;
CREATE POLICY "craftsman_profiles_select_own"
  ON public.craftsman_profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "craftsman_profiles_insert_own" ON public.craftsman_profiles;
CREATE POLICY "craftsman_profiles_insert_own"
  ON public.craftsman_profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "craftsman_profiles_update_own" ON public.craftsman_profiles;
CREATE POLICY "craftsman_profiles_update_own"
  ON public.craftsman_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
