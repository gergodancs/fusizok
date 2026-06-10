import type { User } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { buildWelcomeEmailHtml } from "@/lib/notification-templates";
import { getAppBaseUrl } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/profile";

export const WELCOME_EMAIL_SENT_AT_KEY = "welcome_email_sent_at";

export type WelcomeEmailResult =
  | { sent: true; id?: string }
  | {
      sent: false;
      reason: "already_sent" | "no_email" | "not_configured" | "send_failed";
      error?: string;
    };

function resolveDisplayName(user: User, fallback?: string | null): string {
  const metadata = user.user_metadata ?? {};
  const fromMeta =
    (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    "";

  if (fromMeta) {
    return fromMeta;
  }

  if (fallback?.trim()) {
    return fallback.trim();
  }

  const emailLocal = user.email?.split("@")[0]?.trim();
  return emailLocal || "Fusizó";
}

function hasWelcomeEmailBeenSent(user: User): boolean {
  const metadata = user.user_metadata ?? {};
  return Boolean(
    typeof metadata[WELCOME_EMAIL_SENT_AT_KEY] === "string" &&
      metadata[WELCOME_EMAIL_SENT_AT_KEY],
  );
}

async function markWelcomeEmailSent(user: User): Promise<void> {
  const sentAt = new Date().toISOString();
  const metadata = {
    ...user.user_metadata,
    [WELCOME_EMAIL_SENT_AT_KEY]: sentAt,
  };

  const admin = createAdminClient();
  if (admin) {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: metadata,
    });

    if (error) {
      console.error("[welcome-email] Admin metadata frissítési hiba:", error.message);
    }
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: metadata });

  if (error) {
    console.error("[welcome-email] Metadata frissítési hiba:", error.message);
  }
}

function resolveActionUrl(role: UserRole): string {
  const baseUrl = getAppBaseUrl();
  return role === "craftsman" ? `${baseUrl}/szaki` : `${baseUrl}/lakos`;
}

function resolveSubject(role: UserRole): string {
  return role === "craftsman"
    ? "Üdv fusizóként a Fusizok.hu-n – 100 induló kredited van"
    : "Üdvözlünk a Fusizok.hu-n – írd ki ingyen a munkát";
}

/**
 * Egyszer küld üdvözlő e-mailt regisztráció / első OAuth belépés után.
 * Idempotens: user_metadata.welcome_email_sent_at alapján.
 */
export async function maybeSendWelcomeEmail(
  user: User,
  role: UserRole,
  options?: { fullName?: string | null },
): Promise<WelcomeEmailResult> {
  if (!user.email?.trim()) {
    return { sent: false, reason: "no_email" };
  }

  if (hasWelcomeEmailBeenSent(user)) {
    return { sent: false, reason: "already_sent" };
  }

  const fullName = resolveDisplayName(user, options?.fullName);
  const actionUrl = resolveActionUrl(role);

  const result = await sendEmail({
    to: user.email,
    subject: resolveSubject(role),
    html: buildWelcomeEmailHtml({
      fullName,
      role,
      actionUrl,
    }),
    fromType: "informational",
  });

  if (!result.ok) {
    return {
      sent: false,
      reason: result.error?.includes("RESEND_API_KEY")
        ? "not_configured"
        : "send_failed",
      error: result.error,
    };
  }

  await markWelcomeEmailSent(user);

  return { sent: true, id: result.id };
}
