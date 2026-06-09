import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getAuthContext } from "@/lib/auth/session";
import type { UserRole } from "@/lib/types/profile";

function resolveRole(
  profileRole: UserRole | undefined,
  metadataRole: unknown,
): UserRole | null {
  if (profileRole === "craftsman" || profileRole === "client") {
    return profileRole;
  }
  if (metadataRole === "craftsman") {
    return "craftsman";
  }
  if (metadataRole === "client") {
    return "client";
  }
  return null;
}

function resolveHomeHref(role: UserRole | null): string {
  if (role === "craftsman") {
    return "/szaki";
  }
  if (role === "client") {
    return "/lakos/ajanlatok";
  }
  return "/";
}

export async function SiteHeader() {
  const { user, profile } = await getAuthContext();
  const role = resolveRole(
    profile?.role,
    user?.user_metadata?.role,
  );
  const homeHref = resolveHomeHref(role);
  const isCraftsman = role === "craftsman";
  const isClient = role === "client";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href={homeHref}
          className="group flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-sm font-black text-zinc-900 shadow-md shadow-amber-500/30 transition group-hover:bg-amber-400">
            FZ
          </span>
          <span className="text-lg font-bold tracking-tight text-zinc-100">
            fusi<span className="text-amber-500">zok</span>
            <span className="text-zinc-500">.hu</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {!user && (
            <>
              <Link
                href="/lakos"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 sm:inline-block"
              >
                Segítséget keresek
              </Link>
              <Link
                href="/szaki"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 sm:inline-block"
              >
                Fusizni akarok
              </Link>
            </>
          )}

          {isClient && (
            <>
              <Link
                href="/lakos/ajanlatok"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 sm:inline-block"
              >
                Ajánlatok
              </Link>
              <Link
                href="/lakos/uzenetek"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 sm:inline-block"
              >
                Chatek
              </Link>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-[160px] truncate text-sm text-zinc-500 sm:inline">
                {profile?.full_name ?? user.email}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700"
                >
                  Kijelentkezés
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-zinc-900 transition hover:bg-amber-400"
            >
              Bejelentkezés
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
