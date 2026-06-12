"use client";

import { useEffect, useMemo, useState } from "react";
import { BUDAPEST_DISTRICTS } from "@/lib/data/hungaryPlaces";
import {
  dedupeCoverageAreas,
  type CoverageArea,
  locationKey,
} from "@/lib/places";
import { labelClassName } from "@/lib/ui-classes";

type BudapestDistrictPickerProps = {
  defaultAreas?: CoverageArea[];
  baseDistrict?: string;
};

function formatDistrictShortLabel(district: string): string {
  return district.replace(/^Budapest\s+/, "");
}

export function BudapestDistrictPicker({
  defaultAreas = [],
  baseDistrict = "",
}: BudapestDistrictPickerProps) {
  const initialSelected = useMemo(() => {
    const fromProfile = defaultAreas
      .filter((area) => area.county === "Budapest")
      .map((area) => area.place);

    if (fromProfile.length > 0) {
      return new Set(fromProfile);
    }

    if (baseDistrict && BUDAPEST_DISTRICTS.includes(baseDistrict)) {
      return new Set([baseDistrict]);
    }

    return new Set<string>();
  }, [defaultAreas, baseDistrict]);

  const [selected, setSelected] = useState<Set<string>>(initialSelected);

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  useEffect(() => {
    if (selected.size === 0 && baseDistrict && BUDAPEST_DISTRICTS.includes(baseDistrict)) {
      setSelected(new Set([baseDistrict]));
    }
  }, [baseDistrict, selected.size]);

  const allSelected = selected.size === BUDAPEST_DISTRICTS.length;

  function toggleDistrict(district: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(district);
      } else {
        next.delete(district);
      }
      return next;
    });
  }

  function toggleAllDistricts() {
    if (allSelected) {
      const fallback =
        baseDistrict && BUDAPEST_DISTRICTS.includes(baseDistrict)
          ? new Set([baseDistrict])
          : new Set<string>();
      setSelected(fallback);
      return;
    }

    setSelected(new Set(BUDAPEST_DISTRICTS));
  }

  const selectedAreas = dedupeCoverageAreas(
    [...selected].map((place) => ({ county: "Budapest", place })),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className={labelClassName}>Budapesti kerületek</span>
          <p className="mt-1 text-sm text-zinc-500">
            Jelöld be, mely kerületekben vállalsz munkát. A báziskerületed
            alapból be van jelölve.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAllDistricts}
          className="shrink-0 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-amber-500/50 hover:bg-zinc-700"
        >
          {allSelected ? "Kijelölés törlése" : "Összes kerület"}
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {BUDAPEST_DISTRICTS.map((district) => (
          <label
            key={district}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300 has-[:checked]:border-amber-500/50 has-[:checked]:bg-amber-500/10 has-[:checked]:text-amber-100"
          >
            <input
              type="checkbox"
              checked={selected.has(district)}
              onChange={(e) => toggleDistrict(district, e.target.checked)}
              className="accent-amber-500"
            />
            {formatDistrictShortLabel(district)}
          </label>
        ))}
      </div>

      {selectedAreas.map((area) => (
        <div key={locationKey(area.county, area.place)}>
          <input type="hidden" name="coverage_counties" value={area.county} />
          <input type="hidden" name="coverage_places" value={area.place} />
        </div>
      ))}

      {selected.size === 0 && (
        <p className="text-sm text-amber-400/90" role="status">
          Legalább egy kerületet jelölj be.
        </p>
      )}
    </div>
  );
}
