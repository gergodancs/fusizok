import type { MetadataRoute } from "next";
import { getMetadataBaseUrl } from "@/lib/seo/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getMetadataBaseUrl();
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
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
}
