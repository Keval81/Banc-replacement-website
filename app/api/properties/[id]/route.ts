import { NextResponse } from "next/server";
import { loadPropertyDetail } from "@/lib/property-detail-server";

// Single property by Expert Agent reference, plus similar listings
// (same department, nearest price, still marketable).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await loadPropertyDetail(id);

  if (result.status === "unavailable") {
    return NextResponse.json({ property: null }, { status: 503 });
  }
  if (result.status === "error") {
    console.error("property api:", result.message);
    return NextResponse.json({ property: null }, { status: 500 });
  }
  if (result.status === "not_found") {
    return NextResponse.json({ property: null }, { status: 404 });
  }

  return NextResponse.json(result.data, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
  });
}
