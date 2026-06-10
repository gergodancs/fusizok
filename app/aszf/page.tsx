import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { TERMS_EFFECTIVE_LABEL } from "@/lib/terms";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Általános Szerződési Feltételek",
  description:
    "A Fusizók platform Általános Szerződési Feltételei (ÁSZF).",
};

export default function AszfPage() {
  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <div className="mb-8">
          <p className={pageEyebrowClassName}>Jogi dokumentum</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
            Általános Szerződési Feltételek
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Hatályos: {TERMS_EFFECTIVE_LABEL} amitől kezdve a szolgáltatás
            elérhető.
          </p>
        </div>

        <article
          className={`${cardClassName} prose prose-invert prose-zinc max-w-none p-6 sm:p-10 prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-xl prose-h2:text-amber-400 prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-zinc-100`}
        >
          <h2>1. ÜZEMELTETŐI ADATOK (SZOLGÁLTATÓ)</h2>
          <p>
            A www.fusizok.hu weboldalt és a hozzá tartozó mobilalkalmazást (a
            továbbiakban: Platform) az alábbi szolgáltató üzemelteti:
          </p>
          <ul>
            <li>
              <strong>Név/Cégnév:</strong> [A te neved vagy a céged neve]
            </li>
            <li>
              <strong>Székhely/Lakcím:</strong> [Például: 1140 Budapest, Teszt
              utca 1.]
            </li>
            <li>
              <strong>Nyilvántartási szám / Cégjegyzékszám:</strong> [Egyéni
              vállalkozói igazolvány száma vagy cégjegyzékszám]
            </li>
            <li>
              <strong>Adószám:</strong> [Adószámod]
            </li>
            <li>
              <strong>E-mail cím:</strong>{" "}
              <a href="mailto:info@fusizok.hu" className="text-amber-400">
                info@fusizok.hu
              </a>
            </li>
            <li>
              <strong>Tárhelyszolgáltató:</strong> Vercel Inc. (San Francisco,
              CA, USA) és Supabase Inc.
            </li>
          </ul>

          <h2>2. A SZOLGÁLTATÁS JELLEGE ÉS A FELELŐSSÉG KIZÁRÁSA</h2>
          <p>
            <strong>2.1.</strong> A Fusizók egy online közvetítő platform
            (piactér), amelynek kizárólagos célja, hogy összekösse a szabad
            kapacitással rendelkező szakembereket (a továbbiakban:
            Szaki/Fusizó) a szolgáltatást igénylő magánszemélyekkel vagy
            cégekkel (a továbbiakban: Megrendelő).
          </p>
          <p>
            <strong>2.2.</strong> A Szolgáltató (Üzemeltető) nem részese a
            Szaki és a Megrendelő között létrejövő szerződéseknek,
            megállapodásoknak. A Szolgáltató nem munkáltatója, nem megbízója és
            nem alvállalkozója egyik félnek sem.
          </p>
          <p>
            <strong>2.3.</strong> A Platformon elvégzett munkákért, a megbízási
            díjak kifizetéséért, a munkák minőségéért, az esetleges anyagi vagy
            fizikai károkért a Szolgáltató semmilyen felelősséget nem vállal.
            Minden vitás kérdést a Megrendelő és a Szaki köteles egymás között
            rendezni.
          </p>
          <p>
            <strong>2.4. Adózási és számlázási felelősség:</strong> A
            Platformon keresztül létrejött munkák utáni adózási,
            járulékfizetési és számlaadási kötelezettség kizárólag a munkát
            elvégző Szakit (és adott esetben a Megrendelőt) terheli a mindenkori
            hatályos magyar jogszabályok szerint. A Szolgáltató nem ellenőrzi és
            nem felelős a felek adóügyi jogkövetéséért.
          </p>

          <h2>3. REGISZTRÁCIÓ ÉS FELHASZNÁLÓI FIÓKOK</h2>
          <p>
            <strong>3.1.</strong> A Platform használata regisztrációhoz kötött,
            amely történhet e-mail címmel vagy Google OAuth fiókkal.
          </p>
          <p>
            <strong>3.2.</strong> A felhasználó köteles a regisztráció és a
            profil kitöltése során valós adatokat megadni. A téves, hiányos vagy
            valótlan adatokból eredő károkért a Szolgáltató nem felel.
          </p>
          <p>
            <strong>3.3.</strong> A Szolgáltató fenntartja a jogot, hogy a
            Platform hírnevét sértő, csaló, vagy a közösségi irányelvekbe
            ütköző profilokat és hirdetéseket előzetes értesítés nélkül törölje
            vagy felfüggessze.
          </p>

          <h2>4. HELYADATOK (GPS) HASZNÁLATA</h2>
          <p>
            <strong>4.1.</strong> A Platform a hatékonyabb működés érdekében
            helyalapú (GPS) szűrést alkalmaz, hogy a Megrendelőhöz legközelebbi
            Szakikat listázza ki.
          </p>
          <p>
            <strong>4.2.</strong> A GPS adatok megosztása önkéntes. Amennyiben a
            felhasználó letiltja a helyhozzáférést, a Platformon manuálisan
            (Megye és Település megadásával) köteles rögzíteni a munkavégzés
            helyszínét.
          </p>

          <h2>5. DÍJAK ÉS FIZETÉSI FELTÉTELEK (STRIPE INTEGRÁCIÓ)</h2>
          <p>
            <strong>5.1.</strong> A Megrendelők számára a hirdetésfeladás
            ingyenes.
          </p>
          <p>
            <strong>5.2.</strong> A Szakik a Platformon elérhető extra
            funkciókért (pl. chat feloldása, kiemelt profil) díjat fizethetnek. A
            díjak kiegyenlítése a Stripe biztonságos bankkártyás fizetési
            rendszerén keresztül történik.
          </p>
          <p>
            <strong>5.3.</strong> A Szolgáltató bankkártyaadatokat nem tárol,
            azok kezelése közvetlenül a Stripe felületén valósul meg. A sikeres
            tranzakciókról a Szolgáltató elektronikus számlát / bizonylatot
            küld a felhasználónak.
          </p>

          <h2>6. JOGVITA ÉS IRÁNYADÓ JOG</h2>
          <p>
            <strong>6.1.</strong> A jelen ÁSZF-ben nem szabályozott kérdésekben
            a Polgári Törvénykönyv (Ptk.) és az elektronikus kereskedelmi
            szolgáltatásokra vonatkozó magyar jogszabályok az irányadóak.
          </p>
          <p>
            <strong>6.2.</strong> Bármilyen jogvita esetén a felek törekednek a
            békés, peren kívüli megegyezésre, ennek hiányában a Szolgáltató
            székhelye szerinti hatáskörrel rendelkező magyar bíróság kizárólagos
            illetékességét kötik ki.
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
