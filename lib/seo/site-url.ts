/** Kanonikus alap URL metaadatokhoz, sitemaphez és robots.txt-hez. */
export function getMetadataBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ??
    "https://fusizok.hu"
  );
}
