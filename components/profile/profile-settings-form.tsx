"use client";

import { useActionState, useEffect } from "react";
import { updateProfile, type ProfileUpdateState } from "@/app/actions/profile";
import {
  btnPrimaryClassName,
  inputClassName,
  labelClassName,
} from "@/lib/ui-classes";

const initialState: ProfileUpdateState = {};

type ProfileSettingsFormProps = {
  defaultFullName: string;
  defaultPhone: string;
};

export function ProfileSettingsForm({
  defaultFullName,
  defaultPhone,
}: ProfileSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-zinc-100">Személyes adatok</h2>
        <p className="mt-1 text-sm text-zinc-500">
          A neved és telefonszámod a profilodban jelenik meg, ha megosztod a
          kapcsolatot egy szakival.
        </p>
      </div>

      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          Profil mentve.
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="full_name" className={labelClassName}>
          Teljes név
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={defaultFullName}
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className={labelClassName}>
          Telefonszám{" "}
          <span className="font-normal text-zinc-500">(opcionális)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={defaultPhone}
          placeholder="+36 30 123 4567"
          className={inputClassName}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={btnPrimaryClassName}
      >
        {isPending ? "Mentés…" : "Változások mentése"}
      </button>
    </form>
  );
}
