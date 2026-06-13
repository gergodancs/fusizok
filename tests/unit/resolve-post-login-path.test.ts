import { describe, expect, it } from "vitest";
import {
  resolvePostLoginPath,
  resolveRoleFromUser,
} from "@/lib/auth/resolve-post-login-path";

describe("resolvePostLoginPath", () => {
  it("fusizót a /szaki-ra irányít alapból", () => {
    expect(resolvePostLoginPath(undefined, "craftsman")).toBe("/szaki");
    expect(resolvePostLoginPath("/", "craftsman")).toBe("/szaki");
  });

  it("lakost a /lakos-ra irányít alapból", () => {
    expect(resolvePostLoginPath(undefined, "client")).toBe("/lakos");
  });

  it("fusizót nem küld /lakos redirect miatt munkafeladásra", () => {
    expect(resolvePostLoginPath("/lakos", "craftsman")).toBe("/szaki");
    expect(resolvePostLoginPath("/lakos/ajanlatok", "craftsman")).toBe("/szaki");
  });

  it("lakost nem küld /szaki redirect miatt fusizó oldalra", () => {
    expect(resolvePostLoginPath("/szaki", "client")).toBe("/lakos/ajanlatok");
  });

  it("megtartja a kompatibilis redirectet", () => {
    expect(resolvePostLoginPath("/szaki/profil", "craftsman")).toBe(
      "/szaki/profil",
    );
    expect(resolvePostLoginPath("/lakos/ajanlatok", "client")).toBe(
      "/lakos/ajanlatok",
    );
  });
});

describe("resolveRoleFromUser", () => {
  it("a profil szerepköre élvez elsőbbséget", () => {
    expect(
      resolveRoleFromUser("craftsman", "client", "client"),
    ).toBe("craftsman");
  });

  it("új fióknál a role hintet használja", () => {
    expect(resolveRoleFromUser(null, null, "craftsman")).toBe("craftsman");
  });
});
