import { NextRequest, NextResponse } from "next/server";
import { alertsStore } from "./store";

// GET /api/alerts - List all alerts for the user
export async function GET() {
  // In production, filter by authenticated user
  // For demo, return all alerts
  return NextResponse.json({ alerts: alertsStore });
}

// POST /api/alerts - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newAlert = {
      id: `alert_${Date.now()}`,
      userId: "user_123", // In production, get from auth session
      name: body.name || `Alert ${alertsStore.length + 1}`,
      criteria: body.criteria || {},
      frequency: body.frequency || "daily",
      isActive: true,
      createdAt: new Date().toISOString(),
      lastSent: undefined,
      matchCount: Math.floor(Math.random() * 20) + 1, // Simulated match count
    };

    alertsStore.push(newAlert);

    return NextResponse.json({ alert: newAlert }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

// DELETE /api/alerts - Clear all alerts (for testing)
export async function DELETE() {
  alertsStore.length = 0;
  return NextResponse.json({ message: "All alerts cleared" });
}
