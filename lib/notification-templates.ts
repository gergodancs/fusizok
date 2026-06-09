import { getAppBaseUrl } from "@/lib/stripe/config";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function emailLayout(title: string, bodyHtml: string, actionUrl: string): string {
  const appUrl = getAppBaseUrl();
  return `<!DOCTYPE html>
<html lang="hu">
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #18181b;">
  <h2 style="color: #d97706;">${escapeHtml(title)}</h2>
  ${bodyHtml}
  <p style="margin-top: 24px;">
    <a href="${actionUrl}" style="display: inline-block; background: #f59e0b; color: #18181b; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Megnyitás a Fusizók-on
    </a>
  </p>
  <p style="margin-top: 16px; font-size: 12px; color: #71717a;">
    <a href="${appUrl}">${appUrl}</a>
  </p>
</body>
</html>`;
}

export function buildNewMessageEmailHtml(params: {
  senderName: string;
  preview: string;
  chatUrl: string;
}): string {
  return emailLayout(
    "Új üzeneted érkezett a Fusizók-on!",
    `<p><strong>${escapeHtml(params.senderName)}</strong> üzenetet küldött neked:</p>
<blockquote style="margin: 16px 0; padding: 12px 16px; border-left: 4px solid #f59e0b; background: #fafafa;">
  ${escapeHtml(params.preview)}
</blockquote>`,
    params.chatUrl,
  );
}

export function buildBidRejectedEmailHtml(params: {
  clientName: string;
  jobTitle: string;
  activityUrl: string;
}): string {
  return emailLayout(
    "Pályázatod elutasítva",
    `<p><strong>${escapeHtml(params.clientName)}</strong> elutasította a(z)
<strong>${escapeHtml(params.jobTitle)}</strong> munkára adott pályázatodat.</p>`,
    params.activityUrl,
  );
}

export function buildBidAcceptedEmailHtml(params: {
  clientName: string;
  jobTitle: string;
  chatUrl: string;
  paymentRequired: boolean;
}): string {
  const body = params.paymentRequired
    ? `<p><strong>${escapeHtml(params.clientName)}</strong> megosztotta veled a kapcsolatot a(z)
<strong>${escapeHtml(params.jobTitle)}</strong> munkánál.</p>
<p>A válaszadáshoz egyszeri chat díj szükséges az alkalmazásban.</p>`
    : `<p><strong>Gratulálunk!</strong> ${escapeHtml(params.clientName)} elfogadta az ajánlatodat a(z)
<strong>${escapeHtml(params.jobTitle)}</strong> munkára, és elindult a chat!</p>`;

  return emailLayout(
    params.paymentRequired ? "Új érdeklődő – fizetés szükséges" : "Ajánlat elfogadva!",
    body,
    params.chatUrl,
  );
}

export function buildNewBidEmailHtml(params: {
  craftsmanName: string;
  jobTitle: string;
  offersUrl: string;
}): string {
  return emailLayout(
    "Új pályázat érkezett",
    `<p><strong>${escapeHtml(params.craftsmanName)}</strong> pályázott a(z)
<strong>${escapeHtml(params.jobTitle)}</strong> munkádra.</p>
<p>Nézd meg az ajánlatot az alkalmazásban.</p>`,
    params.offersUrl,
  );
}

export function buildChatUnlockedEmailHtml(params: {
  jobTitle: string;
  chatUrl: string;
}): string {
  return emailLayout(
    "Chat válaszadás aktiválva",
    `<p>Sikeres fizetés – most már válaszolhatsz a(z)
<strong>${escapeHtml(params.jobTitle)}</strong> munkához tartozó chatben.</p>`,
    params.chatUrl,
  );
}

export function buildJobCompletedEmailHtml(params: {
  clientName: string;
  jobTitle: string;
  activityUrl: string;
}): string {
  return emailLayout(
    "Munka lezárva",
    `<p><strong>${escapeHtml(params.clientName)}</strong> késznek jelölte a(z)
<strong>${escapeHtml(params.jobTitle)}</strong> munkát.</p>`,
    params.activityUrl,
  );
}
