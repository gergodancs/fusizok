import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OfferCard } from "@/components/client/offer-card";
import { PageContainer } from "@/components/layout/page-container";
import { getAuthContext } from "@/lib/auth/session";
import { getClientJobOffers } from "@/lib/client-bids";
import { markClientOffersViewed } from "@/lib/notifications";
import { pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Ajánlatok – fusizok.hu",
  description: "Beérkezett fusizó pályázatok a munkáidra.",
};

export const dynamic = "force-dynamic";

export default async function LakosAjanlatokPage() {
  const { user, profile } = await getAuthContext();

  if (!user) {
    redirect("/login?redirect=/lakos/ajanlatok");
  }

  if (profile?.role === "craftsman") {
    redirect("/szaki");
  }

  await markClientOffersViewed(user.id);
  const offers = await getClientJobOffers(user.id);

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <div className="mb-8">
          <p className={pageEyebrowClassName}>Ajánlatok</p>
          <h1 className="mt-2 text-3xl font-black text-zinc-50">
            Beérkezett pályázatok
          </h1>
          <p className="mt-2 text-zinc-400">
            Itt látod, kik jelentkeztek a munkáidra. Ha tetszik egy ajánlat,
            oszd meg velük a kapcsolatot és kezdj el beszélgetni.
          </p>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-800/40 p-12 text-center">
            <p className="text-lg font-semibold text-zinc-200">
              Még nincs ajánlat
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Amint fusizók pályáznak a munkáidra, itt fognak megjelenni.
            </p>
            <Link
              href="/lakos"
              className="mt-6 inline-block text-sm font-medium text-amber-400 hover:text-amber-300"
            >
              Új munka feladása →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
