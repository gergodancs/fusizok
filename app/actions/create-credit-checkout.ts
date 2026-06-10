"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import {
  getCreditPack,
  type CreditPackId,
} from "@/lib/credits/packages";
import { addCreditsAfterPurchase } from "@/lib/payments/add-credits-after-purchase";
import { getAppBaseUrl, isStripeConfigured } from "@/lib/stripe/config";
import { getStripeServerClient } from "@/lib/stripe/server";
import type { CreateCheckoutSessionResult } from "@/lib/types/payments";
import { createClient } from "@/lib/supabase/server";

export async function createCreditCheckoutSession(
  packId: CreditPackId,
): Promise<CreateCheckoutSessionResult> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Bejelentkezés szükséges." };
  }

  if (!isStripeConfigured()) {
    return { ok: false, error: "A fizetési szolgáltatás nincs konfigurálva." };
  }

  const pack = getCreditPack(packId);
  if (!pack) {
    return { ok: false, error: "Érvénytelen kredit csomag." };
  }

  const payerEmail = user.email?.trim();
  if (!payerEmail) {
    return {
      ok: false,
      error:
        "A fizetéshez e-mail cím szükséges. Jelentkezz be e-mail címmel, vagy add meg a fiókodban.",
    };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "craftsman") {
    return { ok: false, error: "Csak fusizók vásárolhatnak kreditet." };
  }

  const appUrl = getAppBaseUrl();

  try {
    const stripe = getStripeServerClient();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "elements",
      customer_email: payerEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: pack.stripeUnitAmount,
            product_data: {
              name: `${pack.name} – ${pack.credits} kredit`,
              description: pack.description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        payment_type: "credit_purchase",
        profile_id: user.id,
        credit_pack: pack.id,
        credits_amount: String(pack.credits),
      },
      return_url: `${appUrl}/szaki/kreditek?payment_return=1&pack=${pack.id}&session_id={CHECKOUT_SESSION_ID}`,
    });

    if (!session.client_secret) {
      return {
        ok: false,
        error: "A fizetési munkamenet létrehozása sikertelen.",
      };
    }

    return {
      ok: true,
      clientSecret: session.client_secret,
      sessionId: session.id,
    };
  } catch (err) {
    console.error("[createCreditCheckoutSession] Stripe hiba:", err);
    return { ok: false, error: "A fizetés indítása sikertelen. Próbáld újra." };
  }
}

export async function completeCreditPurchaseAfterCheckout(
  sessionId: string,
  packId: string,
): Promise<{ ok: boolean; credited: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, credited: false, error: "Bejelentkezés szükséges." };
  }

  if (!isStripeConfigured()) {
    return {
      ok: false,
      credited: false,
      error: "A fizetési szolgáltatás nincs konfigurálva.",
    };
  }

  const pack = getCreditPack(packId);
  if (!pack) {
    return { ok: false, credited: false, error: "Érvénytelen csomag." };
  }

  try {
    const stripe = getStripeServerClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return { ok: true, credited: false };
    }

    const metadata = session.metadata ?? {};
    if (
      metadata.payment_type !== "credit_purchase" ||
      metadata.profile_id !== user.id ||
      metadata.credit_pack !== pack.id
    ) {
      return {
        ok: false,
        credited: false,
        error: "Érvénytelen fizetési session.",
      };
    }

    const result = await addCreditsAfterPurchase({
      profileId: user.id,
      amount: pack.credits,
      description: `${pack.name} csomag vásárlás (${pack.credits} kredit)`,
      idempotencyKey: `credit-purchase-${sessionId}`,
      metadata: {
        stripe_session_id: sessionId,
        credit_pack: pack.id,
        payment_type: "credit_purchase",
      },
    });

    if (!result.ok) {
      return { ok: false, credited: false, error: result.error };
    }

    revalidatePath("/szaki", "layout");
    revalidatePath("/szaki/kreditek");

    return { ok: true, credited: true };
  } catch (err) {
    console.error("[completeCreditPurchase] hiba:", err);
    return {
      ok: false,
      credited: false,
      error: "A fizetés ellenőrzése sikertelen.",
    };
  }
}
