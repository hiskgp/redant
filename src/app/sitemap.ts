import type { MetadataRoute } from "next";

const SITE_URL = "https://redant.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/support", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  return publicPages.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));
}
