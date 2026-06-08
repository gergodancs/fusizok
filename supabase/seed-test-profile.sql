-- Teszt lakossági profil a munkafeladási űrlaphoz (auth nélküli fejlesztéshez).
-- Futtasd a Supabase Dashboard → SQL Editor felületén, ha az npm seed RLS miatt elbukik.

INSERT INTO public.profiles (id, role, full_name)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'client',
  'Teszt Elek'
)
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;
