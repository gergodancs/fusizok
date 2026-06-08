"use server";

import { revalidatePath } from "next/cache";
import { notifyUser } from "@/app/utils/notifications";
import { getSessionUser, getUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function rejectBid(bidId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Bejelentkezés szükséges.");
  }

  const profile = await getUserProfile(user.id);
  const clientName = profile?.full_name ?? "A megrendelő";

  const supabase = await createClient();

  const { data: bid, error: bidError } = await supabase
    .from("job_bids")
    .select("id, job_id, craftsman_id, status, contact_shared")
    .eq("id", bidId)
    .maybeSingle();

  if (bidError || !bid) {
    throw new Error("Az ajánlat nem található.");
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id, client_id, title")
    .eq("id", bid.job_id)
    .maybeSingle();

  if (!job || job.client_id !== user.id) {
    throw new Error("Nincs jogosultságod ehhez az ajánlathoz.");
  }

  if (bid.status === "rejected") {
    return;
  }

  const { error: updateError } = await supabase
    .from("job_bids")
    .update({ status: "rejected" })
    .eq("id", bidId);

  if (updateError) {
    console.error("Elutasítás hiba:", updateError.message);
    throw new Error("Az elutasítás sikertelen.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await notifyUser({
    userId: bid.craftsman_id,
    title: "Pályázat elutasítva",
    body: `${clientName} elutasította a(z) „${job.title}” munkára adott ajánlatodat.`,
    url: `${appUrl}/szaki/aktivitas`,
    emailSubject: `Pályázat elutasítva – ${job.title}`,
    emailHtml: `<p>Szia!</p><p><strong>${clientName}</strong> elutasította a(z) <strong>${job.title}</strong> munkára adott pályázatodat.</p><p><a href="${appUrl}/szaki/aktivitas">Megnyitás az Aktivitásom oldalon</a></p>`,
    tag: `bid-rejected-${bidId}`,
  });

  revalidatePath("/lakos/ajanlatok");
  revalidatePath("/szaki/aktivitas");
  revalidatePath("/szaki", "layout");
}
