type NavBadgeProps = {
  count: number;
};

export function NavBadge({ count }: NavBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-zinc-900">
      {count > 99 ? "99+" : count}
    </span>
  );
}
