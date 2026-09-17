import { NextResponse } from "next/server";
import { dispatchPropertySync } from "@/lib/sync-dispatch";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await dispatchPropertySync({
    token: process.env.GITHUB_DISPATCH_TOKEN ?? "",
  });

  if (!result.ok) {
    console.error("Property sync dispatch failed:", result.error);
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 502 },
    );
  }

  return NextResponse.json({
    success: true,
    dispatched: true,
    timestamp: new Date().toISOString(),
  });
}
