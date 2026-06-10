import type { SupabaseClient } from "@supabase/supabase-js";

export async function applyJobLocationGps(
  supabase: SupabaseClient,
  jobId: string,
  latitude: number | null,
  longitude: number | null,
): Promise<void> {
  if (latitude !== null && longitude !== null) {
    const { error } = await supabase.rpc("set_job_location_gps", {
      p_job_id: jobId,
      p_lat: latitude,
      p_lng: longitude,
    });

    if (error) {
      console.error("Job koordináta mentési hiba:", error.message);
    }
    return;
  }

  const { error } = await supabase.rpc("clear_job_location_gps", {
    p_job_id: jobId,
  });

  if (error) {
    console.error("Job koordináta törlési hiba:", error.message);
  }
}

export async function applyCraftsmanLocationGps(
  supabase: SupabaseClient,
  craftsmanId: string,
  latitude: number | null,
  longitude: number | null,
): Promise<void> {
  if (latitude !== null && longitude !== null) {
    const { error } = await supabase.rpc("set_craftsman_location_gps", {
      p_craftsman_id: craftsmanId,
      p_lat: latitude,
      p_lng: longitude,
    });

    if (error) {
      console.error("Fusizó koordináta mentési hiba:", error.message);
    }
    return;
  }

  const { error } = await supabase.rpc("clear_craftsman_location_gps", {
    p_craftsman_id: craftsmanId,
  });

  if (error) {
    console.error("Fusizó koordináta törlési hiba:", error.message);
  }
}

export async function filterMatchedJobIds(
  supabase: SupabaseClient,
  craftsmanId: string,
  jobIds: string[],
): Promise<string[] | null> {
  if (jobIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase.rpc("filter_matched_job_ids", {
    p_craftsman_id: craftsmanId,
    p_job_ids: jobIds,
  });

  if (error) {
    console.error("PostGIS illesztési RPC hiba:", error.message);
    return null;
  }

  return (data as string[] | null) ?? [];
}
