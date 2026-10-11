import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }] },
  outputFileTracingIncludes: {
    "/api/registrations": ["./public/vac-logo.png", "./public/eastern-university-logo.png"],
    "/api/pdf-preview-check": ["./public/vac-logo.png", "./public/eastern-university-logo.png"]
  }
};

export default nextConfig;
