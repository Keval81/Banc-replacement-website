import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";

// Validation schema
const valuationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter the property address"),
  postcode: z.string().min(5, "Please enter a valid postcode"),
  propertyType: z.string().optional(),
  bedrooms: z.string().optional(),
  timeframe: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const result = valuationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: result.error.issues,
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // Store request in database
    const valuationRequest = await db.valuation.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      postcode: data.postcode,
      propertyType: data.propertyType || null,
      bedrooms: data.bedrooms || null,
      timeframe: data.timeframe || null,
      message: data.message || null,
      status: "new",
    });

    // Send confirmation email to user
    const userEmailResult = await sendEmail({
      to: data.email,
      from: process.env.FROM_EMAIL || "noreply@bancproperty.com",
      ...emailTemplates.valuationConfirmation({
        firstName: data.firstName,
        address: data.address,
      }),
    });

    // Send notification email to valuations team
    const adminEmailResult = await sendEmail({
      to: process.env.VALUATIONS_EMAIL || "valuations@bancproperty.com",
      from: process.env.FROM_EMAIL || "noreply@bancproperty.com",
      ...emailTemplates.valuationNotification({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        postcode: data.postcode,
        propertyType: data.propertyType || "Not specified",
        bedrooms: data.bedrooms || "Not specified",
        timeframe: data.timeframe || "Not specified",
        message: data.message,
      }),
    });

    // Send webhook to CRM if configured
    if (process.env.CRM_WEBHOOK_URL) {
      try {
        await fetch(process.env.CRM_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "valuation_request",
            data: valuationRequest,
          }),
        });
      } catch (webhookError) {
        console.error("[CRM Webhook Error]", webhookError);
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your valuation request has been submitted successfully",
        data: {
          id: valuationRequest.id,
          emailSent: userEmailResult.success && adminEmailResult.success,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Valuation API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process your request. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for admin/development purposes
export async function GET() {
  // In production, add authentication here
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const requests = await db.valuation.findAll();
  return NextResponse.json({
    success: true,
    count: requests.length,
    data: requests,
  });
}
