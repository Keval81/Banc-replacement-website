import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { dbToCard, deriveFeatureFlags } from "@/lib/property-view";

// Public listings API — reads via the anon client (RLS: public read).
// /api/properties?department=sales|lettings&status=for_sale&limit=24
export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ properties: [] });
  }

  const url = new URL(request.url);
  const department = url.searchParams.get("department") ?? "sales";
  const status = url.searchParams.get("status");
  const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 400);

  let query = supabase
    .from("properties")
    .select("*")
    .eq("department", department)
    .order("price", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  } else {
    // default: only publicly marketable statuses
    query = query.in(
      "status",
      department === "lettings" ? ["to_let", "let_agreed"] : ["for_sale", "under_offer"]
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("properties api:", error.message);
    return NextResponse.json({ properties: [] }, { status: 500 });
  }

  const properties = (data ?? []).map((row) => ({
    ...dbToCard(row),
    featureFlags: deriveFeatureFlags(row.features, row.virtual_tour_url),
    addedDate: row.created_at,
  }));

  return NextResponse.json(
    { properties },
    { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } }
  );
}
