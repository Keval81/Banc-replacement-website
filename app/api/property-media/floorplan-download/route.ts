import { NextResponse } from "next/server";

import {
  downloadFloorplanFromPinnedAddress,
  FloorplanDownloadError,
  getFloorplanDownloadFilename,
  getSafeFloorplanDownloadUrl,
  InMemoryFloorplanRateLimiter,
  resolvePublicFloorplanAddress,
} from "@/lib/floorplan-download";

export const runtime = "nodejs";

const FLOORPLAN_RATE_LIMIT = 12;
const FLOORPLAN_RATE_WINDOW_MS = 60_000;

// Best effort per server instance. Serverless instances do not share this map,
// so strict host, DNS, timeout and byte controls remain the primary boundary.
const rateLimiter = new InMemoryFloorplanRateLimiter(
  FLOORPLAN_RATE_LIMIT,
  FLOORPLAN_RATE_WINDOW_MS
);

export async function GET(request: Request): Promise<Response> {
  const rateLimit = rateLimiter.consume(getClientKey(request.headers));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many floorplan download requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": String(FLOORPLAN_RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const source = new URL(request.url).searchParams.get("url");
  const floorplanUrl = source ? getSafeFloorplanDownloadUrl(source) : null;

  if (!floorplanUrl) {
    return NextResponse.json({ error: "A valid floorplan URL is required." }, { status: 400 });
  }

  try {
    const resolvedAddress = await resolvePublicFloorplanAddress(floorplanUrl.hostname);
    const upstream = await downloadFloorplanFromPinnedAddress(
      floorplanUrl,
      resolvedAddress
    );
    const filename = getFloorplanDownloadFilename(floorplanUrl, upstream.contentType);

    return new Response(new Uint8Array(upstream.body), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(upstream.body.byteLength),
        "Content-Type": upstream.contentType,
        "X-Content-Type-Options": "nosniff",
        "X-RateLimit-Limit": String(FLOORPLAN_RATE_LIMIT),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    if (error instanceof FloorplanDownloadError) {
      if (error.code === "invalid_content_type") {
        return NextResponse.json(
          { error: "Floorplan media must be an image or PDF." },
          { status: 415 }
        );
      }
      if (error.code === "too_large") {
        return NextResponse.json({ error: "Floorplan media is too large." }, { status: 413 });
      }
      if (error.code === "timeout") {
        return NextResponse.json(
          { error: "Floorplan download timed out." },
          { status: 504 }
        );
      }
      if (error.code === "redirect") {
        return NextResponse.json(
          { error: "Floorplan redirects are not permitted." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ error: "Floorplan download is unavailable." }, { status: 502 });
  }
}

function getClientKey(headers: Headers): string {
  const forwardedFor = headers.get("x-vercel-forwarded-for") ?? headers.get("x-forwarded-for");
  const firstForwardedAddress = forwardedFor?.split(",", 1)[0]?.trim();
  return (firstForwardedAddress || headers.get("x-real-ip") || "unknown").slice(0, 128);
}
