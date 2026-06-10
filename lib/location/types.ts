export type LocationMode = "manual";

export type ParsedLocation = {
  mode: "manual";
  latitude: null;
  longitude: null;
  county: string;
  city: string;
};

export const SERVICE_RADIUS_OPTIONS = [5, 10, 25, 50, 100] as const;
export type ServiceRadiusKm = (typeof SERVICE_RADIUS_OPTIONS)[number];

export const DEFAULT_SERVICE_RADIUS_KM: ServiceRadiusKm = 25;

/** @deprecated Régi slider kompatibilitás – használd a SERVICE_RADIUS_OPTIONS értékeit. */
export const MIN_SERVICE_RADIUS_KM = 5;
/** @deprecated Régi slider kompatibilitás – használd a SERVICE_RADIUS_OPTIONS értékeit. */
export const MAX_SERVICE_RADIUS_KM = 100;
