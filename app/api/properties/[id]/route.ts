import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { dbToDetail, dbToCard } from "@/lib/property-view";

// Single property by Expert Agent reference, plus similar listings
// (same department, nearest price, still marketable).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!supabase) return NextResponse.json({ property: null }, { status: 503 });

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("expert_agent_id", id)
    .maybeSingle();

  if (error) {
    console.error("property api:", error.message);
    return NextResponse.json({ property: null }, { status: 500 });
  }
  if (!data) return NextResponse.json({ property: null }, { status: 404 });

  const marketable =
    data.department === "lettings" ? ["to_let", "let_agreed"] : ["for_sale", "under_offer"];
  const { data: similarRows } = await supabase
    .from("properties")
    .select("*")
    .eq("department", data.department)
    .in("status", marketable)
    .neq("expert_agent_id", id)
    .gte("price", data.price * 0.7)
    .lte("price", data.price * 1.3)
    .limit(3);

  return NextResponse.json(
    {
      property: dbToDetail(data),
      similar: (similarRows ?? []).map(dbToCard),
    },
    { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } }
  );
}
