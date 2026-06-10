import Link from "next/link";
import type { ReactNode } from "react";
import { FeedbackLink } from "@/components/feedback/feedback-link";
import { btnPrimaryClassName } from "@/lib/ui-classes";

type EmptyStateAction = {
  href: string;
  label: string;
  external?: boolean;
};

type EmptyStateProps = {
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  children?: ReactNode;
  showFeedback?: boolean;
};

export function EmptyState({
  title,
  description,
  actions = [],
  children,
  showFeedback = true,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-800/40 p-10 text-center sm:p-12">
      <p className="text-lg font-semibold text-zinc-200">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">{description}</p>

      {children ? <div className="mt-6">{children}</div> : null}

      {actions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actions.map((action) =>
            action.external ? (
              <a
                key={action.href}
                href={action.href}
                className={btnPrimaryClassName}
              >
                {action.label}
              </a>
            ) : (
              <Link
                key={action.href}
                href={action.href}
                className={btnPrimaryClassName}
              >
                {action.label}
              </Link>
            ),
          )}
        </div>
      )}

      {showFeedback && (
        <div className="mt-5">
          <FeedbackLink />
        </div>
      )}
    </div>
  );
}
