import type { AvailabilityDuration } from "@/lib/availability-options";

export type JobBidStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "active"
  | "pending_payment";

export type JobBid = {
  id: string;
  job_id: string;
  craftsman_id: string;
  price: number | null;
  message: string | null;
  availability_duration: AvailabilityDuration | string | null;
  contact_shared: boolean;
  status: JobBidStatus;
  created_at: string;
};

export type JobBidInsert = {
  job_id: string;
  craftsman_id: string;
  price?: number | null;
  message?: string | null;
  availability_duration: AvailabilityDuration | string;
  status?: JobBidStatus;
};
