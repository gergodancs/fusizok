import type { JobBidStatus } from "@/lib/types/job-bid";
import type { JobStatus } from "@/lib/types/job";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  open: "Nyitott",
  assigned: "Kiosztva",
  completed: "Befejezve",
  cancelled: "Törölve",
};

export const JOB_BID_STATUS_LABELS: Record<JobBidStatus, string> = {
  pending: "Függőben",
  accepted: "Elfogadva",
  rejected: "Elutasítva",
  active: "Aktív chat",
  pending_payment: "Válasz fizetésre vár",
};

export function getJobStatusLabel(status: string): string {
  return JOB_STATUS_LABELS[status as JobStatus] ?? status;
}

export function getJobBidStatusLabel(status: string): string {
  return JOB_BID_STATUS_LABELS[status as JobBidStatus] ?? status;
}

export function getBidActivityStatusLabel(bid: {
  status: string;
  contact_shared: boolean;
}): string {
  if (bid.contact_shared && bid.status === "pending_payment") {
    return "Chat – fusizó fizetésre vár";
  }
  if (bid.contact_shared) {
    return "Kontakt megosztva";
  }
  return getJobBidStatusLabel(bid.status);
}
