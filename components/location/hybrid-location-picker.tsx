"use client";

import { useEffect, useState } from "react";
import { PlacePicker } from "@/components/location/place-picker";
import {
  geolocationErrorMessage,
  requestCurrentPosition,
} from "@/lib/location/geolocation-client";
import type { HybridLocationValue } from "@/lib/location/types";
import { btnSecondaryClassName, labelClassName } from "@/lib/ui-classes";

type HybridLocationPickerProps = {
  label?: string;
  countyName?: string;
  cityName?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationMode?: HybridLocationValue["mode"];
  required?: boolean;
  onChange?: (value: HybridLocationValue) => void;
};

export function HybridLocationPicker({
  label = "Helyszín",
  countyName = "",
  cityName = "",
  latitude = null,
  longitude = null,
  locationMode = null,
  required = true,
  onChange,
}: HybridLocationPickerProps) {
  const [mode, setMode] = useState<HybridLocationValue["mode"]>(locationMode);
  const [lat, setLat] = useState<number | null>(latitude);
  const [lng, setLng] = useState<number | null>(longitude);
  const [county, setCounty] = useState(countyName);
  const [city, setCity] = useState(cityName);
  const [showManual, setShowManual] = useState(
    locationMode === "manual" || (!locationMode && Boolean(countyName || cityName)),
  );
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "success" | "error">(
    locationMode === "gps" ? "success" : "idle",
  );
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [isRequestingGps, setIsRequestingGps] = useState(false);

  useEffect(() => {
    setMode(locationMode);
    setLat(latitude);
    setLng(longitude);
    setCounty(countyName);
    setCity(cityName);
    if (locationMode === "gps") {
      setGpsStatus("success");
      setShowManual(false);
    } else if (locationMode === "manual") {
      setShowManual(true);
      setGpsStatus("idle");
    }
  }, [locationMode, latitude, longitude, countyName, cityName]);

  function emit(next: HybridLocationValue) {
    onChange?.(next);
  }

  function emitState(
    nextMode: HybridLocationValue["mode"],
    nextLat: number | null,
    nextLng: number | null,
    nextCounty: string,
    nextCity: string,
  ) {
    emit({
      mode: nextMode,
      latitude: nextLat,
      longitude: nextLng,
      county: nextCounty,
      city: nextCity,
    });
  }

  async function handleUseGps() {
    setIsRequestingGps(true);
    setGpsMessage(null);
    setGpsStatus("loading");

    const result = await requestCurrentPosition();
    setIsRequestingGps(false);

    if (!result.ok) {
      setGpsStatus("error");
      setGpsMessage(geolocationErrorMessage(result.code));
      setShowManual(true);
      setMode(null);
      emitState(null, null, null, county, city);
      return;
    }

    setMode("gps");
    setLat(result.latitude);
    setLng(result.longitude);
    setShowManual(false);
    setGpsStatus("success");

    let label = "Pozíció rögzítve";
    try {
      const response = await fetch(
        `/api/geocode/reverse?lat=${result.latitude}&lng=${result.longitude}`,
      );
      if (response.ok) {
        const data = (await response.json()) as {
          label?: string;
          county?: string;
          city?: string;
        };
        if (data.label) {
          label = `Pozíció rögzítve: ${data.label}`;
        }
        setCounty(data.county ?? "");
        setCity(data.city ?? "");
        emitState(
          "gps",
          result.latitude,
          result.longitude,
          data.county ?? "",
          data.city ?? "",
        );
      } else {
        setCounty("");
        setCity("");
        emitState("gps", result.latitude, result.longitude, "", "");
      }
    } catch {
      setCounty("");
      setCity("");
      emitState("gps", result.latitude, result.longitude, "", "");
    }

    setGpsMessage(label);
  }

  function handleManualToggle() {
    setShowManual(true);
    setMode("manual");
    setGpsStatus("idle");
    setGpsMessage(null);
    setLat(null);
    setLng(null);
    emitState("manual", null, null, county, city);
  }

  function handleManualChange(nextCounty: string, nextCity: string) {
    setCounty(nextCounty);
    setCity(nextCity);
    setMode(nextCounty && nextCity ? "manual" : null);
    setLat(null);
    setLng(null);
    setGpsStatus("idle");
    setGpsMessage(null);
    emitState(
      nextCounty && nextCity ? "manual" : null,
      null,
      null,
      nextCounty,
      nextCity,
    );
  }

  const gpsLocked = mode === "gps" && gpsStatus === "success";

  return (
    <div className="space-y-4">
      <span className={labelClassName}>{label}</span>

      <input type="hidden" name="location_mode" value={mode ?? ""} />
      <input
        type="hidden"
        name="location_lat"
        value={lat !== null ? String(lat) : ""}
      />
      <input
        type="hidden"
        name="location_lng"
        value={lng !== null ? String(lng) : ""}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleUseGps}
          disabled={isRequestingGps}
          className={`inline-flex flex-1 items-center justify-center gap-2 ${btnSecondaryClassName}`}
        >
          <CompassIcon className="h-5 w-5 text-amber-400" />
          {isRequestingGps ? "Pozíció lekérése…" : "Jelenlegi pozícióm"}
        </button>

        {!showManual && (
          <button
            type="button"
            onClick={handleManualToggle}
            className={`flex-1 ${btnSecondaryClassName}`}
          >
            Kézi megadás
          </button>
        )}
      </div>

      {gpsStatus === "success" && gpsMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          {gpsMessage}
          {lat !== null && lng !== null && (
            <span className="mt-1 block text-xs text-emerald-400/80">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
          )}
        </div>
      )}

      {gpsStatus === "error" && gpsMessage && (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          {gpsMessage}
        </div>
      )}

      {showManual && !gpsLocked && (
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4">
          <p className="mb-4 text-sm text-zinc-500">
            Válaszd ki a megyét és a települést / kerületet.
          </p>
          <PlacePicker
            countyName={county}
            placeName={city}
            placeFieldName="city"
            required={required && !gpsLocked}
            onChange={handleManualChange}
          />
        </div>
      )}

      {gpsLocked && (
        <button
          type="button"
          onClick={handleManualToggle}
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          Mégis kézzel adom meg a helyszínt
        </button>
      )}
    </div>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5 10 14l4.5-4.5Z" fill="currentColor" stroke="none" />
      <path d="m14.5 9.5-4.5 4.5M9.5 14.5 14 10" />
    </svg>
  );
}
