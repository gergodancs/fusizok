export function getStripeContactUnlockPriceHuf(): number {
  const raw = process.env.STRIPE_CONTACT_UNLOCK_PRICE_HUF;
  const parsed = raw ? Number.parseInt(raw, 10) : 990;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 990;
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
