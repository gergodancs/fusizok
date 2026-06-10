import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PRIVACY_EFFECTIVE_LABEL } from "@/lib/privacy";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Adatvédelmi Tájékoztató",
  description:
    "A Fusizók platform adatkezelési tájékoztatója (GDPR).",
};

export default function AdatvedelemPage() {
  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <div className="mb-8">
          <p className={pageEyebrowClassName}>Jogi dokumentum</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
            Adatvédelmi Tájékoztató
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Hatályos: {PRIVACY_EFFECTIVE_LABEL}
          </p>
        </div>

        <article
          className={`${cardClassName} prose prose-invert prose-zinc max-w-none p-6 sm:p-10 prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-xl prose-h2:text-amber-400 prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-zinc-100`}
        >
          <h2>1. Adatkezelő</h2>
          <p>
            A www.fusizok.hu weboldalt és a kapcsolódó szolgáltatásokat az
            alábbi adatkezelő üzemelteti:
          </p>
          <ul>
            <li>
              <strong>Név / cégnév:</strong> [Üzemeltető neve vagy cégneve]
            </li>
            <li>
              <strong>Székhely / levelezési cím:</strong> [Üzemeltető címe]
            </li>
            <li>
              <strong>E-mail:</strong>{" "}
              <a href="mailto:adatvedelem@fusizok.hu">adatvedelem@fusizok.hu</a>
            </li>
            <li>
              <strong>Telefon:</strong> [Üzemeltető telefonszáma]
            </li>
          </ul>

          <h2>2. Kezelt adatok köre</h2>
          <p>A platform a szolgáltatás nyújtásához az alábbi adatokat kezeli:</p>
          <ul>
            <li>
              <strong>Regisztrációs adatok:</strong> e-mail cím, teljes név,
              opcionálisan telefonszám – a Supabase hitelesítési és profil
              rendszerében tárolva.
            </li>
            <li>
              <strong>Helyadatok:</strong> önkéntesen megadott GPS koordináták
              vagy kézzel választott megye/település – a szakemberek
              megjelenítéséhez és a munkák hely szerinti illesztéséhez.
            </li>
            <li>
              <strong>Munkahirdetések és üzenetek:</strong> a feladott munkák
              tartalma, képei, pályázatok és chat üzenetek.
            </li>
            <li>
              <strong>Fizetési adatok:</strong> a Stripe kezeli a bankkártyás
              tranzakciókat; a platform nem tárol teljes bankkártyaadatokat.
            </li>
          </ul>

          <h2>3. Adatkezelés célja és jogalapja</h2>
          <p>
            Az adatkezelés célja a Fusizók közvetítő platform működtetése: a
            megrendelők és szakemberek összekapcsolása, értesítések küldése,
            szerződéskötés előkészítése. Jogalap: a felhasználó hozzájárulása
            (regisztráció, adatmegadás) és a szolgáltatás teljesítése.
          </p>

          <h2>4. Adattárolás és adatfeldolgozók</h2>
          <ul>
            <li>
              <strong>Supabase</strong> – felhasználói fiókok, profilok,
              munkák, üzenetek (EU-kompatibilis felhő infrastruktúra).
            </li>
            <li>
              <strong>Stripe</strong> – fizetések feldolgozása.
            </li>
            <li>
              <strong>Resend</strong> – tranzakciós e-mail értesítések.
            </li>
            <li>
              <strong>Vercel</strong> – webalkalmazás üzemeltetése.
            </li>
          </ul>

          <h2>5. Adatmegőrzés</h2>
          <p>
            A személyes adatokat a fiók fennállása alatt, illetve a jogszabályi
            kötelezettségeknek megfelelő ideig őrizzük meg. Inaktív fiókok
            adatai kérésre vagy jogszabály alapján törölhetők.
          </p>

          <h2>6. Az érintett jogai (GDPR)</h2>
          <p>Ön jogosult:</p>
          <ul>
            <li>hozzáférést kérni a kezelt adataihoz;</li>
            <li>kérni adatai helyesbítését vagy törlését;</li>
            <li>kérni az adatkezelés korlátozását;</li>
            <li>tiltakozni az adatkezelés ellen;</li>
            <li>adathordozhatóságot kérni, ahol alkalmazható;</li>
            <li>
              panaszt tenni a Nemzeti Adatvédelmi és Információszabadság
              Hatóságnál (NAIH).
            </li>
          </ul>
          <p>
            Adattörlési kérelmet a profilbeállításokban a „Fiók törlése”
            funkcióval, vagy e-mailben az{" "}
            <a href="mailto:adatvedelem@fusizok.hu">adatvedelem@fusizok.hu</a>{" "}
            címen nyújthat be.
          </p>

          <h2>7. Kapcsolat</h2>
          <p>
            Adatvédelmi kérdésekkel forduljon hozzánk:{" "}
            <a href="mailto:adatvedelem@fusizok.hu">adatvedelem@fusizok.hu</a>
          </p>
        </article>

        <p className="mt-8 text-center text-sm text-zinc-500">
          <Link href="/login" className="text-amber-400 hover:text-amber-300">
            ← Vissza a bejelentkezéshez
          </Link>
        </p>
      </PageContainer>
    </div>
  );
}
