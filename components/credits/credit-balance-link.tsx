import Link from "next/link";
import { Coins } from "lucide-react";
import { formatCreditBalance } from "@/lib/credits/format";

type CreditBalanceLinkProps = {
  credits: number;
};

export function CreditBalanceLink({ credits }: CreditBalanceLinkProps) {
  return (
    <Link
      href="/szaki/kreditek"
      className="flex shrink-0 items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-300 transition hover:border-amber-500/40 hover:bg-amber-500/15"
      title="Kreditvásárlás és egyenleg"
    >
      <Coins className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">
        Egyenleged: {formatCreditBalance(credits)}
      </span>
    </Link>
  );
}
