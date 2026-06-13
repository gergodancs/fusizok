import type { UserRole } from "@/lib/types/profile";

function roleHome(role: string | undefined): string {
  return role === "craftsman" ? "/szaki" : "/lakos";
}

/**
 * Bejelentkezés utáni útvonal – a profil szerepköre élvez elsőbbséget a
 * régi /lakos vagy /szaki redirect paraméterekkel szemben.
 */
export function resolvePostLoginPath(
  redirectParam: string | undefined,
  role: string | undefined,
): string {
  const redirect =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : undefined;

  if (!redirect || redirect === "/") {
    return roleHome(role);
  }

  if (role === "craftsman") {
    if (redirect.startsWith("/lakos")) {
      return "/szaki";
    }
    return redirect;
  }

  if (role === "client") {
    if (redirect.startsWith("/szaki")) {
      return "/lakos/ajanlatok";
    }
    return redirect;
  }

  return redirect;
}

export function withPioneerZoneQuery(
  path: string,
  variant: "craftsman" | "client",
): string {
  const [pathname, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  params.set("pioneerZone", variant);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function resolveRoleFromUser(
  profileRole: UserRole | null | undefined,
  metadataRole: unknown,
  roleHint: UserRole | null,
): UserRole | undefined {
  if (profileRole === "craftsman" || profileRole === "client") {
    return profileRole;
  }
  if (roleHint) {
    return roleHint;
  }
  if (metadataRole === "craftsman" || metadataRole === "client") {
    return metadataRole;
  }
  return undefined;
}
