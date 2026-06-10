import { getMainCategoryLabel } from "@/lib/constants/categories";
import { formatPublicJobLocation } from "@/lib/privacy/job-public";
import type { PublicJobListing } from "@/lib/jobs/job-listing";
import { getMetadataBaseUrl } from "@/lib/seo/site-url";

function parseLocality(job: PublicJobListing): string {
  const city = job.city?.trim();
  if (city) {
    return city;
  }

  const county = job.county?.trim();
  if (county) {
    return county === "Budapest" ? "Budapest" : `${county} megye`;
  }

  return "Magyarország";
}

function parseRegion(job: PublicJobListing): string | undefined {
  const county = job.county?.trim();
  if (!county) {
    return undefined;
  }

  return county === "Budapest" ? "Budapest" : `${county} megye`;
}

/** JobPosting structured data a publikus /hirdetes oldalakhoz. */
export function buildJobPostingJsonLd(job: PublicJobListing) {
  const baseUrl = getMetadataBaseUrl();
  const pageUrl = `${baseUrl}/hirdetes/${job.id}`;
  const locationLabel = formatPublicJobLocation(job);
  const categoryLabel = getMainCategoryLabel(job.category);

  const address: Record<string, string> = {
    "@type": "PostalAddress",
    addressCountry: "HU",
    addressLocality: parseLocality(job),
  };

  const region = parseRegion(job);
  if (region) {
    address.addressRegion = region;
  }

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: "Fusizok.hu",
      value: job.id,
    },
    datePosted: job.created_at,
    employmentType: "CONTRACTOR",
    occupationalCategory: categoryLabel,
    hiringOrganization: {
      "@type": "Organization",
      name: "Fusizok.hu",
      sameAs: baseUrl,
      url: baseUrl,
    },
    jobLocation: {
      "@type": "Place",
      name: locationLabel,
      address,
    },
    url: pageUrl,
    directApply: true,
    applicantLocationRequirements: {
      "@type": "Country",
      name: "HU",
    },
  };
}
