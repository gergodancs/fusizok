"use client";

import { BellRing, Loader2, LogIn, Smartphone } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { registerPushOnClient } from "@/lib/push/register-push-client";
import { btnSecondaryClassName } from "@/lib/ui-classes";

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
          ? "mx-auto mt-10 max-w-2xl rounded-2xl border border-zinc-700/80 bg-zinc-800/40 p-6 sm:p-8"
          : "rounded-xl border border-zinc-700/80 bg-zinc-800/40 p-4"
      }
    >
      <div className="text-center sm:text-left">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
          <BellRing
            className={`shrink-0 text-zinc-400 ${isHero ? "h-6 w-6" : "h-5 w-5"}`}
            strokeWidth={1.75}
            aria-hidden
          />
          <h2
            className={`font-bold text-zinc-50 ${isHero ? "text-xl sm:text-2xl" : "text-base"}`}
          >
            Ne maradj le semmiről!
          </h2>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Kapcsold be az értesítéseket és telepítsd az appot a telefonodra (PWA) –
          így üzenet és pályázat érkezésekor azonnal kapsz jelzést, még ha a
          böngésző be is van zárva.
        </p>

        {canInstall && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500 sm:justify-start">
            <Smartphone className="h-3.5 w-3.5 text-amber-500/80" strokeWidth={1.75} />
            Telepíthető appként (Add to Home Screen)
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={handleEnable}
          disabled={status.type === "loading"}
          className={`inline-flex w-full items-center justify-center gap-2 sm:w-auto ${btnSecondaryClassName}`}
        >
          {status.type === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              Beállítás…
            </>
          ) : (
            <>
              <BellRing className="h-4 w-4 text-amber-500" strokeWidth={1.75} />
              Értesítések & app telepítése
            </>
          )}
        </button>

        {status.type === "info" && (
          <Link
            href="/login"
            className={`inline-flex w-full items-center justify-center gap-2 sm:w-auto ${btnSecondaryClassName}`}
          >
            <LogIn className="h-4 w-4 text-zinc-400" strokeWidth={1.75} />
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
        <p className="mt-4 text-center text-sm text-zinc-400">{status.message}</p>
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
