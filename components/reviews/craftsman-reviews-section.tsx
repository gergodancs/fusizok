import Image from "next/image";
import { StarRating } from "@/components/reviews/star-rating";
import { UserAvatar } from "@/components/profile/user-avatar";
import type { CraftsmanReviewSummary } from "@/lib/types/review";
import { labelClassName } from "@/lib/ui-classes";

type CraftsmanReviewsSectionProps = {
  summary: CraftsmanReviewSummary;
};

export function CraftsmanReviewsSection({
  summary,
}: CraftsmanReviewsSectionProps) {
  const { averageRating, reviewCount, reviews } = summary;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className={labelClassName}>Értékelések</span>
          {reviewCount > 0 && averageRating !== null ? (
            <div className="mt-2 flex items-center gap-3">
              <p className="text-3xl font-black text-amber-400">
                {averageRating.toFixed(1)}
              </p>
              <div>
                <StarRating rating={averageRating} />
                <p className="mt-1 text-sm text-zinc-500">
                  {reviewCount} vélemény
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">
              Még nincs értékelésed. Az első vélemények a lezárt munkák után
              érkeznek.
            </p>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-4"
            >
              <div className="flex items-start gap-3">
                <UserAvatar
                  name={review.reviewer_name}
                  avatarUrl={review.reviewer_avatar_url}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-zinc-200">
                      {review.reviewer_name ?? "Lakos"}
                    </p>
                    <time
                      className="text-xs text-zinc-500"
                      dateTime={review.created_at}
                    >
                      {new Date(review.created_at).toLocaleDateString("hu-HU")}
                    </time>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.comment && (
                    <p className="mt-2 text-sm text-zinc-400">{review.comment}</p>
                  )}
                  {review.image_url && (
                    <a
                      href={review.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative mt-3 block aspect-video max-w-xs overflow-hidden rounded-lg border border-zinc-700"
                    >
                      <Image
                        src={review.image_url}
                        alt="Munkáról készült fotó"
                        fill
                        className="object-cover"
                        sizes="320px"
                        unoptimized
                      />
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
