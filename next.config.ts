import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Profilkép / galéria / értékelés-fotó feltöltés (max. 5 MB / fájl)
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
