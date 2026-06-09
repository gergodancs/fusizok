"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import {
  HUNGARY_COUNTY_NAMES,
  getPlacesForCounty,
} from "@/lib/data/hungaryPlaces";

type PlacePickerProps = {
  countyName?: string;
  placeName?: string;
  countyFieldName?: string;
  placeFieldName?: string;
  required?: boolean;
  onChange?: (county: string, place: string) => void;
};

export function PlacePicker({
  countyName = "",
  placeName = "",
  countyFieldName = "county",
  placeFieldName = "place",
  required = true,
  onChange,
}: PlacePickerProps) {
  const [county, setCounty] = useState(countyName);
  const [place, setPlace] = useState(placeName);

  useEffect(() => {
    setCounty(countyName);
  }, [countyName]);

  useEffect(() => {
    setPlace(placeName);
  }, [placeName]);

  const placeOptions = useMemo(
    () => (county ? getPlacesForCounty(county) : []),
    [county],
  );

  function handleCountyChange(nextCounty: string) {
    setCounty(nextCounty);
    setPlace("");
    onChange?.(nextCounty, "");
  }

  function handlePlaceChange(nextPlace: string) {
    setPlace(nextPlace);
    onChange?.(county, nextPlace);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name={countyFieldName} value={county} />
      <input type="hidden" name={placeFieldName} value={place} />

      <SearchableCombobox
        label="Megye"
        placeholder="Kezdd el gépelni a megyét…"
        options={[...HUNGARY_COUNTY_NAMES]}
        value={county}
        onChange={handleCountyChange}
        required={required}
        hint="Válaszd ki a megyét, majd a települést."
      />

      <SearchableCombobox
        label="Település / kerület"
        placeholder={
          county ? "Pl. Göd, Gödöllő…" : "Előbb válassz megyét"
        }
        options={placeOptions}
        value={place}
        onChange={handlePlaceChange}
        disabled={!county}
        required={required}
        emptyMessage={
          county ? "Nincs ilyen település ebben a megyében." : emptyCountyMessage
        }
      />
    </div>
  );
}

const emptyCountyMessage = "Előbb válassz megyét.";
