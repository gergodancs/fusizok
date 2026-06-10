"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditBalanceLink } from "@/components/credits/credit-balance-link";
import { NavBadge } from "@/components/layout/nav-badge";
import type { CraftsmanNavCounts } from "@/lib/notifications";

const links = [
  {
    href: "/szaki",
    label: "Nyitott munkák",
    exact: true,
    badgeKey: "newOpenJobs" as const,
  },
  {
    href: "/szaki/aktivitas",
    label: "Aktivitásom",
    exact: false,
    badgeKey: "newActivity" as const,
  },
  {
    href: "/szaki/uzenetek",
    label: "Chatek",
    exact: false,
    badgeKey: "chatNotifications" as const,
  },
  { href: "/szaki/profil", label: "Profil", exact: false, badgeKey: null },
];

type CraftsmanNavProps = {
  counts: CraftsmanNavCounts;
  credits: number;
};

export function CraftsmanNav({ counts, credits }: CraftsmanNavProps) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-900/80">
      {/* Mobil: egyenleg saját sávban, nem takarja a füleket */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 px-4 py-2 sm:px-6 md:hidden">
        <span className="text-xs text-zinc-500">Kredit egyenleg</span>
        <CreditBalanceLink credits={credits} compact />
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {links.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            const badgeCount =
              link.badgeKey !== null ? counts[link.badgeKey] : 0;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex shrink-0 items-center whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition sm:px-4 ${
                  isActive
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {link.label}
                <NavBadge count={badgeCount} />
              </Link>
            );
          })}
        </div>

        {/* Asztali: teljes felirat a menü mellett */}
        <div className="hidden shrink-0 md:block">
          <CreditBalanceLink credits={credits} />
        </div>
      </div>
    </nav>
  );
}
