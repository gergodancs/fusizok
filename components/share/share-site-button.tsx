"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { getMetadataBaseUrl } from "@/lib/seo/site-url";
import { btnSecondaryClassName } from "@/lib/ui-classes";

type ShareSiteButtonProps = {
  message?: string;
  className?: string;
};

export function ShareSiteButton({
  message = "Próbáld ki a fusizok.hu-t – fusimunkák és szakemberek egy helyen!",
  className,
}: ShareSiteButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");
  const url = getMetadataBaseUrl();

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "fusizok.hu", text: message, url });
        setStatus("shared");
        return;
      }

      await navigator.clipboard.writeText(`${message}\n${url}`);
      setStatus("copied");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={className ?? `inline-flex items-center gap-2 ${btnSecondaryClassName}`}
    >
      <Share2 className="h-4 w-4 text-amber-500" strokeWidth={1.75} aria-hidden />
      {status === "copied"
        ? "Link másolva!"
        : status === "shared"
          ? "Megosztva!"
          : "Oszd meg a fusizok.hu-t"}
    </button>
  );
}
