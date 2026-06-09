export type UserRole = "client" | "craftsman";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
};

export type CraftsmanProfile = {
  id: string;
  profession: string | string[] | null;
  /** Budapesti kerületek nevei, pl. ["1. kerület", "11. kerület"] */
  coverage_zip_codes: string[];
  free_credits: number;
  bio: string | null;
};

export type CraftsmanProfileUpdate = {
  profession?: string | string[] | null;
  /** Budapesti kerületek nevei */
  coverage_zip_codes?: string[];
  bio?: string | null;
};
