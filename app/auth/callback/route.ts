import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/auth/get-site-url";
import { parseOAuthRoleParam } from "@/lib/auth/oauth-role";
import {
  resolvePostLoginPath,
  resolveRoleFromUser,
} from "@/lib/auth/resolve-post-login-path";
import { scheduleWelcomeEmail } from "@/lib/auth/welcome-email";
import { syncUserProfile } from "@/lib/auth/sync-profile";
import { PRIVACY_VERSION } from "@/lib/privacy";
import { TERMS_VERSION } from "@/lib/terms";
import {
  applyPendingCookies,
  createRouteHandlerClient,
  type PendingAuthCookie,
} from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const roleHint = parseOAuthRoleParam(searchParams.get("role"));
  const acceptTerms = searchParams.get("accept_terms") === "1";
  const siteUrl = getSiteUrl(request);

  if (!code) {
    console.error("[auth/callback] Hiányzó auth kód");
    return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_failed`);
  }

  const pendingCookies: PendingAuthCookie[] = [];
  const supabase = createRouteHandlerClient(request, pendingCookies);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] Session csere hiba:", error.message);
    return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[auth/callback] Nincs user a session csere után");
    return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_failed`);
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const metadataUpdate: Record<string, string> = {};
  const isNewAccount = !existingProfile?.role;

  if (roleHint && isNewAccount) {
    metadataUpdate.role = roleHint;
  }
  if (acceptTerms) {
    metadataUpdate.terms_accepted_at = new Date().toISOString();
    metadataUpdate.terms_version = TERMS_VERSION;
    metadataUpdate.privacy_accepted_at = new Date().toISOString();
    metadataUpdate.privacy_version = PRIVACY_VERSION;
  }

  if (Object.keys(metadataUpdate).length > 0) {
    const { error: metadataError } = await supabase.auth.updateUser({
      data: metadataUpdate,
    });

    if (metadataError) {
      console.error(
        "[auth/callback] User metadata frissítési hiba:",
        metadataError.message,
      );
    } else if (roleHint && isNewAccount) {
      console.log("[auth/callback] Szerepkör beállítva:", roleHint);
    }
  }

  const {
    data: { user: refreshedUser },
  } = await supabase.auth.getUser();

  const activeUser = refreshedUser ?? user;
  await syncUserProfile(activeUser, supabase);

  const role = resolveRoleFromUser(
    existingProfile?.role ?? null,
    activeUser.user_metadata?.role,
    roleHint,
  );

  if (role === "craftsman" || role === "client") {
    if (isNewAccount) {
      scheduleWelcomeEmail(activeUser, role);
    }
  }

  const next = resolvePostLoginPath(nextParam ?? undefined, role);
  const redirectResponse = NextResponse.redirect(`${siteUrl}${next}`);

  console.log("[auth/callback] Sikeres bejelentkezés, átirányítás:", next);
  return applyPendingCookies(redirectResponse, pendingCookies);
}
