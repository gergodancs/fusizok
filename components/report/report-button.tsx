"use client";

import { Flag } from "lucide-react";
import { useState } from "react";
import { ReportModal } from "@/components/report/report-modal";

type ReportButtonProps = {
  reportedUserId: string;
  reportedUserName?: string | null;
  contextType?: "chat" | "profile";
  contextId?: string;
  className?: string;
};

export function ReportButton({
  reportedUserId,
  reportedUserName,
  contextType,
  contextId,
  className = "",
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200 ${className}`}
        title="Felhasználó jelentése"
      >
        <Flag className="h-3.5 w-3.5" />
        Jelentés
      </button>

      {open && (
        <ReportModal
          reportedUserId={reportedUserId}
          reportedUserName={reportedUserName}
          contextType={contextType}
          contextId={contextId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
