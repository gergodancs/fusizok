"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavBadge } from "@/components/layout/nav-badge";
import type { ClientNavCounts } from "@/lib/notifications";

const links = [
  { href: "/lakos", label: "Munka feladása", exact: true, badgeKey: null },
  {
    href: "/lakos/hirdeteseim",
    label: "Hirdetéseim",
    exact: true,
    badgeKey: null,
  },
  {
    href: "/lakos/ajanlatok",
    label: "Ajánlatok",
    exact: false,
    badgeKey: "newOffers" as const,
  },
  {
    href: "/lakos/uzenetek",
    label: "Chatek",
    exact: false,
    badgeKey: "unreadMessages" as const,
  },
  { href: "/lakos/profil", label: "Profil", exact: true, badgeKey: null },
];

type LakosNavProps = {
  counts: ClientNavCounts;
};

export function LakosNav({ counts }: LakosNavProps) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-900/80">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
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
              className={`flex items-center whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
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
    </nav>
  );
}
