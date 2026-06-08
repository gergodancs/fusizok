import { shareContact } from "@/app/actions/share-contact";
import type { ClientBidOffer } from "@/lib/client-bids";
import { getBidActivityStatusLabel } from "@/lib/status-labels";
import { btnPrimaryClassName, cardClassName } from "@/lib/ui-classes";

type OfferCardProps = {
  offer: ClientBidOffer;
};

export function OfferCard({ offer }: OfferCardProps) {
  const shareAction = shareContact.bind(null, offer.id);

  return (
    <article className={`${cardClassName} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-zinc-100">{offer.job_title}</h3>
          <p className="mt-1 text-sm text-amber-400">
            {offer.craftsman_name ?? "Fusizó"}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs ${
            offer.contact_shared
              ? "bg-emerald-500/15 font-semibold text-emerald-400"
              : "bg-zinc-700/80 text-zinc-400"
          }`}
        >
          {getBidActivityStatusLabel(offer)}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm text-zinc-400">
        <p>
          Ár:{" "}
          <span className="font-semibold text-zinc-200">
            {offer.price !== null
              ? `${Number(offer.price).toLocaleString("hu-HU")} Ft`
              : "Nincs megadva"}
          </span>
        </p>
        <p>
          Vállalási idő:{" "}
          <span className="text-zinc-200">
            {offer.availability_duration ?? "—"}
          </span>
        </p>
        {offer.message && (
          <p className="italic text-zinc-500">&bdquo;{offer.message}&ldquo;</p>
        )}
      </div>

      <div className="mt-5">
        {offer.contact_shared ? (
          <p className="text-sm font-medium text-emerald-400">
            Kapcsolat megosztva – a chat elérhető az Üzenetek menüben.
          </p>
        ) : (
          <form action={shareAction}>
            <button type="submit" className={btnPrimaryClassName}>
              Kapcsolat megosztása
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
