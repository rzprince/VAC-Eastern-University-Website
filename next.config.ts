import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://*.facebook.com",
  "connect-src 'self' https://*.supabase.co",
  "frame-src 'none'",
  "media-src 'self' https://*.supabase.co",
  "manifest-src 'self'",
  ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : [])
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-DNS-Prefetch-Control", value: "off" }
];

const nextConfig: NextConfig = {
  experimental: {
    // Image-bearing admin Server Actions previously failed before execution at
    // Next.js' default 1 MB request limit. Actual images remain capped at 8 MB
    // and MIME/signature validated by app/admin/actions.ts.
    serverActions: { bodySizeLimit: "10mb" },
    proxyClientMaxBodySize: "10mb"
  },
  images: { remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }] },
  outputFileTracingIncludes: {
    "/api/registrations": ["./public/vac-logo.png", "./public/eastern-university-logo.png"]
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [
        { key: "Cache-Control", value: "private, no-store" },
        { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }
      ] },
      { source: "/api/:path*", headers: [
        { key: "Cache-Control", value: "private, no-store" },
        { key: "X-Robots-Tag", value: "noindex, noarchive" }
      ] }
    ];
  }
};

export default nextConfig;
