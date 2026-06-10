import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const palyazMatch = /^\/szaki\/palyaz\/([^/]+)\/?$/.exec(
    request.nextUrl.pathname,
  );

  if (palyazMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/hirdetes/${palyazMatch[1]}`;
    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
