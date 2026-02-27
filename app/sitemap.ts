import { MetadataRoute } from "next";

// Static pages with their priorities and change frequencies
const staticPages = [
  { url: "/", priority: 1.0, changeFrequency: "daily" as const },
  { url: "/sales", priority: 0.9, changeFrequency: "daily" as const },
  { url: "/sales/properties", priority: 0.9, changeFrequency: "hourly" as const },
  { url: "/sales/buyers-guide", priority: 0.7, changeFrequency: "weekly" as const },
  { url: "/sales/sellers-guide", priority: 0.7, changeFrequency: "weekly" as const },
  { url: "/lettings", priority: 0.9, changeFrequency: "daily" as const },
  { url: "/lettings/properties", priority: 0.9, changeFrequency: "hourly" as const },
  { url: "/lettings/tenants-guide", priority: 0.7, changeFrequency: "weekly" as const },
  { url: "/lettings/landlords-guide", priority: 0.7, changeFrequency: "weekly" as const },
  { url: "/area-guides", priority: 0.8, changeFrequency: "weekly" as const },
  { url: "/valuation", priority: 0.8, changeFrequency: "weekly" as const },
  { url: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
  { url: "/why-us", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/the-team", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/track-record", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/reviews", priority: 0.7, changeFrequency: "weekly" as const },
  { url: "/premier-homes", priority: 0.8, changeFrequency: "daily" as const },
  { url: "/land-new-homes", priority: 0.7, changeFrequency: "weekly" as const },
  { url: "/the-guild", priority: 0.6, changeFrequency: "monthly" as const },
  { url: "/become-partner", priority: 0.6, changeFrequency: "monthly" as const },
  { url: "/blog", priority: 0.8, changeFrequency: "daily" as const },
];

// Area guides
const areaGuides = [
  { slug: "cuffley", name: "Cuffley" },
  { slug: "mayfair", name: "Mayfair" },
  { slug: "hertfordshire", name: "Hertfordshire" },
  { slug: "broxbourne", name: "Broxbourne" },
  { slug: "cheshunt", name: "Cheshunt" },
  { slug: "goffs-oak", name: "Goffs Oak" },
];

// Blog categories
const blogCategories = [
  "market-news",
  "area-guides",
  "selling-tips",
  "buying-tips",
  "landlord-advice",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://bancproperty.com";
  const currentDate = new Date();

  // Static pages sitemap entries
  const staticEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Area guides entries
  const areaGuideEntries = areaGuides.map((area) => ({
    url: `${baseUrl}/area-guides/${area.slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Blog category entries
  const blogCategoryEntries = blogCategories.map((category) => ({
    url: `${baseUrl}/blog/category/${category}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Property pages (would be fetched from API in production)
  // For now, we'll include sample property URLs
  const propertyIds = ["chpk1487075", "chpk1487076", "chpk1487077"];
  const propertyEntries = propertyIds.map((id) => ({
    url: `${baseUrl}/sales/properties/${id}`,
    lastModified: currentDate,
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));

  // Lettings property entries
  const lettingsEntries = propertyIds.map((id) => ({
    url: `${baseUrl}/lettings/properties/${id}`,
    lastModified: currentDate,
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));

  // Blog posts (would be fetched from content in production)
  const blogSlugs = [
    "top-tips-selling-home",
    "area-guide-cuffley",
    "property-market-hertfordshire",
  ];
  const blogEntries = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...areaGuideEntries,
    ...blogCategoryEntries,
    ...propertyEntries,
    ...lettingsEntries,
    ...blogEntries,
  ];
}
