import {
  ClipboardList,
  Hammer,
  ListChecks,
  MapPin,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlatformStatsBanner } from "@/components/stats/platform-stats-banner";
import { PwaNotificationCta } from "@/components/push/pwa-notification-cta";
import { getAuthContext } from "@/lib/auth/session";
import { getPlatformStats } from "@/lib/stats/platform-stats";

const FEATURES = [
  {
    icon: Hammer,
    title: "Kis melók, nagy segítség",
    text: "Polc fúrás, bútor összerakás, fűnyírás – pont az ilyen hétköznapi munkákra építünk.",
  },
  {
    icon: MapPin,
    title: "A környékeden",
    text: "Megye és település alapján találod meg a közelben fusizókat, akiknek van idejük és szerszámuk.",
  },
  {
    icon: ListChecks,
    title: "Egyszerűen",
    text: "Leírod, mire van szükséged, a fusizók pedig jelentkeznek. Nincs bonyolult folyamat.",
  },
] as const;

/** Unsplash – szerszámfal / barkács (jogtiszta, ingyenes licenc). */
const HERO_BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=1600";

export default async function Home() {
  const [{ user, profile }, stats] = await Promise.all([
    getAuthContext(),
    getPlatformStats(),
  ]);

  if (user && profile?.role === "craftsman") {
    redirect("/szaki");
  }

  if (user && profile?.role === "client") {
    redirect("/lakos/ajanlatok");
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat grayscale blur-[2px]"
          style={{ backgroundImage: `url("${HERO_BACKGROUND_IMAGE}")` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-zinc-950 backdrop-blur-sm"
          aria-hidden
        />
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-orange-600/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-600/60 bg-black/40 px-4 py-1.5 text-sm font-medium text-zinc-200 backdrop-blur-sm">
              <Wrench
                className="h-4 w-4 text-amber-500"
                strokeWidth={1.75}
                aria-hidden
              />
              Barkács segítség a környéken
            </p>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-50 drop-shadow-lg sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-[1.15]">
              Építsd a vállalkozásod,{" "}
              <span className="text-amber-400">fusizz szabadon</span> – vagy
              találd meg a{" "}
              <span className="text-amber-400">tökéletes szakit</span>!
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-zinc-300 drop-shadow-md sm:text-lg sm:leading-relaxed">
              A Fusizók az a hely, ahol a szakértelem találkozik a lakossági
              igényekkel. Legyen szó egy TV felszereléséről, gyors otthoni
              javításokról, vagy akár egy teljes lakásfelújításról – nálunk a
              legkisebb és a legnagyobb projektek is azonnal gazdára találnak.
            </p>

            <PwaNotificationCta />

            <PlatformStatsBanner stats={stats} className="mx-auto mt-8 max-w-xl" />

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/lakos"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-amber-500 px-8 py-4 text-base font-bold text-zinc-900 shadow-xl shadow-amber-500/25 transition hover:bg-amber-400 sm:w-auto"
              >
                <ClipboardList className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                Segítséget keresek (Munka feladása)
              </Link>
              <Link
                href="/szaki"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-zinc-600 bg-zinc-800 px-8 py-4 text-base font-bold text-zinc-100 shadow-sm transition hover:border-amber-500/50 hover:bg-zinc-700 sm:w-auto"
              >
                <Hammer className="h-5 w-5 text-amber-500/90" strokeWidth={1.75} aria-hidden />
                Fusizni akarok (Munkák böngészése)
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-700/80 bg-zinc-800/60 p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-900/60">
                  <Icon
                    className="h-5 w-5 text-amber-500"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
                <h3 className="text-lg font-bold text-zinc-100">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
