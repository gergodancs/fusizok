import { Resend } from "resend";

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  ok: boolean;
  id?: string;
  error?: string;
};

let resendClient: Resend | null = null;

/** Feladó cím – teszt: onboarding@resend.dev, éles: info@fusizok.hu */
export function getEmailFromAddress(): string {
  return (
    process.env.EMAIL_FROM_ADDRESS?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Fusizók <onboarding@resend.dev>"
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

  if (!client) {
    console.info("[email] Mock küldés – RESEND_API_KEY nincs beállítva", {
      to: params.to,
      subject: params.subject,
    });
    return { ok: false, error: "RESEND_API_KEY nincs beállítva" };
  }

  try {
    const { data, error } = await client.emails.send({
      from: getEmailFromAddress(),
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      console.error("[email] Resend API hiba:", error);
      return { ok: false, error: error.message };
    }

    console.log("[email] Elküldve:", params.to, params.subject, data?.id);
    return { ok: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Küldési exception:", message);
    return { ok: false, error: message };
  }
}
