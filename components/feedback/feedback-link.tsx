"use client";

import { MessageSquare } from "lucide-react";
import { getFeedbackMailtoUrl } from "@/lib/constants/feedback";

type FeedbackLinkProps = {
  className?: string;
  label?: string;
  showIcon?: boolean;
};

export function FeedbackLink({
  className = "inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-amber-400",
  label = "Visszajelzés / hiba / ötlet",
  showIcon = true,
}: FeedbackLinkProps) {
  const href =
    typeof window !== "undefined"
      ? getFeedbackMailtoUrl(window.location.href)
      : getFeedbackMailtoUrl();

  return (
    <a href={href} className={className}>
      {showIcon && (
        <MessageSquare className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      )}
      {label}
    </a>
  );
}
