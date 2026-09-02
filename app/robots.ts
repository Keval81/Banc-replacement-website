import type { MetadataRoute } from "next";

import { absoluteUrl, SITE_URL } from "@/lib/site";
import { PRIVATE_PATHS } from "@/lib/site-routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_PATHS],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
