"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { createJob, type JobFormState } from "@/app/actions/jobs";
import { FixedLocationPicker } from "@/components/location/fixed-location-picker";
import { COMPLETION_TIME_OPTIONS } from "@/lib/completion-time-options";
import { JOB_CATEGORIES } from "@/lib/job-categories";
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

export function JobPostForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createJob,
    initialState,
  );
  const [draft, setDraft] = useState<JobFormDraft>(emptyDraft);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [showPioneerModal, setShowPioneerModal] = useState(false);

  useEffect(() => {
    const saved = loadJobFormDraft();
    if (saved) {
      setDraft(saved);
    }
    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (state.code === "auth-required" && state.draft) {
      saveJobFormDraft(state.draft);
      router.push("/login?redirect=/lakos");
    }
  }, [state, router]);

  useEffect(() => {
    if (state.success) {
      clearJobFormDraft();
      if (state.pioneerZone) {
        setShowPioneerModal(true);
      }
    }
  }, [state.success, state.pioneerZone]);

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

  return (
    <form action={formAction} className="space-y-6">
      {state.error && state.code !== "auth-required" && (
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

      <div className="space-y-2">
        <label htmlFor="category" className={labelClassName}>
          Kategória
        </label>
        <select
          id="category"
          name="category"
          required
          value={draft.category}
          onChange={(e) =>
            setDraft((d) => ({ ...d, category: e.target.value }))
          }
          className={inputClassName}
        >
          <option value="" disabled>
            Válassz kategóriát…
          </option>
          {JOB_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

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

      <button
        type="submit"
        disabled={isPending}
        className={`w-full ${btnPrimaryClassName}`}
      >
        {isPending ? "Beküldés…" : "Beküldés"}
      </button>
    </form>
  );
}
