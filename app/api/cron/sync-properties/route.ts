import { NextResponse } from "next/server";
import { syncProperties } from "@/lib/expert-agent";

// Vercel Cron: runs every 15 minutes
// Add to vercel.json: { "crons": [{ "path": "/api/cron/sync-properties", "schedule": "*/15 * * * *" }] }

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncProperties();
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Property sync failed:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 }
    );
  }
}
