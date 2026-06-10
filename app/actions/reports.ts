"use server";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type ReportReason = "spam" | "harassment" | "fraud" | "other";

export type SubmitReportState = {
  error?: string;
  success?: boolean;
};

const VALID_REASONS: ReportReason[] = ["spam", "harassment", "fraud", "other"];

export async function submitReport(
  _prevState: SubmitReportState,
  formData: FormData,
): Promise<SubmitReportState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Bejelentkezés szükséges." };
  }

  const reportedUserId = formData.get("reported_user_id") as string;
  const reason = formData.get("reason") as ReportReason;
  const details = (formData.get("details") as string)?.trim() || null;
  const contextType = formData.get("context_type") as string | null;
  const contextId = (formData.get("context_id") as string) || null;

  if (!reportedUserId || reportedUserId === user.id) {
    return { error: "Érvénytelen jelentés." };
  }

  if (!VALID_REASONS.includes(reason)) {
    return { error: "Válassz jelentési okot." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_user_id: reportedUserId,
    reason,
    details,
    context_type:
      contextType === "chat" || contextType === "profile" ? contextType : null,
    context_id: contextId,
  });

  if (error) {
    console.error("[submitReport] Mentési hiba:", error.message);
    return { error: "A jelentés mentése sikertelen." };
  }

  return { success: true };
}
