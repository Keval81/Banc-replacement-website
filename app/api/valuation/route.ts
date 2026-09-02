import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";
import {
  createPublicFormRateLimiter,
  isHoneypotTripped,
  rateLimitResponse,
} from "@/lib/public-form-guard";

export const runtime = "nodejs";

const limiter = createPublicFormRateLimiter();

// Validation schema (bounded lengths; unknown fields are stripped)
const valuationSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters").max(80),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters").max(80),
  email: z.string().trim().email("Please enter a valid email address").max(254),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(30),
  address: z.string().trim().min(5, "Please enter the property address").max(300),
  postcode: z.string().trim().min(5, "Please enter a valid postcode").max(10),
  propertyType: z.string().trim().max(60).optional(),
  bedrooms: z.string().trim().max(10).optional(),
  timeframe: z.string().trim().max(60).optional(),
  message: z.string().trim().max(5000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimitResponse(limiter, request);
    if (limited) return limited;

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (isHoneypotTripped(body)) {
      return NextResponse.json(
        { success: true, message: "Your valuation request has been submitted successfully" },
        { status: 200 }
      );
    }

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
          signal: AbortSignal.timeout(8000),
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
