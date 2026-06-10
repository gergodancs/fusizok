import type { Metadata } from "next";
import { Suspense } from "react";
import { CreditPackCard } from "@/components/credits/credit-pack-card";
import { CreditPurchaseReturn } from "@/components/credits/credit-purchase-return";
import { PageContainer } from "@/components/layout/page-container";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import { getCraftsmanCreditBalance } from "@/lib/credits/balance";
import { BID_CREDIT_COST } from "@/lib/credits/constants";
import { formatCreditBalance } from "@/lib/credits/format";
import { CREDIT_PACKS } from "@/lib/credits/packages";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Kreditvásárlás – fusizok.hu",
  description: "Töltsd fel a pályázati krediteidet és jelentkezz munkákra.",
};

type KreditekPageProps = {
  searchParams: Promise<{ purchased?: string }>;
};

export default async function KreditekPage({ searchParams }: KreditekPageProps) {
  const { user } = await requireCraftsman("/szaki/kreditek");
  const credits = await getCraftsmanCreditBalance(user.id);
  const { purchased } = await searchParams;

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <Suspense fallback={null}>
        <CreditPurchaseReturn />
      </Suspense>
      <PageContainer>
        <div className="mb-8">
          <p className={pageEyebrowClassName}>Kreditek</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
            Kreditvásárlás
          </h1>
          <p className="mt-2 text-zinc-400">
            Minden pályázat {BID_CREDIT_COST} kreditbe kerül. Válassz csomagot,
            töltsd fel az egyenleged, és jelentkezz bátran új munkákra.
          </p>
        </div>

        <div className={`${cardClassName} mb-8 p-6 text-center sm:p-8`}>
          <p className="text-sm text-zinc-500">Aktuális egyenleged</p>
          <p className="mt-1 text-4xl font-black text-amber-400">
            {formatCreditBalance(credits)}
          </p>
        </div>

        {purchased === "1" && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Sikeres vásárlás! A kreditek hozzáadva az egyenlegedhez.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <CreditPackCard key={pack.id} pack={pack} />
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
