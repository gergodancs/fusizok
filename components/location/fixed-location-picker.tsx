"use client";

import { useEffect, useState } from "react";
import { PlacePicker } from "@/components/location/place-picker";
import { labelClassName } from "@/lib/ui-classes";

export type FixedLocationValue = {
  county: string;
  city: string;
  isComplete: boolean;
};

type FixedLocationPickerProps = {
  label?: string;
  countyName?: string;
  cityName?: string;
  required?: boolean;
  onChange?: (value: FixedLocationValue) => void;
};

export function FixedLocationPicker({
  label = "Helyszín",
  countyName = "",
  cityName = "",
  required = true,
  onChange,
}: FixedLocationPickerProps) {
  const [county, setCounty] = useState(countyName);
  const [city, setCity] = useState(cityName);

  useEffect(() => {
    setCounty(countyName);
    setCity(cityName);
  }, [countyName, cityName]);

  function handleChange(nextCounty: string, nextCity: string) {
    setCounty(nextCounty);
    setCity(nextCity);
    onChange?.({
      county: nextCounty,
      city: nextCity,
      isComplete: Boolean(nextCounty && nextCity),
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="location_mode" value="manual" />
      <span className={labelClassName}>{label}</span>
      <p className="text-sm text-zinc-500">
        Add meg a munkavégzés helyét megye és település szerint – a rendszer
        ehhez igazítja a térképi illesztést, nem a telefonod pillanatnyi
        pozícióját.
      </p>
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4">
        <PlacePicker
          countyName={county}
          placeName={city}
          placeFieldName="city"
          required={required}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
