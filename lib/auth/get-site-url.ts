import type { NextRequest } from "next/server";

/** Alkalmazás alap URL-je OAuth redirecthez és callbackhez. */
export function getSiteUrl(request?: NextRequest | Request): string {
  if (request) {
    const url = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`;
    }

    return url.origin;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
