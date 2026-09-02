import type { MetadataRoute } from "next";

import { areaGuides } from "@/lib/area-guides";
import { getAllPosts, categories as blogCategories } from "@/lib/blog";
import { buildPropertyHref } from "@/lib/property-view";
import { absoluteUrl } from "@/lib/site";
import { STATIC_ROUTES } from "@/lib/site-routes";
import { supabase, type DbProperty } from "@/lib/supabase";

export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

const MARKETABLE_STATUSES: DbProperty["status"][] = [
  "for_sale",
  "under_offer",
  "to_let",
  "let_agreed",
];

type SitemapPropertyRow = Pick<
  DbProperty,
  "id" | "expert_agent_id" | "department" | "updated_at"
>;

// Live property URLs. Degrades to an empty list (static routes only) when
// Supabase is not configured or the query fails, so the sitemap never 500s.
async function loadPropertyEntries(): Promise<SitemapEntry[]> {
  const client = supabase;
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("properties")
      .select("id, expert_agent_id, department, updated_at")
      .in("status", MARKETABLE_STATUSES)
      .order("updated_at", { ascending: false })
      .limit(5000);
    if (error) {
      console.error("sitemap: property query failed:", error.message);
      return [];
    }

    return ((data ?? []) as SitemapPropertyRow[]).map((row) => ({
      url: absoluteUrl(buildPropertyHref(row.department, row.expert_agent_id ?? row.id)),
      lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("sitemap: property query unavailable:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: SitemapEntry[] = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const areaGuideEntries: SitemapEntry[] = areaGuides.map((area) => ({
    url: absoluteUrl(`/area-guides/${area.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const posts = getAllPosts();
  const blogEntries: SitemapEntry[] = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogCategoryEntries: SitemapEntry[] = blogCategories
    .filter((category) => posts.some((post) => post.category === category.slug))
    .map((category) => ({
      url: absoluteUrl(`/blog/category/${category.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

  const propertyEntries = await loadPropertyEntries();

  return [
    ...staticEntries,
    ...areaGuideEntries,
    ...blogEntries,
    ...blogCategoryEntries,
    ...propertyEntries,
  ];
}
