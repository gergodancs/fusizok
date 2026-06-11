import Link from "next/link";
import { Hammer } from "lucide-react";
import { btnPrimaryClassName, cardClassName } from "@/lib/ui-classes";

export function PlaceholderJobGuestCta() {
  return (
    <div
      className={`${cardClassName} border-zinc-700/80 bg-zinc-900/60 p-6 sm:p-8`}
    >
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
          <Hammer
            className="h-6 w-6 text-amber-400"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
        <h2 className="text-xl font-bold text-zinc-50">
          Fusizó vagy? Valódi munkák várnak belépés után
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-400">
          Ez csak egy példa hirdetés a megjelenés bemutatására. Regisztrálj
          fusizóként, és a körzetedben feladott, valódi munkákra pályázhatsz.
        </p>
        <Link
          href="/login?redirect=/szaki&role=craftsman"
          className={`mt-6 ${btnPrimaryClassName}`}
        >
          Regisztráció / belépés fusizóként
        </Link>
      </div>
    </div>
  );
}
