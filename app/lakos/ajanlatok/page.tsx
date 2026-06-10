import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientHowItWorks } from "@/components/client/client-how-it-works";
import { OfferCard } from "@/components/client/offer-card";
import { EmptyState } from "@/components/ui/empty-state";
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

        {offers.length === 0 && (
          <div className="mb-6">
            <ClientHowItWorks compact />
          </div>
        )}

        {offers.length === 0 ? (
          <EmptyState
            title="Még nincs ajánlat"
            description="Amint fusizók pályáznak a munkáidra, itt fognak megjelenni. Addig is ellenőrizd, hogy a hirdetésed részletes és jól látható-e."
            actions={[
              { href: "/lakos", label: "Új munka feladása" },
              { href: "/lakos/hirdeteseim", label: "Hirdetéseim" },
            ]}
          />
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
