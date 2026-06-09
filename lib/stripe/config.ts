import { parsePriceHufFromEnv } from "@/lib/stripe/huf-amount";

const DEFAULT_CONTACT_UNLOCK_PRICE_HUF = 990;

export function getStripeContactUnlockPriceHuf(): number {
  return parsePriceHufFromEnv(
    process.env.STRIPE_CONTACT_UNLOCK_PRICE_HUF,
    DEFAULT_CONTACT_UNLOCK_PRICE_HUF,
  );
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
}
