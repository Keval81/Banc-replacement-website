import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole, PropertyType } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      password,
      transactionType,
      propertyTypes,
      minBeds,
      maxBeds,
      minPrice,
      maxPrice,
      locations,
      timeline,
      notes,
    } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with requirements in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          phone,
          password: hashedPassword,
          role: UserRole.applicant,
        },
      });

      // Create property requirements if any data provided
      if (
        transactionType ||
        propertyTypes?.length > 0 ||
        locations?.length > 0
      ) {
        await tx.propertyRequirements.create({
          data: {
            userId: newUser.id,
            transactionType: transactionType || "buy",
            propertyTypes: propertyTypes?.length
              ? propertyTypes.map((t: string) => t.toUpperCase() as PropertyType)
              : [],
            minBeds: minBeds ? parseInt(minBeds) : null,
            maxBeds: maxBeds ? parseInt(maxBeds) : null,
            minPrice: minPrice ? parseInt(minPrice) : null,
            maxPrice: maxPrice ? parseInt(maxPrice) : null,
            preferredLocations: locations || [],
            timeline: timeline || null,
            notes: notes || null,
            mustHaveFeatures: [],
            niceToHaveFeatures: [],
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}