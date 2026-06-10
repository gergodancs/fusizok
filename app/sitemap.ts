import type { MetadataRoute } from "next";
import { listOpenJobIdsForSitemap } from "@/lib/jobs/job-listing";
import { getMetadataBaseUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getMetadataBaseUrl();
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/lakos`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hogyan-mukodik`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/aszf`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/adatvedelem`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const openJobs = await listOpenJobIdsForSitemap();
  const jobPages: MetadataRoute.Sitemap = openJobs.map((job) => ({
    url: `${baseUrl}/hirdetes/${job.id}`,
    lastModified: new Date(job.created_at),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...jobPages];
}
