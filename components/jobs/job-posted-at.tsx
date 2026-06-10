import {
  formatJobPostedAt,
  formatJobPostedAtExact,
} from "@/lib/jobs/format-posted-at";

type JobPostedAtProps = {
  createdAt?: string | null;
  className?: string;
  prefix?: string;
};

export function JobPostedAt({
  createdAt,
  className = "text-xs text-zinc-500",
  prefix = "Feladva:",
}: JobPostedAtProps) {
  const label = formatJobPostedAt(createdAt);
  const exact = formatJobPostedAtExact(createdAt);

  if (!label || !createdAt) {
    return null;
  }

  return (
    <time dateTime={createdAt} className={className} title={exact ?? undefined}>
      {prefix} {label}
    </time>
  );
}
