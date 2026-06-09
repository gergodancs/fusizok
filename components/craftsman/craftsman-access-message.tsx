import Link from "next/link";
import { CraftsmanProfileForm } from "@/components/craftsman/craftsman-profile-form";
import { PageContainer } from "@/components/layout/page-container";
import type { CraftsmanLocationEdit } from "@/lib/craftsman-profile";
import { btnPrimaryClassName, cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

type CraftsmanAccessMessageProps = {
  variant: "client" | "incomplete-profile";
  professions?: string[];
  defaultLocation?: CraftsmanLocationEdit;
};

export function CraftsmanAccessMessage({
  variant,
  professions = [],
  defaultLocation,
}: CraftsmanAccessMessageProps) {
  const isClient = variant === "client";

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow className="flex flex-col items-center text-center">
        <div className={`w-full max-w-lg ${cardClassName} p-8 sm:p-10`}>
          <p className={pageEyebrowClassName}>Fusizni akarok</p>

          {isClient ? (
            <>
              <h1 className="mt-3 text-2xl font-black text-zinc-50">
                Ez az oldal fusizóknak szól
              </h1>
              <p className="mt-3 text-zinc-400">
                Lakos fiókkal vagy bejelentkezve. Ha segítséget keresel, add fel
                a munkádat – ha fusizni szeretnél, regisztrálj fusizó fiókkal.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/lakos" className={btnPrimaryClassName}>
                  Munka feladása
                </Link>
                <Link
                  href="/login?redirect=/szaki"
                  className="rounded-xl border border-zinc-600 px-5 py-3.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-700"
                >
                  Fusizó fiók létrehozása
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-3 text-2xl font-black text-zinc-50">
                Állítsd be a fusizó profilodat
              </h1>
              <p className="mt-3 text-zinc-400">
                Válaszd ki a munkákat, add meg a helyszíned (GPS vagy kézzel),
                és állítsd be a vállalási sugarat.
              </p>
              <CraftsmanProfileForm
                defaultCategories={professions}
                defaultLocation={defaultLocation}
              />
            </>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
