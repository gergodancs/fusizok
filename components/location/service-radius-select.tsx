"use client";

import {
  DEFAULT_SERVICE_RADIUS_KM,
  SERVICE_RADIUS_OPTIONS,
} from "@/lib/location/types";
import { inputClassName, labelClassName } from "@/lib/ui-classes";

type ServiceRadiusSelectProps = {
  defaultValue?: number;
  fieldName?: string;
};

function normalizeRadius(value: number): number {
  return SERVICE_RADIUS_OPTIONS.includes(
    value as (typeof SERVICE_RADIUS_OPTIONS)[number],
  )
    ? value
    : DEFAULT_SERVICE_RADIUS_KM;
}

export function ServiceRadiusSelect({
  defaultValue = DEFAULT_SERVICE_RADIUS_KM,
  fieldName = "service_radius_km",
}: ServiceRadiusSelectProps) {
  const value = normalizeRadius(defaultValue);

  return (
    <div className="space-y-2 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4">
      <label htmlFor="service-radius-km" className={labelClassName}>
        Vállalási hatósugár (km)
      </label>
      <p className="text-sm text-zinc-500">
        A szolgáltatási bázisodtól számítva ennyire vállalsz munkát – a
        illesztés a megadott település geokódolt koordinátái alapján történik.
      </p>
      <select
        id="service-radius-km"
        name={fieldName}
        defaultValue={String(value)}
        className={inputClassName}
      >
        {SERVICE_RADIUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option} km
          </option>
        ))}
      </select>
    </div>
  );
}
