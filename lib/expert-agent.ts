// DEPRECATED — this stub guessed a JSON REST API. The real Expert Agent
// integration (spec v1.3) is an FTP-dropped XML feed: see
// lib/expert-agent-feed.ts + scripts/sync-expert-agent.ts. This file stays
// only so /api/cron/sync-properties keeps no-op'ing until it is retired.
// Expert Agent CRM API Integration
// Syncs live property listings from Expert Agent to Supabase
// TODO: Add credentials to .env.local:
//   EXPERT_AGENT_API_URL=your_api_url
//   EXPERT_AGENT_API_KEY=your_api_key

import { supabaseAdmin, type DbProperty } from "./supabase";

const API_URL = process.env.EXPERT_AGENT_API_URL ?? "";
const API_KEY = process.env.EXPERT_AGENT_API_KEY ?? "";

interface ExpertAgentProperty {
  propertyId: string;
  address: {
    line1: string;
    line2?: string;
    town: string;
    county: string;
    postcode: string;
  };
  price: number;
  priceQualifier?: string;
  status: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  floorArea?: number;
  description: string;
  features: string[];
  images: Array<{ url: string; caption?: string }>;
  epc?: { rating: string };
  coordinates?: { latitude: number; longitude: number };
  updatedAt: string;
}

interface ExpertAgentResponse {
  success: boolean;
  properties: ExpertAgentProperty[];
  total: number;
  page: number;
  pageSize: number;
}

function isConfigured(): boolean {
  return Boolean(API_URL && API_KEY);
}

export async function fetchProperties(page = 1, pageSize = 50): Promise<ExpertAgentResponse> {
  if (!isConfigured()) {
    console.warn("Expert Agent API not configured");
    return { success: false, properties: [], total: 0, page: 1, pageSize: 50 };
  }

  const response = await fetch(`${API_URL}/properties?page=${page}&pageSize=${pageSize}`, {
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error(`Expert Agent API error: ${response.status} ${response.statusText}`);
    return { success: false, properties: [], total: 0, page, pageSize };
  }

  return response.json();
}

function mapToDbProperty(ea: ExpertAgentProperty): Omit<DbProperty, "id" | "created_at"> {
  return {
    expert_agent_id: ea.propertyId,
    title: `${ea.bedrooms} Bedroom ${ea.propertyType}`,
    address: [ea.address.line1, ea.address.line2, ea.address.town, ea.address.county]
      .filter(Boolean)
      .join(", "),
    postcode: ea.address.postcode,
    price: ea.price,
    price_qualifier: ea.priceQualifier,
    status: mapStatus(ea.status),
    property_type: ea.propertyType,
    bedrooms: ea.bedrooms,
    bathrooms: ea.bathrooms,
    receptions: ea.receptions,
    sqft: ea.floorArea,
    description: ea.description,
    features: ea.features,
    images: ea.images.map((img) => img.url),
    epc_rating: ea.epc?.rating,
    latitude: ea.coordinates?.latitude,
    longitude: ea.coordinates?.longitude,
    updated_at: ea.updatedAt,
  };
}

function mapStatus(eaStatus: string): DbProperty["status"] {
  const statusMap: Record<string, DbProperty["status"]> = {
    "For Sale": "for_sale",
    "Under Offer": "under_offer",
    "Sold STC": "under_offer",
    "Sold": "sold",
    "Withdrawn": "withdrawn",
  };
  return statusMap[eaStatus] ?? "for_sale";
}

export async function syncProperties(): Promise<{ synced: number; errors: number }> {
  if (!isConfigured() || !supabaseAdmin) {
    console.warn("Expert Agent sync skipped — not configured");
    return { synced: 0, errors: 0 };
  }

  let synced = 0;
  let errors = 0;
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetchProperties(page);

    if (!response.success || response.properties.length === 0) {
      hasMore = false;
      break;
    }

    for (const property of response.properties) {
      try {
        const dbProperty = mapToDbProperty(property);

        const { error } = await supabaseAdmin
          .from("properties")
          .upsert(dbProperty, { onConflict: "expert_agent_id" });

        if (error) {
          console.error(`Failed to upsert property ${property.propertyId}:`, error);
          errors++;
        } else {
          synced++;
        }
      } catch (err) {
        console.error(`Error processing property ${property.propertyId}:`, err);
        errors++;
      }
    }

    hasMore = page * response.pageSize < response.total;
    page++;
  }

  return { synced, errors };
}
