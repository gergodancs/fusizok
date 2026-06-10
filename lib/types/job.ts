export type JobStatus = "open" | "assigned" | "completed" | "cancelled";

export type Job = {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  sub_categories?: string[];
  /** Megye neve (kézi megadás) */
  county?: string | null;
  /** Település vagy kerület (kézi megadás) */
  city?: string | null;
  /** Település vagy kerület – visszafelé kompatibilitás */
  zip_code?: string | null;
  /** PostGIS geography – GPS helyszín */
  location_gps?: unknown | null;
  status: JobStatus;
  required_completion_time?: string | null;
  image_urls?: string[] | null;
  created_at?: string;
};
