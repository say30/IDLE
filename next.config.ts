import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le fichier du plugin Studio est lu sur le disque par la route de téléchargement.
  outputFileTracingIncludes: {
    "/api/plugin/download": ["./plugin/**"],
  },
};

export default nextConfig;
