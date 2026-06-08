"use server";

import { revalidatePath } from "next/cache";
import { isAvailabilityDuration } from "@/lib/availability-options";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type BidFormState = {
  success?: boolean;
  error?: string;
};

export async function createJobBid(
  _prevState: BidFormState,
  formData: FormData,
): Promise<BidFormState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Bejelentkezés szükséges." };
  }

  const jobId = formData.get("job_id") as string;
  const priceRaw = (formData.get("price") as string)?.trim();
  const message = (formData.get("message") as string)?.trim() || null;
  const availability = (formData.get("availability_duration") as string)?.trim();

  if (!jobId) {
    return { error: "Hiányzó munka azonosító." };
  }

  if (!availability || !isAvailabilityDuration(availability)) {
    return { error: "Kérjük, válassz vállalási időt." };
  }

  let price: number | null = null;
  if (priceRaw) {
    const parsed = Number(priceRaw);
    if (Number.isNaN(parsed) || parsed < 0) {
      return { error: "Adj meg érvényes árat (Ft), vagy hagyd üresen." };
    }
    price = parsed;
  }

  const supabase = await createClient();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, client_id, status")
    .eq("id", jobId)
    .eq("status", "open")
    .maybeSingle();

  if (jobError || !job) {
    return { error: "A munka nem elérhető pályázásra." };
  }

  const { error: bidError } = await supabase.from("job_bids").insert({
    job_id: jobId,
    craftsman_id: user.id,
    price,
    message,
    availability_duration: availability,
    contact_shared: false,
    status: "pending",
  });

  if (bidError) {
    if (bidError.code === "23505") {
      return { error: "Erre a munkára már pályáztál." };
    }
    console.error("Pályázat mentési hiba:", bidError.message);
    return { error: "A pályázat mentése sikertelen." };
  }

  revalidatePath("/szaki/aktivitas");
  revalidatePath("/lakos/ajanlatok");

  return { success: true };
}
