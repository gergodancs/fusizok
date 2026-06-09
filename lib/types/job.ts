export type JobStatus = "open" | "assigned" | "completed" | "cancelled";

export type Job = {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  /** Megye neve */
  county?: string | null;
  /** Település vagy kerület neve (DB oszlop: zip_code) */
  zip_code: string;
  status: JobStatus;
  required_completion_time?: string | null;
  image_urls?: string[] | null;
  created_at?: string;
};
