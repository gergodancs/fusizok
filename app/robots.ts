import type { MetadataRoute } from "next";
import { getMetadataBaseUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getMetadataBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/login",
        "/szaki/",
        "/lakos/ajanlatok",
        "/lakos/uzenetek",
        "/lakos/profil",
        "/lakos/fusizo/",
        "/dashboard",
        "/dashboard/",
        "/admin",
        "/admin/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
