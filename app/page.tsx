import Link from "next/link";
import { redirect } from "next/navigation";
import { PwaNotificationCta } from "@/components/push/pwa-notification-cta";
import { getAuthContext } from "@/lib/auth/session";

export default async function Home() {
  const { user, profile } = await getAuthContext();

  if (user && profile?.role === "craftsman") {
    redirect("/szaki");
  }

  if (user && profile?.role === "client") {
    redirect("/lakos");
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-orange-600/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 50%)",
            backgroundSize: "12px 12px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-400">
              🔧 Barkács segítség a környéken
            </p>
            <h1 className="text-4xl font-black tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
              Van egy fúród?{" "}
              <span className="text-amber-500">Fusizz és keress!</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
              A fusizok.hu a másodállásban barkácsolóknak, fusizóknak és
              azoknak készült, akiknek csak fel kell rakni egy TV-t a falra.
            </p>

            <PwaNotificationCta />

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/lakos"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-500 px-8 py-4 text-base font-bold text-zinc-900 shadow-xl shadow-amber-500/25 transition hover:bg-amber-400 sm:w-auto"
              >
                Segítséget keresek (Munka feladása)
              </Link>
              <Link
                href="/szaki"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-zinc-600 bg-zinc-800 px-8 py-4 text-base font-bold text-zinc-100 shadow-sm transition hover:border-amber-500/50 hover:bg-zinc-700 sm:w-auto"
              >
                Fusizni akarok (Munkák böngészése)
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">
          {[
            {
              title: "Kis melók, nagy segítség",
              text: "Polc fúrás, bútor összerakás, fűnyírás – pont az ilyen hétköznapi munkákra építünk.",
            },
            {
              title: "A környékeden",
              text: "Kerület alapján találod meg a közelben fusizókat, akiknek van idejük és szerszámuk.",
            },
            {
              title: "Egyszerűen",
              text: "Leírod, mire van szükséged, a fusizók pedig jelentkeznek. Nincs bonyolult folyamat.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-700/80 bg-zinc-800/60 p-6"
            >
              <h3 className="text-lg font-bold text-amber-500">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
