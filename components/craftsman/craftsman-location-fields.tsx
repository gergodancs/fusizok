"use client";

import { FixedLocationPicker } from "@/components/location/fixed-location-picker";
import { ServiceRadiusSelect } from "@/components/location/service-radius-select";
import type { CraftsmanLocationEdit } from "@/lib/craftsman-profile";

type CraftsmanLocationFieldsProps = {
  defaultLocation: CraftsmanLocationEdit;
};

export function CraftsmanLocationFields({
  defaultLocation,
}: CraftsmanLocationFieldsProps) {
  return (
    <div className="space-y-4">
      <FixedLocationPicker
        label="Szolgáltatási bázis"
        countyName={defaultLocation.county}
        cityName={defaultLocation.city}
      />

      <ServiceRadiusSelect defaultValue={defaultLocation.serviceRadiusKm} />
    </div>
  );
}
