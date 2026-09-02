import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAuthConfigured } from "@/lib/auth-config";
import {
  createPublicFormRateLimiter,
  rateLimitResponse,
} from "@/lib/public-form-guard";

export const runtime = "nodejs";

const limiter = createPublicFormRateLimiter();

// Mirrors the Prisma enums as string literals so this route type-checks
// without a generated client.
const PROPERTY_TYPES = [
  "HOUSE",
  "APARTMENT",
  "BUNGALOW",
  "MAISONETTE",
  "COTTAGE",
  "TOWNHOUSE",
  "PENTHOUSE",
  "STUDIO",
  "OTHER",
] as const;
type PropertyTypeValue = (typeof PROPERTY_TYPES)[number];

const TRANSACTION_TYPES = ["buy", "rent"] as const;

// Accept common UI aliases; anything unknown maps to OTHER.
const PROPERTY_TYPE_ALIASES: Record<string, PropertyTypeValue> = {
  house: "HOUSE",
  houses: "HOUSE",
  detached: "HOUSE",
  "semi-detached": "HOUSE",
  terraced: "HOUSE",
  flat: "APARTMENT",
  flats: "APARTMENT",
  apartment: "APARTMENT",
  apartments: "APARTMENT",
  bungalow: "BUNGALOW",
  maisonette: "MAISONETTE",
  cottage: "COTTAGE",
  townhouse: "TOWNHOUSE",
  penthouse: "PENTHOUSE",
  studio: "STUDIO",
  other: "OTHER",
};

function toPropertyType(value: string): PropertyTypeValue {
  const upper = value.trim().toUpperCase();
  if ((PROPERTY_TYPES as readonly string[]).includes(upper)) {
    return upper as PropertyTypeValue;
  }
  return PROPERTY_TYPE_ALIASES[value.trim().toLowerCase()] ?? "OTHER";
}

const optionalInt = z
  .union([z.number(), z.string().trim().regex(/^\d{1,9}$/)])
  .transform((v) => (typeof v === "number" ? Math.trunc(v) : Number.parseInt(v, 10)))
  .pipe(z.number().int().nonnegative().max(999_999_999))
  .optional()
  .nullable();

const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional(),
  password: z.string().min(8).max(200),
  transactionType: z.enum(TRANSACTION_TYPES).optional(),
  propertyTypes: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  minBeds: optionalInt,
  maxBeds: optionalInt,
  minPrice: optionalInt,
  maxPrice: optionalInt,
  locations: z.array(z.string().trim().min(1).max(120)).max(10).optional(),
  timeline: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function POST(request: Request) {
  if (!isAuthConfigured) {
    return NextResponse.json(
      { error: "Accounts are not available yet" },
      { status: 503 }
    );
  }

  const limited = rateLimitResponse(limiter, request);
  if (limited) return limited;

  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      name,
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
    } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // Generic message so the endpoint cannot be used to enumerate accounts.
      return NextResponse.json(
        { error: "Unable to create an account with these details" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const mappedPropertyTypes = Array.from(
      new Set((propertyTypes ?? []).map(toPropertyType))
    );

    // Create user with requirements in a transaction
    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role: "applicant",
        },
      });

      // Create property requirements if any data provided
      if (transactionType || mappedPropertyTypes.length > 0 || (locations?.length ?? 0) > 0) {
        await tx.propertyRequirements.create({
          data: {
            userId: newUser.id,
            transactionType: transactionType ?? "buy",
            propertyTypes: mappedPropertyTypes,
            minBeds: minBeds ?? null,
            maxBeds: maxBeds ?? null,
            minPrice: minPrice ?? null,
            maxPrice: maxPrice ?? null,
            preferredLocations: locations ?? [],
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
