// Adapts DbProperty rows (Expert Agent feed → Supabase) to the shape
// PropertyCard and the listing pages render.

import type { DbProperty } from "./supabase";

export function buildPropertyHref(
  department: DbProperty["department"],
  id: string
): string {
  return `/${department}/properties/${encodeURIComponent(id)}`;
}

export interface PropertyLeadActions {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

export function buildPropertyLeadActions(
  department: DbProperty["department"],
  id: string
): PropertyLeadActions {
  const viewingSubject = encodeURIComponent(`Viewing request — ${id}`);

  return {
    primaryHref: `mailto:info@bancproperty.com?subject=${viewingSubject}`,
    primaryLabel: "Request a viewing",
    secondaryHref: "tel:01707877781",
    secondaryLabel: department === "lettings" ? "Call the lettings team" : "Call the sales team",
  };
}

interface PropertyShareInput {
  department: DbProperty["department"];
  id: string;
  title: string;
  address: string;
  price: string;
  origin: string;
}

export interface PropertyShareData {
  title: string;
  text: string;
  url: string;
}

export function buildPropertyShareData({
  department,
  id,
  title,
  address,
  price,
  origin,
}: PropertyShareInput): PropertyShareData {
  return {
    title: `${title} | Banc Property Group`,
    text: `${title} — ${price} · ${address}`,
    url: new URL(buildPropertyHref(department, id), origin).toString(),
  };
}

interface ShareCapabilities {
  nativeShare?: (data: PropertyShareData) => Promise<void>;
  copyText?: (value: string) => Promise<void>;
}

export type PropertyShareResult = "shared" | "copied" | "unavailable";

export async function shareProperty(
  data: PropertyShareData,
  capabilities: ShareCapabilities
): Promise<PropertyShareResult> {
  if (capabilities.nativeShare) {
    try {
      await capabilities.nativeShare(data);
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw error;
    }
  }

  if (capabilities.copyText) {
    await capabilities.copyText(data.url);
    return "copied";
  }

  return "unavailable";
}

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

// ---- Search feature flags -------------------------------------------------
// The advanced-search feature filters (garden, parking, …) are booleans; the
// feed gives free-text bullets. Derive flags from real bullet wording.
export interface FeatureFlags {
  garden: boolean;
  parking: boolean;
  garage: boolean;
  conservatory: boolean;
  fireplace: boolean;
  periodFeatures: boolean;
  newBuild: boolean;
  chainFree: boolean;
  virtualTour: boolean;
  videoTour: boolean;
}

export function deriveFeatureFlags(features: string[], virtualTourUrl: string): FeatureFlags {
  const text = features.join(" | ").toLowerCase();
  return {
    garden: /garden|outside space|patio|terrace/.test(text),
    parking: /parking|driveway|off street|off-street/.test(text),
    garage: /garage/.test(text),
    conservatory: /conservator/.test(text),
    fireplace: /fireplace|log burner|wood burner/.test(text),
    periodFeatures: /period|character|listed/.test(text),
    newBuild: /new build|newly built|new home/.test(text),
    chainFree: /chain free|no chain|no onward chain/.test(text),
    virtualTour: virtualTourUrl.trim() !== "",
    videoTour: /video tour/.test(text),
  };
}

// ---- Detail page view -----------------------------------------------------
export interface LivePropertyDetail extends PropertyCardData {
  postcode: string;
  priceQualifier?: string;
  receptions: number;
  description: string;
  features: string[];
  featureFlags: FeatureFlags;
  tenure: string;
  brochureUrl: string;
  virtualTourUrl: string;
  addedDate: string;
  rooms: DbProperty["rooms"];
  latitude?: number;
  longitude?: number;
  epcRating?: string;
  epcImageUrl: string;
  gallery: Array<{ id: string; url: string; alt: string; isPrimary: boolean }>;
  floorplans: Array<{ id: string; url: string; title: string }>;
}

export function dbToDetail(p: DbProperty): LivePropertyDetail {
  const card = dbToCard(p);
  const ref = card.id;
  return {
    ...card,
    postcode: p.postcode,
    priceQualifier: p.price_qualifier,
    receptions: p.receptions,
    description: p.description,
    features: p.features,
    featureFlags: deriveFeatureFlags(p.features, p.virtual_tour_url),
    tenure: p.tenure,
    brochureUrl: p.brochure_url,
    virtualTourUrl: p.virtual_tour_url,
    addedDate: p.created_at,
    rooms: p.rooms,
    latitude: p.latitude,
    longitude: p.longitude,
    epcRating: p.epc_rating,
    epcImageUrl: p.epc_image_url,
    gallery: p.images.map((url, i) => ({
      id: `${ref}-${i}`,
      url,
      alt: i === 0 ? `${p.title} — main photo` : `${p.title} — photo ${i + 1}`,
      isPrimary: i === 0,
    })),
    floorplans: p.floorplans.map((url, i) => ({
      id: `${ref}-fp-${i}`,
      url,
      title: p.floorplans.length > 1 ? `Floorplan ${i + 1}` : "Floorplan",
    })),
  };
}
