import { describe, expect, it } from "vitest";
import {
  shouldRedirectOAuthCodeToCallback,
} from "@/lib/auth/oauth-callback-redirect";

describe("shouldRedirectOAuthCodeToCallback", () => {
  it("átirányít, ha code a főoldalon landol", () => {
    const params = new URLSearchParams(
      "code=abc&next=%2Fszaki",
    );
    expect(shouldRedirectOAuthCodeToCallback("/", params)).toBe(true);
  });

  it("nem irányít újra a callback útvonalról", () => {
    const params = new URLSearchParams("code=abc");
    expect(shouldRedirectOAuthCodeToCallback("/auth/callback", params)).toBe(
      false,
    );
  });

  it("oauth hiba esetén nem avatkozik be", () => {
    const params = new URLSearchParams("error=access_denied");
    expect(shouldRedirectOAuthCodeToCallback("/", params)).toBe(false);
  });
});
