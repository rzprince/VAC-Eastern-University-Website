import type { MetadataRoute } from "next";

const base = "https://vac-eastern-university.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: base + "/events", changeFrequency: "weekly", priority: 0.8 },
    { url: base + "/archive", changeFrequency: "weekly", priority: 0.8 },
    { url: base + "/join", changeFrequency: "monthly", priority: 0.7 }
  ];
}
