"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { registerPushOnClient } from "@/lib/push/register-push-client";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PwaNotificationCtaProps = {
  isLoggedIn?: boolean;
  variant?: "hero" | "compact";
};

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "info"; message: string }
  | { type: "error"; message: string };

export function PwaNotificationCta({
  isLoggedIn = false,
  variant = "hero",
}: PwaNotificationCtaProps) {
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      installPromptRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleEnable = useCallback(async () => {
    setStatus({ type: "loading" });

    if (installPromptRef.current) {
      try {
        await installPromptRef.current.prompt();
        const { outcome } = await installPromptRef.current.userChoice;
        if (outcome === "accepted") {
          setCanInstall(false);
          installPromptRef.current = null;
        }
      } catch (err) {
        console.error("PWA telepítési hiba:", err);
      }
    }

    const result = await registerPushOnClient(isLoggedIn);

    if (result.ok && result.saved) {
      setStatus({
        type: "success",
        message:
          "Kész! Az értesítések be vannak kapcsolva, az app telepíthető / használható PWA-ként.",
      });
      return;
    }

    if (result.ok && result.needsLogin) {
      setStatus({
        type: "info",
        message:
          "Az értesítések engedélyezve. Jelentkezz be, hogy meg is kapd őket üzenet érkezésekor!",
      });
      return;
    }

    if (result.ok) {
      setStatus({
        type: "success",
        message: "Az értesítések engedélyezve.",
      });
      return;
    }

    setStatus({
      type: "error",
      message: result.error ?? "Nem sikerült bekapcsolni az értesítéseket.",
    });
  }, [isLoggedIn]);

  const isHero = variant === "hero";

  return (
    <div
      className={
        isHero
          ? "mx-auto mt-10 max-w-2xl rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-zinc-900/90 to-zinc-900/90 p-6 shadow-lg shadow-amber-500/10 sm:p-8"
          : "rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
      }
    >
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div
          className={`flex shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 ${
            isHero ? "h-16 w-16 text-3xl" : "h-12 w-12 text-2xl"
          }`}
          aria-hidden
        >
          🔔
        </div>

        <div className="flex-1">
          <h2
            className={`font-bold text-zinc-50 ${isHero ? "text-xl sm:text-2xl" : "text-base"}`}
          >
            Ne maradj le semmiről!
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            Kapcsold be az értesítéseket és telepítsd az appot a telefonodra
            (PWA) – így üzenet és pályázat érkezésekor azonnal kapsz jelzést,
            még ha a böngésző be is van zárva.
          </p>
          {canInstall && (
            <p className="mt-2 text-xs font-medium text-amber-400">
              ✓ Telepíthető appként (Add to Home Screen)
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={handleEnable}
          disabled={status.type === "loading"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-zinc-900 shadow-md shadow-amber-500/25 transition hover:bg-amber-400 disabled:opacity-60 sm:w-auto"
        >
          {status.type === "loading" ? (
            "Beállítás…"
          ) : (
            <>
              <span aria-hidden>📲</span>
              Értesítések & app telepítése
            </>
          )}
        </button>

        {status.type === "info" && (
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-600 bg-zinc-800 px-6 py-3.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-700 sm:w-auto"
          >
            Bejelentkezés
          </Link>
        )}
      </div>

      {status.type === "success" && (
        <p className="mt-4 text-center text-sm font-medium text-emerald-400">
          {status.message}
        </p>
      )}
      {status.type === "info" && (
        <p className="mt-4 text-center text-sm text-amber-300">{status.message}</p>
      )}
      {status.type === "error" && (
        <p className="mt-4 text-center text-sm text-red-400">{status.message}</p>
      )}

      {isHero && (
        <p className="mt-4 text-center text-xs text-zinc-500">
          iPhone-on: Safari → Megosztás → „Hozzáadás a Főképernyőhöz”, majd
          engedélyezd az értesítéseket.
        </p>
      )}
    </div>
  );
}
