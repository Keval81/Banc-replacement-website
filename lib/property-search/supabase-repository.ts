import type { SupabaseClient } from "@supabase/supabase-js";

import type { CrmSourceSystem } from "../crm/property-source.ts";
import type { DbProperty } from "../supabase.ts";
import { POSTGRES_SIGNED_INTEGER_MAX } from "./query.ts";
import type {
  PropertySearchQuery,
  PropertySearchRepository,
  PropertySearchRepositoryResult,
} from "./types.ts";

interface SearchRpcRow {
  property: DbProperty | null;
  total: number;
}

function normalizeCount(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  }
  if (typeof value === "bigint") {
    return value >= BigInt(0) && value <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(value)
      : null;
  }
  if (typeof value !== "string" || !/^(0|[1-9]\d*)$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseSearchRows(data: unknown): SearchRpcRow[] {
  if (!Array.isArray(data)) {
    throw new Error("Property search returned an invalid result");
  }

  return data.map((item) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("Property search returned an invalid result");
    }
    const record = item as Record<string, unknown>;
    const total = normalizeCount(record.total_count);
    const property = record.property;
    if (
      total === null ||
      (property !== null && (typeof property !== "object" || Array.isArray(property)))
    ) {
      throw new Error("Property search returned an invalid result");
    }
    return { property: property as DbProperty | null, total };
  });
}

function getConsistentTotal(rows: SearchRpcRow[]): number {
  if (rows.length === 0) return 0;
  const total = rows[0].total;
  if (rows.some((row) => row.total !== total)) {
    throw new Error("Property search returned an invalid result");
  }
  return total;
}

function validatePageShape(
  rpcRows: SearchRpcRow[],
  total: number,
  offset: number,
  pageSize: number,
): DbProperty[] {
  const expectedPropertyCount = Math.min(
    pageSize,
    Math.max(total - offset, 0),
  );

  if (expectedPropertyCount === 0) {
    if (rpcRows.length !== 1 || rpcRows[0].property !== null) {
      throw new Error("Property search returned an invalid result");
    }
    return [];
  }

  if (
    rpcRows.length !== expectedPropertyCount ||
    rpcRows.some((row) => row.property === null)
  ) {
    throw new Error("Property search returned an invalid result");
  }

  return rpcRows.map((row) => row.property as DbProperty);
}

export class SupabasePropertySearchRepository
  implements PropertySearchRepository
{
  private readonly client: SupabaseClient;
  private readonly sourceSystem: CrmSourceSystem;

  constructor(
    client: SupabaseClient,
    sourceSystem: CrmSourceSystem = "expert_agent",
  ) {
    this.client = client;
    this.sourceSystem = sourceSystem;
  }

  async search(
    query: PropertySearchQuery,
    signal?: AbortSignal,
  ): Promise<PropertySearchRepositoryResult> {
    signal?.throwIfAborted();
    const offset = (query.page - 1) * query.pageSize;
    if (
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      offset > POSTGRES_SIGNED_INTEGER_MAX
    ) {
      throw new Error("Property search query is outside supported pagination bounds");
    }

    const rpcQuery = this.client.rpc("search_properties", {
      p_department: query.department,
      p_location: query.location ?? null,
      p_min_price: query.minPrice ?? null,
      p_max_price: query.maxPrice ?? null,
      p_min_bedrooms: query.minBedrooms ?? null,
      p_max_bedrooms: query.maxBedrooms ?? null,
      p_min_bathrooms: query.minBathrooms ?? null,
      p_property_types: query.propertyTypes,
      p_tenures: query.tenures,
      p_features: query.features,
      p_statuses: query.statuses,
      p_sort: query.sort,
      p_limit: query.pageSize,
      p_offset: offset,
    });
    const { data, error } = await (signal === undefined
      ? rpcQuery
      : rpcQuery.abortSignal(signal));

    if (error) {
      throw new Error("Property search query failed");
    }

    const rpcRows = parseSearchRows(data);
    const total = getConsistentTotal(rpcRows);
    const rows = validatePageShape(rpcRows, total, offset, query.pageSize);
    const freshnessBuilder = this.client
      .from("crm_sync_runs")
      .select("finished_at")
      .eq("source_system", this.sourceSystem)
      .eq("status", "success")
      .order("finished_at", { ascending: false })
      .limit(1);
    const freshnessQuery = await (signal === undefined
      ? freshnessBuilder
      : freshnessBuilder.abortSignal(signal)).maybeSingle();

    if (freshnessQuery.error) {
      throw new Error("Property search freshness lookup failed");
    }

    const freshness = freshnessQuery.data as { finished_at?: unknown } | null;
    let lastSyncedAt: string | null = null;
    if (freshness !== null) {
      if (typeof freshness.finished_at !== "string") {
        throw new Error("Property search freshness lookup returned an invalid result");
      }
      lastSyncedAt = freshness.finished_at;
    }

    return {
      rows,
      total,
      lastSyncedAt,
    };
  }
}
