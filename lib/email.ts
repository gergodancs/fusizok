import { Resend } from "resend";

export type EmailFromType = "transactional" | "informational";

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** transactional = értesítések, informational = üdvözlő / tájékoztató */
  fromType?: EmailFromType;
};

export type SendEmailResult = {
  ok: boolean;
  id?: string;
  error?: string;
};

const DEFAULT_FROM: Record<EmailFromType, string> = {
  transactional: "Fusizok Értesítés <noreply@fusizok.hu>",
  informational: "Fusizok.hu <info@fusizok.hu>",
};

let resendClient: Resend | null = null;

export function getEmailFromAddress(
  fromType: EmailFromType = "transactional",
): string {
  if (fromType === "informational") {
    return (
      process.env.EMAIL_FROM_INFO?.trim() ||
      process.env.EMAIL_FROM_ADDRESS?.trim() ||
      DEFAULT_FROM.informational
    );
  }

  return (
    process.env.EMAIL_FROM_NOTIFICATIONS?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    DEFAULT_FROM.transactional
  );
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export async function sendEmail(
  params: SendEmailParams,
): Promise<SendEmailResult> {
  const client = getResendClient();
  const fromType = params.fromType ?? "transactional";

  if (!client) {
    console.info("[email] Mock küldés – RESEND_API_KEY nincs beállítva", {
      to: params.to,
      subject: params.subject,
      fromType,
    });
    return { ok: false, error: "RESEND_API_KEY nincs beállítva" };
  }

  try {
    const { data, error } = await client.emails.send({
      from: getEmailFromAddress(fromType),
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      console.error("[email] Resend API hiba:", error);
      return { ok: false, error: error.message };
    }

    console.log("[email] Elküldve:", {
      to: params.to,
      subject: params.subject,
      from: getEmailFromAddress(fromType),
      id: data?.id,
    });
    return { ok: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Küldési exception:", message);
    return { ok: false, error: message };
  }
}
