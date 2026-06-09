"use client";

import { useState } from "react";
import { PlacePicker } from "@/components/location/place-picker";
import { btnSecondaryClassName, labelClassName } from "@/lib/ui-classes";
import type { CoverageArea } from "@/lib/places";
import { dedupeCoverageAreas, formatLocationLabel, locationKey } from "@/lib/places";

type CoverageAreaPickerProps = {
  defaultAreas?: CoverageArea[];
};

export function CoverageAreaPicker({
  defaultAreas = [],
}: CoverageAreaPickerProps) {
  const [areas, setAreas] = useState<CoverageArea[]>(
    dedupeCoverageAreas(defaultAreas),
  );
  const [draftCounty, setDraftCounty] = useState("");
  const [draftPlace, setDraftPlace] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addArea() {
    if (!draftCounty || !draftPlace) {
      setError("Válassz megyét és települést a hozzáadáshoz.");
      return;
    }

    const key = locationKey(draftCounty, draftPlace);
    if (areas.some((area) => locationKey(area.county, area.place) === key)) {
      setError("Ez a terület már szerepel a listában.");
      return;
    }

    setAreas((current) =>
      dedupeCoverageAreas([...current, { county: draftCounty, place: draftPlace }]),
    );
    setDraftCounty("");
    setDraftPlace("");
    setError(null);
  }

  function removeArea(key: string) {
    setAreas((current) =>
      current.filter((area) => locationKey(area.county, area.place) !== key),
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <span className={labelClassName}>Hol vállalsz munkát?</span>
        <p className="mt-1 text-sm text-zinc-500">
          Add hozzá azokat a megyéket és településeket, ahol el tudsz vállalni
          melót. Több területet is felvehetsz.
        </p>
      </div>

      {areas.map((area) => {
        const key = locationKey(area.county, area.place);
        return (
          <div key={key}>
            <input type="hidden" name="coverage_counties" value={area.county} />
            <input type="hidden" name="coverage_places" value={area.place} />
          </div>
        );
      })}

      {areas.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {areas.map((area) => {
            const key = locationKey(area.county, area.place);
            return (
              <li
                key={key}
                className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-200"
              >
                {formatLocationLabel(area.county, area.place)}
                <button
                  type="button"
                  onClick={() => removeArea(key)}
                  className="rounded-full px-1 text-amber-300/80 hover:bg-amber-500/20 hover:text-amber-100"
                  aria-label={`${area.place} eltávolítása`}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4">
        <PlacePicker
          countyName={draftCounty}
          placeName={draftPlace}
          required={false}
          onChange={(nextCounty, nextPlace) => {
            setDraftCounty(nextCounty);
            setDraftPlace(nextPlace);
            setError(null);
          }}
        />
        <button
          type="button"
          onClick={addArea}
          className={`mt-4 ${btnSecondaryClassName}`}
        >
          Terület hozzáadása
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {areas.length === 0 && (
          <p className="mt-2 text-sm text-zinc-500">
            Legalább egy települést adj meg.
          </p>
        )}
      </div>
    </div>
  );
}
