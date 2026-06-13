import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

export type PendingAuthCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

/**
 * Supabase kliens Route Handlerhez – a session cookie-k gyűjtése utólagos
 * redirect válaszra íráshoz (megbízhatóbb első OAuth bejelentkezésnél).
 */
export function createRouteHandlerClient(
  request: NextRequest,
  pendingCookies: PendingAuthCookie[],
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => {
            pendingCookies.push({
              name: cookie.name,
              value: cookie.value,
              options: cookie.options,
            });
          });
        },
      },
    },
  );
}

export function applyPendingCookies(
  response: NextResponse,
  pendingCookies: PendingAuthCookie[],
): NextResponse {
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}
