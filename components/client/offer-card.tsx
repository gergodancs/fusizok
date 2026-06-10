import Link from "next/link";
import { rejectBid } from "@/app/actions/reject-bid";
import { ShareContactButton } from "@/components/client/share-contact-button";
import { UserAvatar } from "@/components/profile/user-avatar";
import { VerifiedBadge } from "@/components/profile/verified-badge";
import { StarRating } from "@/components/reviews/star-rating";
import type { ClientBidOffer } from "@/lib/client-bids";
import { getBidActivityStatusLabel } from "@/lib/status-labels";
import { cardClassName } from "@/lib/ui-classes";

type OfferCardProps = {
  offer: ClientBidOffer;
};

export function OfferCard({ offer }: OfferCardProps) {
  const rejectAction = rejectBid.bind(null, offer.id);
  const canRespond =
    !offer.contact_shared &&
    (offer.status === "pending" || offer.status === "pending_payment");

  return (
    <article className={`${cardClassName} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <UserAvatar
            name={offer.craftsman_name}
            avatarUrl={offer.craftsman_avatar_url}
            size="md"
          />
          <div>
            <h3 className="font-bold text-zinc-100">{offer.job_title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-sm text-amber-400">
                {offer.craftsman_name ?? "Fusizó"}
              </p>
              {offer.craftsman_is_verified && <VerifiedBadge />}
            </div>
            {offer.craftsman_avg_rating !== null && (
              <div className="mt-1 flex items-center gap-2">
                <StarRating rating={offer.craftsman_avg_rating} size="sm" />
                <span className="text-xs text-zinc-500">
                  ({offer.craftsman_review_count})
                </span>
              </div>
            )}
          </div>
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

      <div className="mt-4">
        <Link
          href={`/lakos/fusizo/${offer.craftsman_id}?bid=${offer.id}`}
          className="inline-flex text-sm font-medium text-amber-400 hover:text-amber-300"
        >
          Profil, galéria és értékelések →
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {offer.contact_shared ? (
          <p className="text-sm font-medium text-emerald-400">
            Kapcsolat megosztva – a chat elérhető az Üzenetek menüben.
          </p>
        ) : offer.status === "rejected" ? (
          <p className="text-sm text-zinc-500">Elutasított ajánlat.</p>
        ) : canRespond ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <ShareContactButton bidId={offer.id} />
            <form action={rejectAction}>
              <button
                type="submit"
                className="w-full rounded-xl border border-zinc-600 px-5 py-3.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
              >
                Elutasítás
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </article>
  );
}
