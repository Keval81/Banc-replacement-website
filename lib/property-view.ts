// Adapts DbProperty rows (Expert Agent feed → Supabase) to the shape
// PropertyCard and the listing pages render.

import type { DbProperty } from "./supabase";
import {
  deriveSearchFeatures,
  normalizePropertyType,
  type SearchPropertyType,
} from "./crm/property-source.ts";
import { getSafePropertyImageUrl } from "./property-detail-view.ts";

export function buildPropertyHref(
  department: DbProperty["department"],
  id: string
): string {
  return `/${department}/properties/${encodeURIComponent(id)}`;
}

export function getCanonicalPropertyHref(
  requestedDepartment: DbProperty["department"],
  propertyDepartment: DbProperty["department"],
  id: string
): string | null {
  return requestedDepartment === propertyDepartment
    ? null
    : buildPropertyHref(propertyDepartment, id);
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
  const departmentLabel = department === "lettings" ? "Lettings" : "Sales";
  const canonicalUrl = new URL(
    buildPropertyHref(department, id),
    "https://bancproperty.com"
  ).toString();
  const viewingSubject = encodeURIComponent(
    `Viewing request — ${departmentLabel} — ${id}`
  );
  const viewingBody = encodeURIComponent(
    [
      "Hello Banc Property Group,",
      "",
      `I would like to arrange a viewing for this ${department} property.`,
      "",
      `Department: ${departmentLabel}`,
      `Reference: ${id}`,
      `Property: ${canonicalUrl}`,
    ].join("\n")
  );

  return {
    primaryHref: `mailto:info@bancproperty.com?subject=${viewingSubject}&body=${viewingBody}`,
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
  coordinates?: {
    latitude: number;
    longitude: number;
  };
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
export function categorisePropertyType(raw: string): SearchPropertyType {
  return normalizePropertyType(raw);
}

export function dbToCard(p: DbProperty): PropertyCardData {
  const pounds = `£${Math.round(p.price).toLocaleString("en-GB")}`;
  const tag = TAG_BY_STATUS[p.status];
  const images = p.images
    .map(getSafePropertyImageUrl)
    .filter((url): url is string => url !== null);
  const hasValidCoordinates =
    typeof p.latitude === "number" &&
    Number.isFinite(p.latitude) &&
    p.latitude >= -90 &&
    p.latitude <= 90 &&
    typeof p.longitude === "number" &&
    Number.isFinite(p.longitude) &&
    p.longitude >= -180 &&
    p.longitude <= 180;
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
    images,
    summary: (p.description.split("\n\n")[0] ?? "").trim(),
    propertyType: categorisePropertyType(p.property_type),
    department: p.department,
    status: p.status,
    ...(hasValidCoordinates
      ? {
          coordinates: {
            latitude: p.latitude as number,
            longitude: p.longitude as number,
          },
        }
      : {}),
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
  const searchFeatures = deriveSearchFeatures(features, virtualTourUrl);
  return {
    garden: searchFeatures.includes("garden"),
    parking: searchFeatures.includes("parking"),
    garage: searchFeatures.includes("garage"),
    conservatory: searchFeatures.includes("conservatory"),
    fireplace: searchFeatures.includes("fireplace"),
    periodFeatures: searchFeatures.includes("period_features"),
    newBuild: searchFeatures.includes("new_home"),
    chainFree: searchFeatures.includes("chain_free"),
    virtualTour: searchFeatures.includes("virtual_tour"),
    videoTour: searchFeatures.includes("video_tour"),
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
  const floorplanUrls = p.floorplans
    .map(getSafePropertyImageUrl)
    .filter((url): url is string => url !== null);
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
    gallery: card.images.map((url, i) => ({
      id: `${ref}-${i}`,
      url,
      alt: i === 0 ? `${p.title} — main photo` : `${p.title} — photo ${i + 1}`,
      isPrimary: i === 0,
    })),
    floorplans: floorplanUrls.map((url, i) => ({
      id: `${ref}-fp-${i}`,
      url,
      title: floorplanUrls.length > 1 ? `Floorplan ${i + 1}` : "Floorplan",
    })),
  };
}
