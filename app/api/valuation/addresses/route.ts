import { NextRequest, NextResponse } from "next/server";
import { fetchPostcodeHistory } from "@/lib/valuation/register";
import { addressesFromHistory } from "@/lib/valuation/instant";
import { createPublicFormRateLimiter, rateLimitResponse } from "@/lib/public-form-guard";

export const runtime = "nodejs";

const limiter = createPublicFormRateLimiter();
const FULL_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/;

/** Addresses in a postcode that have a sale on record, for the valuation form's "choose your address" list. */
export async function GET(request: NextRequest) {
  const limited = rateLimitResponse(limiter, request);
  if (limited) return limited;
  const compact = (request.nextUrl.searchParams.get("postcode") ?? "").replace(/\s+/g, "").toUpperCase();
  if (!FULL_POSTCODE.test(compact)) {
    return NextResponse.json({ addresses: [], error: "Enter a full postcode, like EN6 4HU" }, { status: 400 });
  }
  const postcode = `${compact.slice(0, -3)} ${compact.slice(-3)}`;
  try {
    const sales = await fetchPostcodeHistory(postcode);
    return NextResponse.json(
      { addresses: addressesFromHistory(sales) },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (error) {
    console.error(`[Valuation addresses] lookup for ${postcode} failed:`, error);
    return NextResponse.json({ addresses: [] }, { status: 502 });
  }
}
