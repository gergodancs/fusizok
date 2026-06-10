import { describe, expect, it } from "vitest";
import { buildJobPostingJsonLd } from "@/lib/seo/job-posting";
import type { PublicJobListing } from "@/lib/jobs/job-listing";

const sampleJob: PublicJobListing = {
  id: "job-123",
  title: "Polc fúrás a nappaliban",
  description: "Két polc felszerelése betonfalra.",
  category: "asztalos",
  sub_categories: ["polc_felszereles"],
  county: "Győr-Moson-Sopron",
  city: "Sopron",
  required_completion_time: "1 héten belül",
  created_at: "2026-06-01T10:00:00.000Z",
  client_display_name: "Péter",
  bid_count: 2,
  has_images: false,
};

describe("buildJobPostingJsonLd", () => {
  it("generates JobPosting schema with location and canonical url", () => {
    const jsonLd = buildJobPostingJsonLd(sampleJob);

    expect(jsonLd["@type"]).toBe("JobPosting");
    expect(jsonLd.title).toBe(sampleJob.title);
    expect(jsonLd.description).toBe(sampleJob.description);
    expect(jsonLd.datePosted).toBe(sampleJob.created_at);
    expect(jsonLd.url).toBe("https://fusizok.hu/hirdetes/job-123");
    expect(jsonLd.hiringOrganization).toMatchObject({
      name: "Fusizok.hu",
    });
    expect(jsonLd.jobLocation).toMatchObject({
      name: "Sopron, Győr-Moson-Sopron megye",
      address: {
        addressLocality: "Sopron",
        addressRegion: "Győr-Moson-Sopron megye",
        addressCountry: "HU",
      },
    });
  });
});
