import { NextResponse } from "next/server";

import { RECENTLY_LET_LIMIT, selectRecentlyLet, type RecentlyLetRow } from "@/lib/recently-let";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Public search deliberately excludes let stock, so this reads the table
// directly rather than widening the search statuses.
export async function GET(): Promise<Response> {
  if (!supabaseAdmin) {
    return NextResponse.json({ properties: [] }, { status: 200 });
  }

  const { data, error } = await supabaseAdmin
    .from("properties")
    .select("source_id,title,address,price,bedrooms,bathrooms,images,source_updated_at")
    .eq("is_active", true)
    .eq("department", "lettings")
    .eq("status", "let")
    .order("source_updated_at", { ascending: false })
    .limit(RECENTLY_LET_LIMIT * 3);

  if (error) {
    console.error("recently-let query failed", error.message);
    return NextResponse.json({ properties: [] }, { status: 200 });
  }

  const properties = selectRecentlyLet((data ?? []) as RecentlyLetRow[]);
  return NextResponse.json(
    { properties },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } },
  );
}
