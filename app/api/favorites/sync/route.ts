import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/favorites/sync - Sync anonymous favorites on login
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { favorites } = body;

    if (!Array.isArray(favorites) || favorites.length === 0) {
      return NextResponse.json({ success: true, synced: 0 });
    }

    let syncedCount = 0;
    const errors: string[] = [];

    for (const fav of favorites) {
      try {
        // Check if already exists
        const existing = await prisma.favorite.findUnique({
          where: {
            userId_propertyId: {
              userId: session.user.id,
              propertyId: fav.propertyId,
            },
          },
        });

        if (!existing) {
          await prisma.favorite.create({
            data: {
              userId: session.user.id,
              propertyId: fav.propertyId,
              propertyTitle: fav.propertyTitle,
              propertyPrice: fav.propertyPrice,
              propertyImage: fav.propertyImage,
              propertyAddress: fav.propertyAddress,
            },
          });
          syncedCount++;
        }
      } catch (err) {
        errors.push(fav.propertyId);
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error syncing favorites:", error);
    return NextResponse.json(
      { error: "Failed to sync favorites" },
      { status: 500 }
    );
  }
}
