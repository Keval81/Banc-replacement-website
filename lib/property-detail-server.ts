import "server-only";

import { supabase, type DbProperty } from "./supabase";
import { findPropertyDetailRow } from "./property-detail-identity";
import {
  dbToCard,
  dbToDetail,
  type LivePropertyDetail,
  type PropertyCardData,
} from "./property-view";

export interface PropertyDetailPayload {
  property: LivePropertyDetail;
  similar: PropertyCardData[];
}

export type PropertyDetailLoadResult =
  | { status: "ok"; data: PropertyDetailPayload }
  | { status: "not_found" }
  | { status: "unavailable" }
  | { status: "error"; message: string };

export function getMarketableStatuses(
  department: DbProperty["department"],
): DbProperty["status"][] {
  return department === "lettings" ? ["to_let", "let_agreed"] : ["for_sale", "under_offer"];
}

export function isMarketable(property: Pick<DbProperty, "department" | "status">): boolean {
  return getMarketableStatuses(property.department).includes(property.status);
}

// Single property by Expert Agent reference (falling back to the row id),
// plus similar listings: same department, nearest price, still marketable.
// Shared by the property detail pages and /api/properties/[id].
export async function loadPropertyDetail(id: string): Promise<PropertyDetailLoadResult> {
  const client = supabase;
  if (!client) return { status: "unavailable" };

  const { data, error } = await findPropertyDetailRow(id, async (column, propertyId) => {
    const result = await client
      .from("properties")
      .select("*")
      .eq(column, propertyId)
      .maybeSingle();
    return {
      data: result.data as DbProperty | null,
      error: result.error,
    };
  });

  if (error) return { status: "error", message: error.message };
  if (!data) return { status: "not_found" };

  const { data: similarRows } = await client
    .from("properties")
    .select("*")
    .eq("department", data.department)
    .in("status", getMarketableStatuses(data.department))
    .neq("expert_agent_id", id)
    .gte("price", data.price * 0.7)
    .lte("price", data.price * 1.3)
    .limit(3);

  return {
    status: "ok",
    data: {
      property: dbToDetail(data),
      similar: ((similarRows ?? []) as DbProperty[]).map(dbToCard),
    },
  };
}
