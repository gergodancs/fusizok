export function resolvePostLoginPath(
  redirectParam: string | undefined,
  role: string | undefined,
): string {
  if (redirectParam && redirectParam.startsWith("/") && redirectParam !== "/") {
    return redirectParam;
  }
  return role === "craftsman" ? "/szaki" : "/lakos";
}
