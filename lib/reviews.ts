import { createClient } from "@/lib/supabase/server";
import type { CraftsmanReviewSummary, ReviewWithReviewer } from "@/lib/types/review";

export async function getCraftsmanReviewSummary(
  craftsmanId: string,
): Promise<CraftsmanReviewSummary> {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      "id, job_id, reviewer_id, reviewee_id, rating, comment, image_url, created_at",
    )
    .eq("reviewee_id", craftsmanId)
    .order("created_at", { ascending: false });

  if (error || !reviews?.length) {
    if (error) {
      console.error("Értékelések lekérdezési hiba:", error.message);
    }
    return { averageRating: null, reviewCount: 0, reviews: [] };
  }

  const reviewerIds = [...new Set(reviews.map((r) => r.reviewer_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", reviewerIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      { name: p.full_name, avatar: p.avatar_url },
    ]),
  );

  const enriched: ReviewWithReviewer[] = reviews.map((review) => {
    const profile = profileMap.get(review.reviewer_id);
    return {
      ...(review as ReviewWithReviewer),
      reviewer_name: profile?.name ?? null,
      reviewer_avatar_url: profile?.avatar ?? null,
    };
  });

  const total = enriched.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = Math.round((total / enriched.length) * 10) / 10;

  return {
    averageRating,
    reviewCount: enriched.length,
    reviews: enriched,
  };
}

export type ConversationReviewContext = {
  jobId: string;
  craftsmanId: string;
  jobStatus: string;
  contactShared: boolean;
  existingReviewId: string | null;
  canCompleteJob: boolean;
  canSubmitReview: boolean;
};

export async function getConversationReviewContext(
  conversationId: string,
  clientId: string,
): Promise<ConversationReviewContext | null> {
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("job_id, client_id, craftsman_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation || conversation.client_id !== clientId) {
    return null;
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("status")
    .eq("id", conversation.job_id)
    .maybeSingle();

  const { data: bid } = await supabase
    .from("job_bids")
    .select("contact_shared, status")
    .eq("job_id", conversation.job_id)
    .eq("craftsman_id", conversation.craftsman_id)
    .maybeSingle();

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("job_id", conversation.job_id)
    .eq("reviewer_id", clientId)
    .maybeSingle();

  const contactShared = Boolean(bid?.contact_shared);
  const jobStatus = job?.status ?? "open";
  const isCompleted = jobStatus === "completed";

  return {
    jobId: conversation.job_id,
    craftsmanId: conversation.craftsman_id,
    jobStatus,
    contactShared,
    existingReviewId: existingReview?.id ?? null,
    canCompleteJob: contactShared && !isCompleted && bid?.status === "active",
    canSubmitReview:
      contactShared &&
      isCompleted &&
      !existingReview &&
      bid?.status === "active",
  };
}
