"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { initiateShareContact } from "@/app/actions/share-contact";
import { btnPrimaryClassName } from "@/lib/ui-classes";

type ShareContactButtonProps = {
  bidId: string;
};

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-900/30 border-t-zinc-900"
      aria-hidden
    />
  );
}

export function ShareContactButton({ bidId }: ShareContactButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await initiateShareContact(bidId);

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.conversationId) {
        router.push(`/lakos/uzenetek/${result.conversationId}`);
        return;
      }

      setError("A chat indítása sikertelen.");
      setLoading(false);
    } catch (err) {
      console.error("[ShareContactButton] hiba:", err);
      setError("Váratlan hiba történt. Próbáld újra.");
      setLoading(false);
    }
  }, [bidId, loading, router]);

  return (
    <div className="flex-1 space-y-2">
      <button
        type="button"
        onClick={handleShare}
        disabled={loading}
        className={`flex w-full items-center justify-center gap-2 ${btnPrimaryClassName}`}
      >
        {loading ? (
          <>
            <Spinner />
            Feldolgozás…
          </>
        ) : (
          "Kapcsolat megosztása"
        )}
      </button>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
