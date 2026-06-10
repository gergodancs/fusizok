import Link from "next/link";
import { Coins } from "lucide-react";
import { formatCreditAmount } from "@/lib/credits/format";

type CreditBalanceLinkProps = {
  credits: number;
  /** Mobil: csak ikon + szám, asztali: teljes felirat */
  compact?: boolean;
};

export function CreditBalanceLink({
  credits,
  compact = false,
}: CreditBalanceLinkProps) {
  const amount = formatCreditAmount(credits);

  if (compact) {
    return (
      <Link
        href="/szaki/kreditek"
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/25"
        title={`Egyenleged: ${amount} kredit – koppints a feltöltéshez`}
        aria-label={`Egyenleged: ${amount} kredit, kreditvásárlás`}
      >
        <Coins className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{amount}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/szaki/kreditek"
      className="inline-flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-300 transition hover:border-amber-500/40 hover:bg-amber-500/15"
      title="Kreditvásárlás és egyenleg"
    >
      <Coins className="h-4 w-4 shrink-0" aria-hidden />
      <span className="whitespace-nowrap">
        Egyenleged: {amount} kredit
      </span>
    </Link>
  );
}
