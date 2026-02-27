import { NextRequest, NextResponse } from "next/server";
import { alertsStore } from "../store";

// GET /api/alerts/[id] - Get a specific alert
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const alert = alertsStore.find((a) => a.id === id);

  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  return NextResponse.json({ alert });
}

// PATCH /api/alerts/[id] - Update an alert
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const alertIndex = alertsStore.findIndex((a) => a.id === id);

  if (alertIndex === -1) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    
    alertsStore[alertIndex] = {
      ...alertsStore[alertIndex],
      ...body,
      id, // Ensure ID doesn't change
    };

    return NextResponse.json({ alert: alertsStore[alertIndex] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}

// DELETE /api/alerts/[id] - Delete an alert
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const alertIndex = alertsStore.findIndex((a) => a.id === id);

  if (alertIndex === -1) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  alertsStore.splice(alertIndex, 1);
  return NextResponse.json({ message: "Alert deleted" });
}
