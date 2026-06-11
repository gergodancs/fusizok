import { describe, expect, it } from "vitest";
import {
  getPlaceholderJobListing,
  isPlaceholderJobId,
  listPlaceholderJobPreviews,
} from "@/lib/jobs/placeholder-jobs";

describe("placeholder jobs", () => {
  it("recognizes placeholder ids", () => {
    expect(isPlaceholderJobId("pelda-polc-furas-budapest")).toBe(true);
    expect(
      isPlaceholderJobId("550e8400-e29b-41d4-a716-446655440000"),
    ).toBe(false);
  });

  it("exposes ten showcase listings", () => {
    expect(listPlaceholderJobPreviews()).toHaveLength(10);
  });

  it("returns a full placeholder listing by id", () => {
    const job = getPlaceholderJobListing("pelda-polc-furas-budapest");
    expect(job?.title).toContain("Polc");
    expect(job?.isPlaceholder).toBe(true);
  });
});
