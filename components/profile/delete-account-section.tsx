"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/actions/account";

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
      <h2 className="text-lg font-bold text-red-300">Fiók törlése</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        Véglegesen törli a fiókodat, hirdetéseidet és profiladataidat. Ez a
        művelet nem vonható vissza. GDPR szerint bármikor kérheted az adataid
        törlését.
      </p>

      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          Fiók törlése
        </button>
      ) : (
        <div className="mt-4 space-y-3 rounded-xl border border-red-500/20 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium text-zinc-200">
            Biztosan törölni szeretnéd a fiókodat? Minden adatod véglegesen
            törlődik.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Törlés…
                </>
              ) : (
                "Igen, véglegesen törlöm"
              )}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-xl border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              Mégsem
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
