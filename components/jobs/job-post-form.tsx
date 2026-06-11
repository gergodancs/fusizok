"use client";

import { useActionState, useEffect, useState } from "react";
import { createJob, type JobFormState } from "@/app/actions/jobs";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { TermsAcceptanceCheckbox } from "@/components/auth/terms-acceptance-checkbox";
import { FixedLocationPicker } from "@/components/location/fixed-location-picker";
import { COMPLETION_TIME_OPTIONS } from "@/lib/completion-time-options";
import { CategorySkillPicker } from "@/components/categories/category-skill-picker";
import {
  clearJobFormDraft,
  loadJobFormDraft,
  saveJobFormDraft,
  type JobFormDraft,
} from "@/lib/job-form-draft";
import { PioneerZoneModal } from "@/components/zone/pioneer-zone-modal";
import { btnPrimaryClassName, inputClassName, labelClassName } from "@/lib/ui-classes";

const initialState: JobFormState = {};

const emptyDraft: JobFormDraft = {
  title: "",
  category: "",
  county: "",
  city: "",
  description: "",
  required_completion_time: "",
};

type JobPostFormProps = {
  isLoggedIn: boolean;
};

export function JobPostForm({ isLoggedIn }: JobPostFormProps) {
  const [state, formAction, isPending] = useActionState(
    createJob,
    initialState,
  );
  const [draft, setDraft] = useState<JobFormDraft>(emptyDraft);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [showPioneerModal, setShowPioneerModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadJobFormDraft();
    if (saved) {
      setDraft(saved);
    }
    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }
    saveJobFormDraft(draft);
  }, [draft, draftLoaded]);

  useEffect(() => {
    if (state.success) {
      clearJobFormDraft();
      if (state.pioneerZone) {
        setShowPioneerModal(true);
      }
    }
  }, [state.success, state.pioneerZone]);

  function persistDraftBeforeOAuth() {
    saveJobFormDraft(draft);
  }

  if (!draftLoaded) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
        Űrlap betöltése…
      </div>
    );
  }

  if (state.success) {
    return (
      <>
        <PioneerZoneModal
          open={showPioneerModal}
          variant="client"
          onClose={() => setShowPioneerModal(false)}
        />
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-8 ring-emerald-500/10">
            <svg
              className="h-8 w-8 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-50">
            Sikeres beküldés!
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-zinc-400">
            A melód rögzítve. Hamarosan fusizók jelentkezhetnek rá a környékről.
          </p>
          <button
            type="button"
            onClick={() => {
              clearJobFormDraft();
              setDraft(emptyDraft);
              window.location.reload();
            }}
            className={`mt-8 ${btnPrimaryClassName}`}
          >
            Új munkafeladás
          </button>
        </div>
      </>
    );
  }

  const guestSubmitDisabled =
    isPending || (!isLoggedIn && !termsAccepted);

  return (
    <form action={formAction} className="space-y-6">
      {!isLoggedIn && (
        <div
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-100/90"
          role="status"
        >
          <p className="font-semibold text-amber-300">
            Ingyenes regisztráció a beküldéshez
          </p>
          <p className="mt-1 text-amber-100/80">
            Töltsd ki a munkát, add meg az e-mail címed alul, és egy gombbal
            feladod – nem kell külön login oldalra menned.
          </p>
        </div>
      )}

      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className={labelClassName}>
          Munka megnevezése
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder="pl. IKEA polc felszerelése"
          className={inputClassName}
        />
      </div>

      <CategorySkillPicker mode="job" defaultMainCategory={draft.category} />

      <FixedLocationPicker
        label="Munkavégzés helyszíne"
        countyName={draft.county}
        cityName={draft.city}
        onChange={(value) =>
          setDraft((d) => ({
            ...d,
            county: value.county,
            city: value.city,
          }))
        }
      />

      <div className="space-y-2">
        <label htmlFor="required_completion_time" className={labelClassName}>
          Mikorra szeretnéd az elvégzést?
        </label>
        <select
          id="required_completion_time"
          name="required_completion_time"
          required
          value={draft.required_completion_time}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              required_completion_time: e.target.value,
            }))
          }
          className={inputClassName}
        >
          <option value="" disabled>
            Válassz határidőt…
          </option>
          {COMPLETION_TIME_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className={labelClassName}>
          Részletes leírás
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          value={draft.description}
          onChange={(e) =>
            setDraft((d) => ({ ...d, description: e.target.value }))
          }
          placeholder="Írd le a melót, hol van, mikor lenne jó…"
          className={`${inputClassName} resize-y`}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="images" className={labelClassName}>
          Képek{" "}
          <span className="font-normal text-zinc-500">
            (opcionális, max. 8 db, egyenként 5 MB)
          </span>
        </label>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => setImageCount(e.target.files?.length ?? 0)}
          className="block w-full cursor-pointer rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-900"
        />
        {imageCount > 0 && (
          <p className="text-xs text-zinc-500">{imageCount} kép kiválasztva</p>
        )}
      </div>

      {!isLoggedIn && (
        <section className="space-y-5 border-t border-zinc-700/80 pt-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">
              Utolsó lépés – ingyenes fiók
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              E-mail és jelszó megadásával beküldöd a munkát. Ha már van fiókod,
              ugyanitt be is jelentkezel.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="job-post-email" className={labelClassName}>
              E-mail cím
            </label>
            <input
              id="job-post-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nev@email.hu"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="job-post-password" className={labelClassName}>
              Jelszó
            </label>
            <input
              id="job-post-password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Legalább 6 karakter"
              className={inputClassName}
            />
          </div>

          <TermsAcceptanceCheckbox
            id="job-post-accept-terms"
            checked={termsAccepted}
            onChange={(checked) => {
              setTermsAccepted(checked);
              if (checked) {
                setTermsError(null);
              }
            }}
          />
          {termsAccepted && (
            <input type="hidden" name="accept_terms" value="on" />
          )}
          {termsError && (
            <p className="text-sm text-red-400" role="alert">
              {termsError}
            </p>
          )}

          <GoogleSignInButton
            redirectTo="/lakos"
            role="client"
            disabled={isPending || !termsAccepted}
            termsAccepted={termsAccepted}
            onBeforeSignIn={persistDraftBeforeOAuth}
            onTermsRequired={() =>
              setTermsError(
                "A folytatáshoz el kell fogadnod az ÁSZF-et és az Adatvédelmi Tájékoztatót.",
              )
            }
          />
        </section>
      )}

      <button
        type="submit"
        disabled={guestSubmitDisabled}
        onClick={(e) => {
          if (!isLoggedIn && !termsAccepted) {
            e.preventDefault();
            setTermsError(
              "A munkafeladáshoz el kell fogadnod az ÁSZF-et és az Adatvédelmi Tájékoztatót.",
            );
          }
        }}
        className={`w-full ${btnPrimaryClassName}`}
      >
        {isPending
          ? "Beküldés…"
          : isLoggedIn
            ? "Munka feladása"
            : "Munka feladása – ingyenes regisztráció"}
      </button>
    </form>
  );
}
