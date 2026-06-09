"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateCraftsmanProfile,
  type CraftsmanProfileFormState,
} from "@/app/actions/craftsman-profile";
import { CraftsmanProfileFields } from "@/components/craftsman/craftsman-profile-fields";
import { PortfolioManager } from "@/components/craftsman/portfolio-manager";
import type { CraftsmanLocationEdit } from "@/lib/craftsman-profile";
import type { PortfolioImage } from "@/lib/types/portfolio";
import { btnPrimaryClassName } from "@/lib/ui-classes";

const FORM_ID = "craftsman-profile-save-form";
const initialState: CraftsmanProfileFormState = {};

type CraftsmanProfileSettingsProps = {
  defaultLocation: CraftsmanLocationEdit;
  defaultCategories?: string[];
  defaultBio?: string | null;
  portfolioImages: PortfolioImage[];
};

export function CraftsmanProfileSettings({
  defaultLocation,
  defaultCategories = [],
  defaultBio = null,
  portfolioImages,
}: CraftsmanProfileSettingsProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateCraftsmanProfile,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.push("/szaki");
    }
  }, [state.success, router]);

  return (
    <div className="space-y-8">
      <form
        id={FORM_ID}
        action={formAction}
        className="space-y-5 text-left"
      >
        <CraftsmanProfileFields
          defaultCategories={defaultCategories}
          defaultLocation={defaultLocation}
          defaultBio={defaultBio}
        />
      </form>

      <div className="border-t border-zinc-700 pt-8">
        <PortfolioManager images={portfolioImages} />
      </div>

      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        form={FORM_ID}
        disabled={isPending}
        className={`w-full ${btnPrimaryClassName}`}
      >
        {isPending ? "Mentés…" : "Profil mentése"}
      </button>
    </div>
  );
}
