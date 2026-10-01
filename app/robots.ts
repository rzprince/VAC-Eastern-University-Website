import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/events", "/archive", "/join", "/privacy"],
        disallow: ["/admin", "/api"]
      }
    ],
    sitemap: "https://vac-eastern-university.vercel.app/sitemap.xml"
  };
}
