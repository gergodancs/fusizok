export type UserRole = "client" | "craftsman";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export type CraftsmanProfile = {
  id: string;
  profession: string | string[] | null;
  county?: string | null;
  city?: string | null;
  location_gps?: unknown | null;
  service_radius_km?: number;
  /** Lefedett megyék – coverage_zip_codes-szal párosítva */
  coverage_counties: string[];
  /** Lefedett települések/kerületek (DB: coverage_zip_codes) */
  coverage_zip_codes: string[];
  free_credits: number;
  bio: string | null;
};

export type CraftsmanProfileUpdate = {
  profession?: string | string[] | null;
  county?: string | null;
  city?: string | null;
  service_radius_km?: number;
  coverage_counties?: string[];
  coverage_zip_codes?: string[];
  bio?: string | null;
};
