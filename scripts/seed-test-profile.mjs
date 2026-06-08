import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const TEST_PROFILE_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // lib/constants/dev.ts

function loadEnvFile(filename) {
  const path = resolve(root, filename);
  const content = readFileSync(path, "utf8");
  const env = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }

  return env;
}

const env = {
  ...loadEnvFile(".env.local"),
  ...process.env,
};

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Hiányzó NEXT_PUBLIC_SUPABASE_URL vagy Supabase kulcs a .env.local fájlból.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const profile = {
  id: TEST_PROFILE_ID,
  role: "client",
  full_name: "Teszt Elek",
};

async function seed() {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", TEST_PROFILE_ID)
    .maybeSingle();

  if (selectError) {
    console.error("Lekérdezési hiba:", selectError.message);
    process.exit(1);
  }

  if (existing) {
    console.log("A teszt profil már létezik:", existing);
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error("Beszúrási hiba:", error.message);
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error(
        "\nTipp: Ha RLS blokkolja a beszúrást, add hozzá a SUPABASE_SERVICE_ROLE_KEY",
        "értékét a .env.local fájlhoz, vagy futtasd az alábbi SQL-t a Supabase SQL Editorban:",
      );
      console.error(`
INSERT INTO public.profiles (id, role, full_name)
VALUES ('${TEST_PROFILE_ID}', 'client', 'Teszt Elek')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;
`);
    }
    process.exit(1);
  }

  console.log("Teszt profil sikeresen létrehozva:", data);
}

seed();
