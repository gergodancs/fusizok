export type CreditPackId = "starter" | "pro" | "king";

export type CreditPack = {
  id: CreditPackId;
  name: string;
  emoji: string;
  credits: number;
  priceEur: number;
  /** Stripe unit_amount (cent). */
  stripeUnitAmount: number;
  description: string;
  featured?: boolean;
};

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Kezdő fúró",
    emoji: "🛠️",
    credits: 10,
    priceEur: 9,
    stripeUnitAmount: 900,
    description: "Ideális, ha most kezded a pályázást.",
  },
  {
    id: "pro",
    name: "Profi Mester",
    emoji: "💼",
    credits: 25,
    priceEur: 20,
    stripeUnitAmount: 2000,
    description: "A legnépszerűbb csomag aktív fusizóknak.",
    featured: true,
  },
  {
    id: "king",
    name: "Fusik Királya",
    emoji: "🚀",
    credits: 60,
    priceEur: 45,
    stripeUnitAmount: 4500,
    description: "Maximális lendület a szezonra.",
  },
];

export function getCreditPack(packId: string): CreditPack | undefined {
  return CREDIT_PACKS.find((pack) => pack.id === packId);
}
