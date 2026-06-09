export type Review = {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  image_url: string | null;
  created_at: string;
};

export type ReviewInsert = {
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string | null;
  image_url?: string | null;
};

export type ReviewWithReviewer = Review & {
  reviewer_name: string | null;
  reviewer_avatar_url: string | null;
};

export type CraftsmanReviewSummary = {
  averageRating: number | null;
  reviewCount: number;
  reviews: ReviewWithReviewer[];
};
