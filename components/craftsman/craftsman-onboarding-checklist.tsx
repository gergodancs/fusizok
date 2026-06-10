import Link from "next/link";
import { Check, Circle } from "lucide-react";
import type { CraftsmanOnboardingStatus } from "@/lib/craftsman/onboarding";
import { cardClassName } from "@/lib/ui-classes";

type CraftsmanOnboardingChecklistProps = {
  status: CraftsmanOnboardingStatus;
  compact?: boolean;
};

export function CraftsmanOnboardingChecklist({
  status,
  compact = false,
}: CraftsmanOnboardingChecklistProps) {
  if (status.completedCount === status.totalCount) {
    return null;
  }

  return (
    <div
      className={
        compact
          ? "border-b border-amber-500/20 bg-amber-500/5 px-4 py-3"
          : `${cardClassName} p-6 sm:p-8`
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amber-300">
            {compact ? "Profil beállítása" : "Kezdő lépések fusizóknak"}
          </p>
          {!compact && (
            <p className="mt-1 text-sm text-zinc-500">
              Töltsd ki a profilodat, hogy több megrendelő találjon rád.
            </p>
          )}
        </div>
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
          {status.completedCount}/{status.totalCount} kész
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-amber-500 transition-all"
          style={{ width: `${status.progressPercent}%` }}
        />
      </div>

      <ul className={`mt-4 space-y-2 ${compact ? "sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0" : ""}`}>
        {status.steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
                step.completed
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-zinc-700 bg-zinc-900/40 hover:border-amber-500/30"
              }`}
            >
              {step.completed ? (
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                  strokeWidth={2.5}
                  aria-hidden
                />
              ) : (
                <Circle
                  className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600"
                  strokeWidth={1.75}
                  aria-hidden
                />
              )}
              <span className="min-w-0 text-left">
                <span className="block text-sm font-medium text-zinc-200">
                  {step.label}
                  {step.required && !step.completed && (
                    <span className="ml-1 text-xs text-amber-400">*</span>
                  )}
                </span>
                {!compact && (
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    {step.description}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
