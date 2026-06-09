"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateCraftsmanProfile,
  type CraftsmanProfileFormState,
} from "@/app/actions/craftsman-profile";
import { CraftsmanProfileFields } from "@/components/craftsman/craftsman-profile-fields";
import { btnPrimaryClassName } from "@/lib/ui-classes";
import type { CoverageArea } from "@/lib/places";

const initialState: CraftsmanProfileFormState = {};

type CraftsmanProfileFormProps = {
  defaultCoverageAreas?: CoverageArea[];
  defaultCategories?: string[];
  defaultBio?: string | null;
  redirectOnSuccess?: string;
};

export function CraftsmanProfileForm({
  defaultCoverageAreas = [],
  defaultCategories = [],
  defaultBio = null,
  redirectOnSuccess = "/szaki",
}: CraftsmanProfileFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateCraftsmanProfile,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      if (redirectOnSuccess) {
        router.push(redirectOnSuccess);
      } else {
        router.refresh();
      }
    }
  }, [state.success, redirectOnSuccess, router]);

  return (
    <form action={formAction} className="mt-6 space-y-5 text-left">
      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {state.error}
        </div>
      )}

      <CraftsmanProfileFields
        defaultCategories={defaultCategories}
        defaultCoverageAreas={defaultCoverageAreas}
        defaultBio={defaultBio}
      />

      <button
        type="submit"
        disabled={isPending}
        className={`w-full ${btnPrimaryClassName}`}
      >
        {isPending ? "Mentés…" : "Profil mentése"}
      </button>
    </form>
  );
}
