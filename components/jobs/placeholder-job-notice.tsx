import { Info } from "lucide-react";
import { cardClassName } from "@/lib/ui-classes";

export function PlaceholderJobNotice() {
  return (
    <div
      className={`${cardClassName} mb-6 flex gap-3 border-amber-500/30 bg-amber-500/10 p-4 sm:p-5`}
      role="note"
    >
      <Info
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="text-sm leading-relaxed text-zinc-300">
        <p className="font-semibold text-amber-300">Példa hirdetés</p>
        <p className="mt-1 text-zinc-400">
          Ez egy illusztráció, hogy lásd milyen feladatok jelennek meg a
          platformon. Valódi munkát{" "}
          <span className="text-zinc-300">megrendelőként ingyen adhatsz fel</span>
          , fusizóként pedig a bejelentkezés után csak valós, nyitott
          hirdetésekre pályázhatsz.
        </p>
      </div>
    </div>
  );
}
