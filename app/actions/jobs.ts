"use server";

import { isBudapestDistrict } from "@/lib/budapest-districts";
import {
  isRequiredCompletionTime,
} from "@/lib/completion-time-options";
import { JOB_CATEGORIES, type JobCategory } from "@/lib/job-categories";
import type { JobFormDraft } from "@/lib/job-form-draft";
import { uploadJobImages } from "@/lib/storage/upload-job-images";
import { createClient } from "@/lib/supabase/server";

export type JobFormState = {
  success?: boolean;
  error?: string;
  code?: "auth-required";
  draft?: JobFormDraft;
};

type JobInsert = {
  client_id: string;
  title: string;
  description: string;
  category: string;
  zip_code: string;
  status: "open";
  required_completion_time: string;
  image_urls: string[];
};

export async function createJob(
  _prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const title = (formData.get("title") as string)?.trim();
  const category = formData.get("category") as string;
  const district = (formData.get("zip_code") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const requiredCompletionTime = (
    formData.get("required_completion_time") as string
  )?.trim();

  const draft: JobFormDraft = {
    title: title ?? "",
    category: category ?? "",
    zip_code: district ?? "",
    description: description ?? "",
    required_completion_time: requiredCompletionTime ?? "",
  };

  if (!title) {
    return { error: "Kérjük, adja meg a munka megnevezését.", draft };
  }

  if (!category || !JOB_CATEGORIES.includes(category as JobCategory)) {
    return { error: "Kérjük, válasszon szakma kategóriát.", draft };
  }

  if (!district || !isBudapestDistrict(district)) {
    return { error: "Kérjük, válasszon budapesti kerületet.", draft };
  }

  if (!description) {
    return { error: "Kérjük, írja le részletesen a munkát.", draft };
  }

  if (
    !requiredCompletionTime ||
    !isRequiredCompletionTime(requiredCompletionTime)
  ) {
    return {
      error: "Kérjük, válassza ki, mikorra szeretné az elvégzést.",
      draft,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      code: "auth-required",
      error: "A munkafeladáshoz bejelentkezés szükséges.",
      draft,
    };
  }

  const imageFiles = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const { urls: imageUrls, error: uploadError } = await uploadJobImages(
    imageFiles,
    user.id,
  );

  if (uploadError) {
    return { error: uploadError, draft };
  }

  const payload: JobInsert = {
    client_id: user.id,
    title,
    description,
    category,
    zip_code: district,
    status: "open",
    required_completion_time: requiredCompletionTime,
    image_urls: imageUrls,
  };

  const { error } = await supabase.from("jobs").insert(payload);

  if (error) {
    console.error("Supabase mentési hiba:", error);
    console.error("Beszúrandó adatok:", payload);
    return { error: "A mentés sikertelen. Kérjük, próbálja újra később.", draft };
  }

  return { success: true };
}
