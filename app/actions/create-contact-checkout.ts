"use server";

import { getSessionUser } from "@/lib/auth/session";
import {
  getAppBaseUrl,
  getStripeContactUnlockPriceHuf,
  isStripeConfigured,
} from "@/lib/stripe/config";
import { getStripeServerClient } from "@/lib/stripe/server";
import type { CreateCheckoutSessionResult } from "@/lib/types/payments";
import { createClient } from "@/lib/supabase/server";

export async function createContactCheckoutSession(
  bidId: string,
): Promise<CreateCheckoutSessionResult> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Bejelentkezés szükséges." };
  }

  if (!isStripeConfigured()) {
    return { ok: false, error: "A fizetési szolgáltatás nincs konfigurálva." };
  }

  const supabase = await createClient();

  const { data: bid, error: bidError } = await supabase
    .from("job_bids")
    .select("id, job_id, craftsman_id, status, contact_shared")
    .eq("id", bidId)
    .maybeSingle();

  if (bidError || !bid) {
    return { ok: false, error: "Az ajánlat nem található." };
  }

  if (bid.contact_shared) {
    return { ok: false, error: "A kapcsolat már meg van osztva." };
  }

  if (bid.status !== "pending_payment" && bid.status !== "pending") {
    return {
      ok: false,
      error: "Ehhez az ajánlathoz nem indítható fizetés.",
    };
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id, client_id, title, status")
    .eq("id", bid.job_id)
    .maybeSingle();

  if (!job || job.client_id !== user.id) {
    return { ok: false, error: "Nincs jogosultságod ehhez az ajánlathoz." };
  }

  if (job.status === "cancelled" || job.status === "completed") {
    return { ok: false, error: "Ez a munka már nem elérhető." };
  }

  const appUrl = getAppBaseUrl();
  const priceHuf = getStripeContactUnlockPriceHuf();

  try {
    const stripe = getStripeServerClient();

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        ui_mode: "elements",
        line_items: [
          {
            price_data: {
              currency: "huf",
              unit_amount: priceHuf,
              product_data: {
                name: "Chat kapcsolatfelvétel",
                description: `${job.title} – kapcsolat megosztása`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          bid_id: bid.id,
          job_id: job.id,
          craftsman_id: bid.craftsman_id,
          client_id: user.id,
        },
        return_url: `${appUrl}/lakos/ajanlatok?payment_return=1&bid_id=${bid.id}`,
      },
      {
        idempotencyKey: `contact-checkout-${bid.id}-${user.id}`,
      },
    );

    if (!session.client_secret) {
      console.error("[createContactCheckoutSession] Nincs client_secret", {
        bidId,
        sessionId: session.id,
      });
      return { ok: false, error: "A fizetési munkamenet létrehozása sikertelen." };
    }

    console.log("[createContactCheckoutSession] Session létrehozva", {
      bidId,
      jobId: job.id,
      craftsmanId: bid.craftsman_id,
      sessionId: session.id,
      clientId: user.id,
    });

    return {
      ok: true,
      clientSecret: session.client_secret,
      sessionId: session.id,
    };
  } catch (err) {
    console.error("[createContactCheckoutSession] Stripe hiba:", {
      bidId,
      jobId: job.id,
      craftsmanId: bid.craftsman_id,
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "A fizetés indítása sikertelen. Próbáld újra." };
  }
}
