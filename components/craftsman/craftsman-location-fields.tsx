"use client";

import { useState } from "react";
import { HybridLocationPicker } from "@/components/location/hybrid-location-picker";
import { ServiceRadiusSlider } from "@/components/location/service-radius-slider";
import type { CraftsmanLocationEdit } from "@/lib/craftsman-profile";
import type { HybridLocationValue } from "@/lib/location/types";

type CraftsmanLocationFieldsProps = {
  defaultLocation: CraftsmanLocationEdit;
};

export function CraftsmanLocationFields({
  defaultLocation,
}: CraftsmanLocationFieldsProps) {
  const [hasLocation, setHasLocation] = useState(
    defaultLocation.mode !== null ||
      Boolean(defaultLocation.county && defaultLocation.city),
  );

  function handleLocationChange(value: HybridLocationValue) {
    setHasLocation(value.mode !== null);
  }

  return (
    <div className="space-y-4">
      <HybridLocationPicker
        label="Hol vállalsz munkát?"
        countyName={defaultLocation.county}
        cityName={defaultLocation.city}
        latitude={defaultLocation.latitude}
        longitude={defaultLocation.longitude}
        locationMode={defaultLocation.mode}
        onChange={handleLocationChange}
      />

      {hasLocation && (
        <ServiceRadiusSlider defaultValue={defaultLocation.serviceRadiusKm} />
      )}
    </div>
  );
}
