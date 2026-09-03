// Route inventory shared by app/sitemap.ts and app/robots.ts.
// STATIC_ROUTES lists every public, indexable page under app/. Keep this in
// step with the filesystem: a new marketing page needs an entry here to be
// discovered by search engines.

export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface StaticRoute {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}

export const STATIC_ROUTES: readonly StaticRoute[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/sales", priority: 0.9, changeFrequency: "weekly" },
  { path: "/sales/properties", priority: 0.9, changeFrequency: "hourly" },
  { path: "/sales/buyers-guide", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sales/sellers-guide", priority: 0.7, changeFrequency: "monthly" },
  { path: "/lettings", priority: 0.9, changeFrequency: "weekly" },
  { path: "/lettings/properties", priority: 0.9, changeFrequency: "hourly" },
  { path: "/lettings/fees", priority: 0.6, changeFrequency: "monthly" },
  { path: "/lettings/landlords-guide", priority: 0.7, changeFrequency: "monthly" },
  { path: "/lettings/tenants-guide", priority: 0.7, changeFrequency: "monthly" },
  { path: "/premier-homes", priority: 0.8, changeFrequency: "weekly" },
  { path: "/land-new-homes", priority: 0.7, changeFrequency: "weekly" },
  { path: "/sold-prices", priority: 0.6, changeFrequency: "weekly" },
  { path: "/valuation", priority: 0.8, changeFrequency: "monthly" },
  { path: "/area-guides", priority: 0.8, changeFrequency: "monthly" },
  { path: "/offices", priority: 0.7, changeFrequency: "monthly" },
  { path: "/offices/cuffley", priority: 0.7, changeFrequency: "monthly" },
  { path: "/offices/mayfair", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/why-us", priority: 0.7, changeFrequency: "monthly" },
  { path: "/the-team", priority: 0.7, changeFrequency: "monthly" },
  { path: "/track-record", priority: 0.7, changeFrequency: "monthly" },
  { path: "/reviews", priority: 0.7, changeFrequency: "weekly" },
  { path: "/the-guild", priority: 0.6, changeFrequency: "monthly" },
  { path: "/become-partner", priority: 0.6, changeFrequency: "monthly" },
  { path: "/community", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.8, changeFrequency: "daily" },
  { path: "/tools", priority: 0.6, changeFrequency: "monthly" },
  { path: "/tools/affordability", priority: 0.5, changeFrequency: "monthly" },
  { path: "/tools/catchment-checker", priority: 0.5, changeFrequency: "monthly" },
  { path: "/tools/mortgage-calculator", priority: 0.5, changeFrequency: "monthly" },
  { path: "/tools/stamp-duty", priority: 0.5, changeFrequency: "monthly" },
  { path: "/tools/yield-calculator", priority: 0.5, changeFrequency: "monthly" },
  { path: "/newsletter/signup", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  { path: "/complaints", priority: 0.3, changeFrequency: "yearly" },
];

// Private, transactional or unfinished routes: noindex in metadata,
// disallowed in robots.txt and never listed in the sitemap.
export const PRIVATE_PATHS: readonly string[] = [
  "/api/",
  "/account",
  "/alerts",
  "/book-viewing/",
  "/compare",
  "/favorites",
  "/login",
  "/make-offer/",
  "/newsletter/unsubscribe",
  "/portal",
  "/progress/",
  "/register",
  "/search",
];

export function isPrivatePath(path: string): boolean {
  return PRIVATE_PATHS.some((prefix) =>
    prefix.endsWith("/") ? path.startsWith(prefix) : path === prefix || path.startsWith(`${prefix}/`),
  );
}
