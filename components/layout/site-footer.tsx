import { FileText, Mail } from "lucide-react";
import Link from "next/link";
import { FeedbackLink } from "@/components/feedback/feedback-link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:px-6">
        <div className="text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} fusizok.hu – barkács közvetítő platform
          </p>
          <p className="mt-1 text-xs text-zinc-600">Béta verzió</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/lakos"
            className="transition hover:text-amber-400"
          >
            Munka feladása
          </Link>
          <Link
            href="/hogyan-mukodik"
            className="transition hover:text-amber-400"
          >
            Hogyan működik?
          </Link>
          <FeedbackLink
            className="inline-flex items-center gap-1.5 transition hover:text-amber-400"
            label="Visszajelzés"
            showIcon
          />
          <Link
            href="/aszf"
            className="inline-flex items-center gap-1.5 transition hover:text-amber-400"
          >
            <FileText className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            ÁSZF
          </Link>
          <Link
            href="/adatvedelem"
            className="inline-flex items-center gap-1.5 transition hover:text-amber-400"
          >
            <FileText className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Adatvédelem
          </Link>
          <a
            href="mailto:info@fusizok.hu"
            className="inline-flex items-center gap-1.5 transition hover:text-amber-400"
          >
            <Mail className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            info@fusizok.hu
          </a>
        </nav>
      </div>
    </footer>
  );
}
