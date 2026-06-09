/** Stripe Checkout HUF minimum (forintban). */
export const STRIPE_HUF_MIN_FORINTS = 175;

/**
 * Stripe Checkout HUF-nál a unit_amount 2 tizedesjeggyel számol (pl. 990 Ft → 99000).
 * @see https://docs.stripe.com/currencies – HUF „charge two-decimal amounts”
 */
export const STRIPE_HUF_CHECKOUT_UNIT_MULTIPLIER = 100;

export function hufToStripeCheckoutUnitAmount(huf: number): number {
  return Math.round(huf * STRIPE_HUF_CHECKOUT_UNIT_MULTIPLIER);
}

export function parsePriceHufFromEnv(raw: string | undefined, fallback: number): number {
  if (!raw?.trim()) {
    return fallback;
  }

  const normalized = raw.trim().replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.round(parsed);
}

export function validateStripeContactUnlockPrice(huf: number):
  | { ok: true; unitAmount: number }
  | { ok: false; error: string } {
  if (huf < STRIPE_HUF_MIN_FORINTS) {
    return {
      ok: false,
      error: `A chat díj (${huf} Ft) a Stripe minimum (${STRIPE_HUF_MIN_FORINTS} Ft) alatt van. Állítsd a STRIPE_CONTACT_UNLOCK_PRICE_HUF értékét legalább ${STRIPE_HUF_MIN_FORINTS}-re (ajánlott: 990).`,
    };
  }

  return { ok: true, unitAmount: hufToStripeCheckoutUnitAmount(huf) };
}
