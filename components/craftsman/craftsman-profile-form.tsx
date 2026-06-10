"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateCraftsmanProfile,
  type CraftsmanProfileFormState,
} from "@/app/actions/craftsman-profile";
import { CraftsmanProfileFields } from "@/components/craftsman/craftsman-profile-fields";
import type { CraftsmanLocationEdit } from "@/lib/craftsman-profile";
import { DEFAULT_SERVICE_RADIUS_KM } from "@/lib/location/types";
import { withPioneerZoneQuery } from "@/lib/auth/resolve-post-login-path";
import { btnPrimaryClassName } from "@/lib/ui-classes";

const initialState: CraftsmanProfileFormState = {};

const emptyLocation: CraftsmanLocationEdit = {
  mode: null,
  latitude: null,
  longitude: null,
  county: "",
  city: "",
  serviceRadiusKm: DEFAULT_SERVICE_RADIUS_KM,
};

type CraftsmanProfileFormProps = {
  defaultLocation?: CraftsmanLocationEdit;
  defaultCategories?: string[];
  defaultBio?: string | null;
  redirectOnSuccess?: string;
};

export function CraftsmanProfileForm({
  defaultLocation = emptyLocation,
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
        const destination =
          state.pioneerZone && redirectOnSuccess.startsWith("/szaki")
            ? withPioneerZoneQuery(redirectOnSuccess, "craftsman")
            : redirectOnSuccess;
        router.push(destination);
      } else {
        router.refresh();
      }
    }
  }, [state.success, state.pioneerZone, redirectOnSuccess, router]);

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
        defaultLocation={defaultLocation}
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
