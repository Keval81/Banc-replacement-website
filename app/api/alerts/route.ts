import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { alertsStore } from "./store";
import { createAlertSchema } from "./schema";

// GET /api/alerts - List the signed-in user's alerts
export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = alertsStore.filter((alert) => alert.userId === userId);
  return NextResponse.json({ alerts });
}

// POST /api/alerts - Create a new alert for the signed-in user
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const ownAlerts = alertsStore.filter((alert) => alert.userId === userId);
  const newAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: userId,
    name: parsed.data.name || `Alert ${ownAlerts.length + 1}`,
    criteria: parsed.data.criteria ?? {},
    frequency: parsed.data.frequency ?? "daily",
    isActive: true,
    createdAt: new Date().toISOString(),
    lastSent: undefined,
    matchCount: 0,
  };

  alertsStore.push(newAlert);

  return NextResponse.json({ alert: newAlert }, { status: 201 });
}
