import type { UserRole } from "@/lib/types/profile";

export function parseOAuthRoleParam(value: string | null): UserRole | null {
  if (value === "craftsman" || value === "client") {
    return value;
  }
  return null;
}

export function parseRoleFormValue(value: FormDataEntryValue | null): UserRole | null {
  if (value === "craftsman" || value === "client") {
    return value;
  }
  return null;
}
