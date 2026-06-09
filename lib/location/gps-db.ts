import type { SupabaseClient } from "@supabase/supabase-js";
import type { ParsedLocation } from "@/lib/location/types";

export async function applyJobLocationGps(
  supabase: SupabaseClient,
  jobId: string,
  location: ParsedLocation,
): Promise<void> {
  if (location.mode === "gps") {
    const { error } = await supabase.rpc("set_job_location_gps", {
      p_job_id: jobId,
      p_lat: location.latitude,
      p_lng: location.longitude,
    });

    if (error) {
      console.error("Job GPS mentési hiba:", error.message);
    }
    return;
  }

  const { error } = await supabase.rpc("clear_job_location_gps", {
    p_job_id: jobId,
  });

  if (error) {
    console.error("Job GPS törlési hiba:", error.message);
  }
}

export async function applyCraftsmanLocationGps(
  supabase: SupabaseClient,
  craftsmanId: string,
  location: ParsedLocation,
): Promise<void> {
  if (location.mode === "gps") {
    const { error } = await supabase.rpc("set_craftsman_location_gps", {
      p_craftsman_id: craftsmanId,
      p_lat: location.latitude,
      p_lng: location.longitude,
    });

    if (error) {
      console.error("Fusizó GPS mentési hiba:", error.message);
    }
    return;
  }

  const { error } = await supabase.rpc("clear_craftsman_location_gps", {
    p_craftsman_id: craftsmanId,
  });

  if (error) {
    console.error("Fusizó GPS törlési hiba:", error.message);
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
