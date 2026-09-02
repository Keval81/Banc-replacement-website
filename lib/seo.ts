import type { Metadata } from "next";

import { absoluteUrl, SITE_NAME, truncateDescription } from "./site.ts";

export interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  /** Private, transactional or unfinished routes that should not be indexed. */
  noindex?: boolean;
  /** Absolute URL or site-relative path of the Open Graph image. */
  image?: string;
  imageAlt?: string;
  keywords?: readonly string[];
  type?: "website" | "article";
}

export const DEFAULT_OG_IMAGE_PATH = "/api/og";

// Builds a complete Metadata object with an absolute canonical URL, Open Graph
// and Twitter cards, and a robots directive. Used by every route so the
// shape is consistent site-wide.
export function buildMetadata({
  title,
  description,
  path,
  noindex = false,
  image = DEFAULT_OG_IMAGE_PATH,
  imageAlt = SITE_NAME,
  keywords,
  type = "website",
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const summary = truncateDescription(description);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description: summary,
    ...(keywords && keywords.length > 0 ? { keywords: [...keywords] } : {}),
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description: summary,
      url: canonical,
      siteName: SITE_NAME,
      type,
      locale: "en_GB",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: summary,
      images: [imageUrl],
    },
  };
}

// Fills in the site-wide defaults (absolute canonical, Open Graph card,
// robots) around a hand-written Metadata object without overriding anything
// the page already specifies.
export function withPageDefaults(path: string, meta: Metadata): Metadata {
  const canonical = absoluteUrl(path);
  const title =
    typeof meta.title === "string"
      ? meta.title
      : meta.title && "absolute" in meta.title && typeof meta.title.absolute === "string"
        ? meta.title.absolute
        : SITE_NAME;
  const description = meta.description ?? undefined;
  const openGraph = meta.openGraph ?? {
    title,
    ...(description ? { description } : {}),
    type: "website",
  };

  return {
    ...meta,
    alternates: { ...(meta.alternates ?? {}), canonical: meta.alternates?.canonical ?? canonical },
    openGraph: {
      siteName: SITE_NAME,
      locale: "en_GB",
      url: canonical,
      images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE_PATH), width: 1200, height: 630, alt: SITE_NAME }],
      ...openGraph,
    },
    robots: meta.robots ?? { index: true, follow: true },
  };
}
