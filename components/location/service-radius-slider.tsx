"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SERVICE_RADIUS_KM,
  MAX_SERVICE_RADIUS_KM,
  MIN_SERVICE_RADIUS_KM,
} from "@/lib/location/types";
import { labelClassName } from "@/lib/ui-classes";

type ServiceRadiusSliderProps = {
  defaultValue?: number;
  fieldName?: string;
  onChange?: (value: number) => void;
};

export function ServiceRadiusSlider({
  defaultValue = DEFAULT_SERVICE_RADIUS_KM,
  fieldName = "service_radius_km",
  onChange,
}: ServiceRadiusSliderProps) {
  const [value, setValue] = useState(
    clampRadius(defaultValue),
  );

  useEffect(() => {
    setValue(clampRadius(defaultValue));
  }, [defaultValue]);

  function handleChange(next: number) {
    const clamped = clampRadius(next);
    setValue(clamped);
    onChange?.(clamped);
  }

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="service-radius" className={labelClassName}>
          Vállalási sugár
        </label>
        <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-sm font-semibold text-amber-300">
          {value} km
        </span>
      </div>

      <input type="hidden" name={fieldName} value={value} />

      <input
        id="service-radius"
        type="range"
        min={MIN_SERVICE_RADIUS_KM}
        max={MAX_SERVICE_RADIUS_KM}
        step={1}
        value={value}
        onChange={(e) => handleChange(Number.parseInt(e.target.value, 10))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-amber-500"
      />

      <div className="flex justify-between text-xs text-zinc-500">
        <span>{MIN_SERVICE_RADIUS_KM} km</span>
        <span>{MAX_SERVICE_RADIUS_KM} km</span>
      </div>

      <p className="text-sm text-zinc-500">
        Ennyi távolságra a bázispontodtól jelennek meg a neked illeszkedő GPS-es
        munkák.
      </p>
    </div>
  );
}

function clampRadius(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_SERVICE_RADIUS_KM;
  }
  return Math.min(MAX_SERVICE_RADIUS_KM, Math.max(MIN_SERVICE_RADIUS_KM, value));
}
