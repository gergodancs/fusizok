import type { NextRequest } from "next/server";

/** OAuth PKCE kód, ha nem a callback útvonalon landol (Supabase Site URL hiba). */
export function shouldRedirectOAuthCodeToCallback(
  pathname: string,
  searchParams: URLSearchParams,
): boolean {
  return (
    pathname !== "/auth/callback" &&
    searchParams.has("code") &&
    !searchParams.has("error")
  );
}

export function buildOAuthCallbackRedirectUrl(request: NextRequest): URL {
  const url = request.nextUrl.clone();
  url.pathname = "/auth/callback";
  return url;
}
