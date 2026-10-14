import type { MetadataRoute } from "next";

const SITE_URL = "https://redant.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/super-admin",
        "/dashboard",
        "/inbox",
        "/contacts",
        "/pipelines",
        "/broadcasts",
        "/automations",
        "/settings",
        "/login",
        "/signup",
        "/forgot-password",
        "/join/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
