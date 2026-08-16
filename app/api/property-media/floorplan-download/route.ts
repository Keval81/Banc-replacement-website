import { NextResponse } from "next/server";

import {
  getFloorplanDownloadFilename,
  getSafeFloorplanDownloadUrl,
  isAllowedFloorplanContentType,
} from "@/lib/floorplan-download";

export async function GET(request: Request): Promise<Response> {
  const source = new URL(request.url).searchParams.get("url");
  const floorplanUrl = source ? getSafeFloorplanDownloadUrl(source) : null;

  if (!floorplanUrl) {
    return NextResponse.json({ error: "A valid floorplan URL is required." }, { status: 400 });
  }

  try {
    const upstream = await fetch(floorplanUrl, {
      headers: { Accept: "application/pdf,image/*" },
      redirect: "manual",
    });

    if (upstream.status >= 300 && upstream.status < 400) {
      return NextResponse.json({ error: "Floorplan redirects are not permitted." }, { status: 502 });
    }

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Floorplan download is unavailable." }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type");
    if (!isAllowedFloorplanContentType(contentType)) {
      return NextResponse.json({ error: "Floorplan media must be an image or PDF." }, { status: 415 });
    }

    const filename = getFloorplanDownloadFilename(floorplanUrl, contentType);

    return new Response(upstream.body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Floorplan download is unavailable." }, { status: 502 });
  }
}
