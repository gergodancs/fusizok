import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { ClientHowItWorks } from "@/components/client/client-how-it-works";
import { PageContainer } from "@/components/layout/page-container";
import { MAIN_CATEGORIES } from "@/lib/constants/categories";
import {
  CLIENT_FOCUSED_OG_DESCRIPTION,
  CLIENT_FOCUSED_SITE_DESCRIPTION,
} from "@/lib/seo/site-metadata";
import { getMetadataBaseUrl } from "@/lib/seo/site-url";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

const FAQ_ITEMS = [
  {
    question: "Mennyibe kerül a munka feladása?",
    answer:
      "A megrendelőknek ingyenes. Leírod a feladatot, a fusizók pályáznak rád – nincs rejtett díj a hirdetés feladásánál.",
  },
  {
    question: "Hogyan választok fusizót?",
    answer:
      "Az érkező pályázatok között látod az árat, a vállalási időt és az üzenetet. Kiválasztod a legjobb ajánlatot, majd chatben egyeztettek.",
  },
  {
    question: "Milyen munkákat adhatok fel?",
    answer:
      "Kisebb fusimunkák, barkácsfeladatok, kerti munkák, villany, víz, festés és hasonló hétköznapi segítség – a fő kategóriák alább.",
  },
  {
    question: "Látom a fusizók elérhetőségét mindenki számára?",
    answer:
      "Nem. A kapcsolatot csak te oszthatod meg, amikor kiválasztottad a pályázót. A publikus hirdetésoldalakon nincs szaki-lista.",
  },
] as const;

export const metadata: Metadata = {
  title: "Hogyan működik? | Munka feladása és ajánlatok",
  description: CLIENT_FOCUSED_SITE_DESCRIPTION,
  openGraph: {
    title: "Hogyan működik a Fusizok.hu?",
    description: CLIENT_FOCUSED_OG_DESCRIPTION,
    url: `${getMetadataBaseUrl()}/hogyan-mukodik`,
    locale: "hu_HU",
    siteName: "Fusizok.hu",
    type: "website",
  },
  alternates: {
    canonical: `${getMetadataBaseUrl()}/hogyan-mukodik`,
  },
};

export default function HogyanMukodikPage() {
  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <div className="mb-8 text-center sm:text-left">
          <p className={pageEyebrowClassName}>Megrendelőknek</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
            Hogyan működik a Fusizok.hu?
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
            Írd ki, miben kell segítség – a környék fusizói pályáznak rád. Te
            választasz, nincs kötelező előfizetés a megrendelőknek.
          </p>
        </div>

        <div className="mb-8">
          <ClientHowItWorks />
        </div>

        <section className={`${cardClassName} mb-8 p-6 sm:p-8`}>
          <h2 className="text-lg font-bold text-zinc-100">
            Milyen munkákat adhatsz fel?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            A platform kisebb, hétköznapi feladatokra épül – nem teljes
            generálkivitelezésre. Példák a fő kategóriákra:
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {MAIN_CATEGORIES.map((category) => (
              <li
                key={category.id}
                className="rounded-xl border border-zinc-700/60 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-300"
              >
                {category.label}
              </li>
            ))}
          </ul>
        </section>

        <section className={`${cardClassName} mb-8 p-6 sm:p-8`}>
          <h2 className="text-lg font-bold text-zinc-100">Gyakori kérdések</h2>
          <dl className="mt-4 space-y-5">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-zinc-200">{item.question}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="text-center sm:text-left">
          <Link
            href="/lakos"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-8 py-4 text-base font-bold text-zinc-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
          >
            <ClipboardList className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            Munka feladása most
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
