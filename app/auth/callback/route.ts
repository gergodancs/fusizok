import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/auth/get-site-url";
import { parseOAuthRoleParam } from "@/lib/auth/oauth-role";
import { resolvePostLoginPath } from "@/lib/auth/resolve-post-login-path";
import { syncUserProfile } from "@/lib/auth/sync-profile";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const roleHint = parseOAuthRoleParam(searchParams.get("role"));
  const siteUrl = getSiteUrl(request);

  let next = nextParam && nextParam.startsWith("/") ? nextParam : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] Session csere hiba:", error.message);
      return NextResponse.redirect(
        `${siteUrl}/login?error=auth_callback_failed`,
      );
    }

    if (roleHint) {
      const { error: roleError } = await supabase.auth.updateUser({
        data: { role: roleHint },
      });

      if (roleError) {
        console.error(
          "[auth/callback] Szerepkör metadata frissítési hiba:",
          roleError.message,
        );
      } else {
        console.log("[auth/callback] Szerepkör beállítva:", roleHint);
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await syncUserProfile(user);

      const role =
        roleHint ??
        (typeof user.user_metadata?.role === "string"
          ? user.user_metadata.role
          : undefined);

      next = resolvePostLoginPath(next, role);
    }

    console.log("[auth/callback] Sikeres bejelentkezés, átirányítás:", next);
    return NextResponse.redirect(`${siteUrl}${next}`);
  }

  console.error("[auth/callback] Hiányzó auth kód");
  return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_failed`);
}
