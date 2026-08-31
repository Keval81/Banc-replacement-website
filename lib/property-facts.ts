import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { POSTGRES_SIGNED_INTEGER_MAX } from "./property-search/query.ts";
import type { DbProperty } from "./supabase.ts";

export interface PropertyFacts {
  id: string;
  title: string;
  address: string;
  department: "sales" | "lettings";
  status: "for_sale" | "under_offer" | "to_let" | "let_agreed";
  price: number;
  priceDisplay: string;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  propertyType: string;
  tenure: string | null;
  epc: string | null;
  sqft: number | null;
  features: string[];
  summary: string;
}

const propertyIdSchema = z.string().trim().min(1).max(64);

export const propertyFactsSchema = z
  .object({
    id: propertyIdSchema,
    title: z.string().trim().min(1).max(240),
    address: z.string().trim().min(1).max(240),
    department: z.enum(["sales", "lettings"]),
    status: z.enum(["for_sale", "under_offer", "to_let", "let_agreed"]),
    price: z.number().finite().nonnegative(),
    priceDisplay: z.string().trim().min(1).max(120),
    bedrooms: z.number().int().min(0).max(POSTGRES_SIGNED_INTEGER_MAX),
    bathrooms: z.number().int().min(0).max(POSTGRES_SIGNED_INTEGER_MAX),
    receptions: z.number().int().min(0).max(POSTGRES_SIGNED_INTEGER_MAX),
    propertyType: z.string().trim().min(1).max(80),
    tenure: z.string().trim().min(1).max(80).nullable(),
    epc: z.string().trim().min(1).max(16).nullable(),
    sqft: z.number().finite().positive().nullable(),
    features: z.array(z.string().trim().min(1).max(64)).transform((features) => [...features]),
    summary: z.string().trim().min(1).max(2_000),
  })
  .strict();

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
  return Boolean(
    row.is_active &&
      typeof row.expert_agent_id === "string" &&
      row.expert_agent_id.trim().length > 0 &&
      MARKETABLE_PROPERTY_STATUSES.includes(
        row.status as (typeof MARKETABLE_PROPERTY_STATUSES)[number],
      ),
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
  signal?: AbortSignal,
) => Promise<PropertyFacts[]>;

export function createPropertyFactLookup(
  client: SupabaseClient,
): PropertyFactLookup {
  return async (ids, signal) => {
    signal?.throwIfAborted();
    if (ids.length === 0) {
      return [];
    }

    const factsQuery = client
      .from("properties")
      .select("*")
      .eq("is_active", true)
      .in("status", [...MARKETABLE_PROPERTY_STATUSES])
      .in("expert_agent_id", [...ids]);
    const { data, error } = await (signal === undefined
      ? factsQuery
      : factsQuery.abortSignal(signal));

    if (error) {
      throw new Error("Property fact lookup failed");
    }
    if (!Array.isArray(data)) {
      throw new Error("Property fact lookup returned an invalid result");
    }

    const rowsById = new Map<string, DbProperty>();
    const ambiguousIds = new Set<string>();
    for (const row of data) {
      if (
        typeof row !== "object" ||
        row === null ||
        Array.isArray(row) ||
        !isMarketableProperty(row as DbProperty)
      ) {
        continue;
      }
      const publicId = row.expert_agent_id;
      if (ambiguousIds.has(publicId)) {
        continue;
      }
      if (rowsById.has(publicId)) {
        rowsById.delete(publicId);
        ambiguousIds.add(publicId);
        continue;
      }
      rowsById.set(publicId, row as DbProperty);
    }

    return ids.flatMap((id) => {
      const row = rowsById.get(id);
      return row === undefined ? [] : [mapPropertyFacts(row)];
    });
  };
}
