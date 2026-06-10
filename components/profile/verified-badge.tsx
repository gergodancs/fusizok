import { BadgeCheck } from "lucide-react";

type VerifiedBadgeProps = {
  className?: string;
  size?: "sm" | "md";
};

export function VerifiedBadge({ className = "", size = "sm" }: VerifiedBadgeProps) {
  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const textSize = size === "md" ? "text-sm" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-500/20 to-emerald-500/20 px-2 py-0.5 font-semibold text-sky-300 ring-1 ring-sky-400/30 ${textSize} ${className}`}
      title="Hitelesített fusizó – személyazonosság ellenőrizve"
    >
      <BadgeCheck className={`${iconSize} shrink-0 text-emerald-400`} />
      Hitelesített Szaki
    </span>
  );
}
