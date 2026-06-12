"use client";

import { useState } from "react";
import { BudapestDistrictPicker } from "@/components/location/budapest-district-picker";
import { FixedLocationPicker } from "@/components/location/fixed-location-picker";
import { ServiceRadiusSelect } from "@/components/location/service-radius-select";
import type { CraftsmanLocationEdit } from "@/lib/craftsman-profile";
import type { CoverageArea } from "@/lib/places";

type CraftsmanLocationFieldsProps = {
  defaultLocation: CraftsmanLocationEdit;
  defaultCoverageAreas?: CoverageArea[];
};

export function CraftsmanLocationFields({
  defaultLocation,
  defaultCoverageAreas = [],
}: CraftsmanLocationFieldsProps) {
  const [county, setCounty] = useState(defaultLocation.county);
  const [city, setCity] = useState(defaultLocation.city);

  return (
    <div className="space-y-4">
      <FixedLocationPicker
        label="Szolgáltatási bázis"
        countyName={defaultLocation.county}
        cityName={defaultLocation.city}
        onChange={(value) => {
          setCounty(value.county);
          setCity(value.city);
        }}
      />

      {county === "Budapest" && (
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4">
          <BudapestDistrictPicker
            defaultAreas={defaultCoverageAreas}
            baseDistrict={city}
          />
        </div>
      )}

      <ServiceRadiusSelect defaultValue={defaultLocation.serviceRadiusKm} />
    </div>
  );
}
