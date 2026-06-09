export type LocationMode = "gps" | "manual";

export type HybridLocationValue = {
  mode: LocationMode | null;
  latitude: number | null;
  longitude: number | null;
  county: string;
  city: string;
};

export type ParsedLocation =
  | {
      mode: "gps";
      latitude: number;
      longitude: number;
      county: null;
      city: null;
    }
  | {
      mode: "manual";
      latitude: null;
      longitude: null;
      county: string;
      city: string;
    };

export const DEFAULT_SERVICE_RADIUS_KM = 25;
export const MIN_SERVICE_RADIUS_KM = 5;
export const MAX_SERVICE_RADIUS_KM = 100;
