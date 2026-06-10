import type { ResolvedLocation } from "@/lib/location/persist-location";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getStatsClient() {
  return createAdminClient() ?? (await createClient());
}

export async function countCraftsmenNearJobLocation(
  resolved: ResolvedLocation,
  excludeUserId?: string,
): Promise<number | null> {
  const supabase = await getStatsClient();

  const { data, error } = await supabase.rpc("count_craftsmen_for_job_location", {
    p_lat: resolved.latitude,
    p_lng: resolved.longitude,
    p_county: resolved.county,
    p_city: resolved.city,
    p_exclude_user_id: excludeUserId ?? null,
  });

  if (error) {
    console.error("Fusizó körzet számláló hiba:", error.message);
    return null;
  }

  return typeof data === "number" ? data : Number(data ?? 0);
}

export async function countOpenJobsNearCraftsmanZone(
  resolved: ResolvedLocation,
  serviceRadiusKm: number,
): Promise<number | null> {
  const supabase = await getStatsClient();

  const lat =
    resolved.mode === "gps" && resolved.latitude !== null
      ? resolved.latitude
      : resolved.latitude;
  const lng =
    resolved.mode === "gps" && resolved.longitude !== null
      ? resolved.longitude
      : resolved.longitude;

  const { data, error } = await supabase.rpc("count_open_jobs_for_craftsman_zone", {
    p_lat: lat,
    p_lng: lng,
    p_radius_km: serviceRadiusKm,
    p_county: resolved.county,
    p_city: resolved.city,
  });

  if (error) {
    console.error("Nyitott munka körzet számláló hiba:", error.message);
    return null;
  }

  return typeof data === "number" ? data : Number(data ?? 0);
}

export async function isPioneerZoneForClientJob(
  resolved: ResolvedLocation,
  clientUserId?: string,
): Promise<boolean> {
  const count = await countCraftsmenNearJobLocation(resolved, clientUserId);
  return count === 0;
}

export async function isPioneerZoneForCraftsman(
  resolved: ResolvedLocation,
  serviceRadiusKm: number,
): Promise<boolean> {
  const count = await countOpenJobsNearCraftsmanZone(resolved, serviceRadiusKm);
  return count === 0;
}
