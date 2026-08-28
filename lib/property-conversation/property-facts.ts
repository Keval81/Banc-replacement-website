import {
  propertyFactsSchema,
  type PropertyFacts,
} from "./contracts.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbProperty } from "../supabase.ts";

export const MARKETABLE_PROPERTY_STATUSES = [
  "for_sale",
  "under_offer",
  "to_let",
  "let_agreed",
] as const;

function normalizeOptionalText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function firstParagraph(value: string): string {
  const [paragraph] = value.split(/\n\s*\n/u);
  const summary = paragraph?.trim();
  return summary && summary.length > 0 ? summary : value.trim();
}

export function isMarketableProperty(
  row: DbProperty,
): row is DbProperty & { expert_agent_id: string } {
  return row.is_active &&
    typeof row.expert_agent_id === "string" &&
    row.expert_agent_id.trim().length > 0 &&
    MARKETABLE_PROPERTY_STATUSES.includes(
      row.status as (typeof MARKETABLE_PROPERTY_STATUSES)[number],
    );
}

export function mapPropertyFacts(row: DbProperty): PropertyFacts {
  const expertAgentId = row.expert_agent_id?.trim();
  if (!expertAgentId) {
    throw new Error("Property facts require a public property reference");
  }

  return propertyFactsSchema.parse({
    id: expertAgentId,
    title: row.title,
    address: row.address,
    department: row.department,
    status: row.status,
    price: row.price,
    priceDisplay: row.department === "lettings"
      ? `£${Math.round(row.price).toLocaleString("en-GB")} pcm`
      : `£${Math.round(row.price).toLocaleString("en-GB")}`,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    receptions: row.receptions,
    propertyType: row.search_property_type,
    tenure: normalizeOptionalText(row.search_tenure ?? row.tenure)?.toLowerCase() ??
      null,
    epc: normalizeOptionalText(row.epc_rating),
    sqft: typeof row.sqft === "number" && Number.isFinite(row.sqft) && row.sqft > 0
      ? row.sqft
      : null,
    features: [...row.search_features],
    summary: firstParagraph(row.description),
  });
}

export function resolveActivePropertyReferences(
  activeIds: readonly string[],
  requestedIds: readonly string[],
): string[] | null {
  const activeIdSet = new Set(activeIds);
  if (requestedIds.some((id) => !activeIdSet.has(id))) {
    return null;
  }
  return [...requestedIds];
}

export type PropertyFactLookup = (
  ids: readonly string[],
) => Promise<PropertyFacts[]>;

export function createPropertyFactLookup(
  client: SupabaseClient,
): PropertyFactLookup {
  return async (ids) => {
    if (ids.length === 0) {
      return [];
    }

    const { data, error } = await client
      .from("properties")
      .select("*")
      .eq("is_active", true)
      .in("status", [...MARKETABLE_PROPERTY_STATUSES])
      .in("expert_agent_id", [...ids]);

    if (error) {
      throw new Error("Property fact lookup failed");
    }
    if (!Array.isArray(data)) {
      throw new Error("Property fact lookup returned an invalid result");
    }

    const rowsById = new Map<string, DbProperty>();
    for (const row of data) {
      if (
        typeof row !== "object" ||
        row === null ||
        Array.isArray(row) ||
        !isMarketableProperty(row as DbProperty)
      ) {
        continue;
      }
      rowsById.set(row.expert_agent_id, row as DbProperty);
    }

    return ids.flatMap((id) => {
      const row = rowsById.get(id);
      return row === undefined ? [] : [mapPropertyFacts(row)];
    });
  };
}
