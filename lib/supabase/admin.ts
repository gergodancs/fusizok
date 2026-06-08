import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Szerver-oldali admin kliens (service role). RLS-t megkerüli – csak Server Actionökben használd!
 * Add hozzá a .env.local fájlhoz: SUPABASE_SERVICE_ROLE_KEY=...
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
