// Adapts DbProperty rows (Expert Agent feed → Supabase) to the shape
// PropertyCard and the listing pages render.

import type { DbProperty } from "./supabase";

export interface PropertyCardData {
  id: string;
  title: string;
  address: string;
  price: string;
  priceNum: number;
  tags: string[];
  stats: { beds: number; baths: number; sqft?: number; epc?: string };
  images: string[];
  summary: string;
  propertyType: string;
  department: DbProperty["department"];
  status: DbProperty["status"];
}

const TAG_BY_STATUS: Partial<Record<DbProperty["status"], string>> = {
  under_offer: "Under Offer",
  sold: "Sold",
  let_agreed: "Let Agreed",
  let: "Let",
};

// Live feed type strings ("Upper Floor Flat Flat", "Detached", "Building
// Plot") folded into the search filter's canonical ids. Order matters:
// bungalow before house, flat before house.
export function categorisePropertyType(raw: string): string {
  const t = raw.toLowerCase();
  if (/maisonette/.test(t)) return "maisonette";
  if (/bungalow/.test(t)) return "bungalow";
  if (/flat|apartment|studio/.test(t)) return "flat";
  if (/plot|\bland\b/.test(t)) return "land";
  if (/commercial|office|retail|shop|hotel/.test(t)) return "commercial";
  return "house";
}

export function dbToCard(p: DbProperty): PropertyCardData {
  const pounds = `£${Math.round(p.price).toLocaleString("en-GB")}`;
  const tag = TAG_BY_STATUS[p.status];
  return {
    id: p.expert_agent_id ?? p.id,
    title: p.title,
    address: p.address,
    price: p.department === "lettings" ? `${pounds} pcm` : pounds,
    priceNum: p.price,
    tags: tag ? [tag] : [],
    stats: {
      beds: p.bedrooms,
      baths: p.bathrooms,
      ...(p.sqft ? { sqft: p.sqft } : {}),
      ...(p.epc_rating ? { epc: p.epc_rating } : {}),
    },
    images: p.images,
    summary: (p.description.split("\n\n")[0] ?? "").trim(),
    propertyType: categorisePropertyType(p.property_type),
    department: p.department,
    status: p.status,
  };
}
