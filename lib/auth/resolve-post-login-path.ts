export function resolvePostLoginPath(
  redirectParam: string | undefined,
  role: string | undefined,
): string {
  if (redirectParam && redirectParam.startsWith("/") && redirectParam !== "/") {
    return redirectParam;
  }
  return role === "craftsman" ? "/szaki" : "/lakos";
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
