import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} fusizok.hu – barkács közvetítő platform
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/aszf"
            className="transition hover:text-amber-400"
          >
            Általános Szerződési Feltételek
          </Link>
          <a
            href="mailto:info@fusizok.hu"
            className="transition hover:text-amber-400"
          >
            info@fusizok.hu
          </a>
        </nav>
      </div>
    </footer>
  );
}
