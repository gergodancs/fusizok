import Link from "next/link";
import { Hammer } from "lucide-react";
import { btnPrimaryClassName, cardClassName } from "@/lib/ui-classes";

type JobCraftsmanCtaProps = {
  jobId: string;
  returnPath?: string;
};

export function JobCraftsmanCta({
  jobId,
  returnPath = `/hirdetes/${jobId}`,
}: JobCraftsmanCtaProps) {
  const loginHref = `/login?redirect=${encodeURIComponent(returnPath)}&role=craftsman`;

  return (
    <div
      className={`${cardClassName} border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 p-6 sm:p-8`}
    >
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15">
          <Hammer className="h-6 w-6 text-amber-400" strokeWidth={1.75} aria-hidden />
        </div>
        <h2 className="text-xl font-bold text-zinc-50">
          Szeretnél pályázni erre a munkára?
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-400">
          Regisztrálj vagy lépj be fusizó fiókkal, hogy lásd a részletes helyszínt
          és képeket, majd küldd el az ajánlatodat.
        </p>
        <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href={loginHref} className={btnPrimaryClassName}>
            Belépés / regisztráció fusizóként
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-700"
          >
            Már van fiókom
          </Link>
        </div>
      </div>
    </div>
  );
}
