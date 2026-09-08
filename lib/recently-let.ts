import { getSafePropertyImageUrl } from "./property-detail-view.ts";
import type { PropertyCardData } from "./property-view.ts";

/** Enough to fill the strip without turning a lettings page into an archive. */
export const RECENTLY_LET_LIMIT = 15;

export interface RecentlyLetRow {
  source_id: string;
  title: string | null;
  address: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  images: string[] | null;
  source_updated_at: string | null;
}

function updatedAtMs(row: RecentlyLetRow): number {
  if (!row.source_updated_at) return Number.NEGATIVE_INFINITY;
  const parsed = Date.parse(row.source_updated_at);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

/**
 * Banc lets far more than it has on the market at any moment — two available
 * against fifty-nine let. The strip shows the recent lettings so the page has
 * something to say. Expert Agent carries no "let agreed" date, so the CRM's own
 * last-updated stamp is the closest honest proxy for recency.
 */
export function selectRecentlyLet(rows: readonly RecentlyLetRow[]): PropertyCardData[] {
  return rows
    .map((row) => ({
      row,
      // Expert Agent serves http with unescaped braces; the same helper the
      // rest of the site uses upgrades and encodes them.
      images: (row.images ?? [])
        .map(getSafePropertyImageUrl)
        .filter((url): url is string => url !== null),
    }))
    .filter(({ images }) => images.length > 0)
    .slice()
    .sort((a, b) => updatedAtMs(b.row) - updatedAtMs(a.row))
    .slice(0, RECENTLY_LET_LIMIT)
    .map(({ row, images }) => ({
      id: row.source_id,
      title: row.title ?? row.address ?? "Let property",
      address: row.address ?? "",
      price: row.price === null ? "Price on application" : `£${row.price.toLocaleString("en-GB")} pcm`,
      priceNum: row.price ?? 0,
      tags: ["Let agreed"],
      stats: { beds: row.bedrooms ?? 0, baths: row.bathrooms ?? 0 },
      images,
      summary: "",
      propertyType: "",
      department: "lettings",
      status: "let_agreed",
    }));
}
