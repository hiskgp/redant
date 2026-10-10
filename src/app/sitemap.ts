import type { MetadataRoute } from "next";

const SITE_URL = "https://redant.in";

export default function sitemap(): MetadataRoute.Sitemap {
  // Only include the verified public homepage. Add other URLs here after
  // confirming that each is a canonical, indexable public landing page.
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
