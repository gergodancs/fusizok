import Link from "next/link";
import { ImageGalleryGrid } from "@/components/gallery/image-gallery-grid";
import { UserAvatar } from "@/components/profile/user-avatar";
import { CraftsmanReviewsSection } from "@/components/reviews/craftsman-reviews-section";
import { StarRating } from "@/components/reviews/star-rating";
import type {
  ClientBidPreview,
  CraftsmanPublicProfile,
} from "@/lib/craftsman-public-profile";
import { cardClassName } from "@/lib/ui-classes";

type CraftsmanPublicProfileViewProps = {
  profile: CraftsmanPublicProfile;
  bidPreview?: ClientBidPreview | null;
  backHref?: string;
  backLabel?: string;
};

export function CraftsmanPublicProfileView({
  profile,
  bidPreview,
  backHref = "/lakos/ajanlatok",
  backLabel = "← Vissza az ajánlatokhoz",
}: CraftsmanPublicProfileViewProps) {
  const { reviewSummary } = profile;

  return (
    <div className="space-y-6">
      {backHref && (
        <Link
          href={backHref}
          className="inline-block text-sm text-amber-400 hover:text-amber-300"
        >
          {backLabel}
        </Link>
      )}

      <div className={`${cardClassName} p-6 sm:p-8`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <UserAvatar
            name={profile.full_name}
            avatarUrl={profile.avatar_url}
            size="xl"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black text-zinc-50">
              {profile.full_name ?? "Fusizó"}
            </h1>
            {reviewSummary.averageRating !== null && (
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={reviewSummary.averageRating} />
                <span className="text-sm text-zinc-400">
                  {reviewSummary.averageRating.toFixed(1)} (
                  {reviewSummary.reviewCount} értékelés)
                </span>
              </div>
            )}
            {profile.professions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.professions.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
            {profile.districts.length > 0 && (
              <p className="mt-3 text-sm text-zinc-500">
                Kerületek: {profile.districts.join(", ")}
              </p>
            )}
          </div>
        </div>

        {profile.bio ? (
          <div className="mt-6 border-t border-zinc-700 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Bemutatkozás
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {profile.bio}
            </p>
          </div>
        ) : (
          <p className="mt-6 border-t border-zinc-700 pt-6 text-sm italic text-zinc-500">
            A fusizó még nem írt bemutatkozást.
          </p>
        )}
      </div>

      {bidPreview && (
        <div className={`${cardClassName} border-amber-500/20 p-5`}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500">
            Pályázat erre a munkára
          </h2>
          <p className="mt-1 font-bold text-zinc-100">{bidPreview.job_title}</p>
          <div className="mt-3 space-y-1 text-sm text-zinc-400">
            <p>
              Ár:{" "}
              <span className="font-semibold text-zinc-200">
                {bidPreview.price !== null
                  ? `${bidPreview.price.toLocaleString("hu-HU")} Ft`
                  : "Nincs megadva"}
              </span>
            </p>
            <p>
              Vállalási idő:{" "}
              <span className="text-zinc-200">
                {bidPreview.availability_duration ?? "—"}
              </span>
            </p>
            {bidPreview.message && (
              <p className="mt-2 italic text-zinc-500">
                &bdquo;{bidPreview.message}&ldquo;
              </p>
            )}
          </div>
        </div>
      )}

      <div className={`${cardClassName} p-6 sm:p-8`}>
        <ImageGalleryGrid
          imageUrls={profile.portfolioImages.map((img) => img.image_url)}
          title="Referencia galéria"
          emptyMessage="Még nincs feltöltött referenciakép."
        />
      </div>

      <div className={`${cardClassName} p-6 sm:p-8`}>
        <CraftsmanReviewsSection summary={reviewSummary} />
      </div>
    </div>
  );
}
