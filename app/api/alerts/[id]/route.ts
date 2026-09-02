import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { alertsStore } from "../store";
import { updateAlertSchema } from "../schema";

type RouteContext = { params: Promise<{ id: string }> };

async function findOwnAlertIndex(id: string): Promise<
  { status: 401 | 404; index: -1 } | { status: 200; index: number }
> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { status: 401, index: -1 };
  const index = alertsStore.findIndex(
    (alert) => alert.id === id && alert.userId === userId
  );
  return index === -1 ? { status: 404, index: -1 } : { status: 200, index };
}

function errorFor(status: 401 | 404) {
  return NextResponse.json(
    { error: status === 401 ? "Unauthorized" : "Alert not found" },
    { status }
  );
}

// GET /api/alerts/[id] - Get one of the signed-in user's alerts
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const found = await findOwnAlertIndex(id);
  if (found.status !== 200) return errorFor(found.status);

  return NextResponse.json({ alert: alertsStore[found.index] });
}

// PATCH /api/alerts/[id] - Update an alert (whitelisted fields only)
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const found = await findOwnAlertIndex(id);
  if (found.status !== 200) return errorFor(found.status);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const current = alertsStore[found.index];
  const { name, criteria, frequency, isActive } = parsed.data;
  alertsStore[found.index] = {
    ...current,
    ...(name !== undefined ? { name } : {}),
    ...(criteria !== undefined ? { criteria } : {}),
    ...(frequency !== undefined ? { frequency } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  return NextResponse.json({ alert: alertsStore[found.index] });
}

// DELETE /api/alerts/[id] - Delete one of the signed-in user's alerts
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const found = await findOwnAlertIndex(id);
  if (found.status !== 200) return errorFor(found.status);

  alertsStore.splice(found.index, 1);
  return NextResponse.json({ message: "Alert deleted" });
}
