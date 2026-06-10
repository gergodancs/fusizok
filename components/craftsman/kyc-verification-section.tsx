"use client";

import { BadgeCheck, Loader2, ShieldCheck } from "lucide-react";
import { useActionState } from "react";
import { submitKycVerification, type SubmitKycState } from "@/app/actions/kyc";
import { VerifiedBadge } from "@/components/profile/verified-badge";
import {
  btnPrimaryClassName,
  inputClassName,
  labelClassName,
} from "@/lib/ui-classes";

const initialState: SubmitKycState = {};

type KycVerificationSectionProps = {
  isVerified: boolean;
  kycStatus: string;
};

export function KycVerificationSection({
  isVerified,
  kycStatus,
}: KycVerificationSectionProps) {
  const [state, formAction, isPending] = useActionState(
    submitKycVerification,
    initialState,
  );

  if (isVerified) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" />
        <div>
          <p className="font-semibold text-emerald-300">Hitelesített profil</p>
          <p className="mt-1 text-sm text-zinc-400">
            A profilod hitelesített – a megrendelők látják a „Hitelesített
            Szaki” jelvényt a neved mellett.
          </p>
          <VerifiedBadge className="mt-3" size="md" />
        </div>
      </div>
    );
  }

  if (kycStatus === "pending") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-sky-400" />
        <div>
          <p className="font-semibold text-sky-300">Ellenőrzés folyamatban</p>
          <p className="mt-1 text-sm text-zinc-400">
            A dokumentumaidat megkaptuk. A hitelesítés általában 1–2 munkanapon
            belül elkészül.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-amber-400" />
        <div>
          <h3 className="text-lg font-bold text-zinc-100">
            Hitelesítés igénylése
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Töltsd fel a személyigazolványod és egy friss arcképet. A
            dokumentumokat biztonságos, nem nyilvános tárolóban kezeljük, és
            csak a hitelesítéshez használjuk fel.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="kyc-id" className={labelClassName}>
            Személyigazolvány fotója
          </label>
          <input
            id="kyc-id"
            name="id_document"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className={`mt-1 block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-200 hover:file:bg-zinc-700 ${inputClassName}`}
          />
        </div>

        <div>
          <label htmlFor="kyc-selfie" className={labelClassName}>
            Arckép (selfie)
          </label>
          <input
            id="kyc-selfie"
            name="selfie"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className={`mt-1 block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-200 hover:file:bg-zinc-700 ${inputClassName}`}
          />
        </div>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-emerald-400">
            Dokumentumok feltöltve! Hamarosan értesítünk az eredményről.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={btnPrimaryClassName}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Feltöltés…
            </>
          ) : (
            "Hitelesítés beküldése"
          )}
        </button>
      </form>
    </div>
  );
}
