import { MessageSquare, Search, Share2, UserCheck } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "1. Feladod a munkát",
    body: "Írd le, miben kell segítség, hol van a helyszín, és milyen kategóriába tartozik.",
  },
  {
    icon: UserCheck,
    title: "2. Pályázatok érkeznek",
    body: "A környék fusizói ajánlatot küldenek árral, vállalási idővel és üzenettel.",
  },
  {
    icon: Share2,
    title: "3. Kiválasztod a legjobbat",
    body: "Az Ajánlatok menüben összehasonlíthatod a jelentkezőket, és megoszthatod velük a kapcsolatot.",
  },
  {
    icon: MessageSquare,
    title: "4. Chat és egyeztetés",
    body: "Elfogadás után biztonságosan chateltek az alkalmazásban a részletekről.",
  },
] as const;

type ClientHowItWorksProps = {
  compact?: boolean;
};

export function ClientHowItWorks({ compact = false }: ClientHowItWorksProps) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-zinc-700/80 bg-zinc-800/30 p-4"
          : "rounded-2xl border border-zinc-700/80 bg-zinc-800/40 p-6 sm:p-8"
      }
    >
      <h2
        className={`font-bold text-zinc-100 ${compact ? "text-base" : "text-lg"}`}
      >
        Mit várj a folyamattól?
      </h2>
      {!compact && (
        <p className="mt-1 text-sm text-zinc-500">
          Nincs rejtett díj a megrendelőknek – a fusizók pályáznak rád.
        </p>
      )}

      <ol className={`mt-4 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        {STEPS.map((step) => (
          <li
            key={step.title}
            className="flex gap-3 rounded-xl border border-zinc-700/60 bg-zinc-900/40 p-4"
          >
            <step.icon
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
              strokeWidth={1.75}
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold text-zinc-200">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
