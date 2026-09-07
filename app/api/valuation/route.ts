import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emailTemplates } from "@/lib/email";
import { deliverEnquiry } from "@/lib/enquiry-delivery";
import { enquiryInboxFor, valuationInbox } from "@/lib/banc-contact";
import { fetchSoldPricesBySector } from "@/lib/api/landRegistry";
import { estimateFromSales, lookupPostcodeDistrict, postcodeSector, type ValuationEstimate } from "@/lib/valuation-estimate";
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
  // "sell" or "let" — the form asks first. Lettings go to the lettings team and
  // get no online figure; there is no public source of rental comparables.
  department: z.enum(["sales", "lettings"]).default("sales"),
  website: z.string().max(0).optional(), // honeypot
});

/**
 * An indicative range from the register, or nothing. A slow or empty register
 * never blocks the lead — the estimate is a courtesy, the call is the product.
 */
async function estimateFor(postcode: string, propertyType: string | undefined): Promise<ValuationEstimate | null> {
  const sector = postcodeSector(postcode);
  if (!sector) return null;
  try {
    const district = await lookupPostcodeDistrict(postcode);
    if (!district) return null;
    const sales = await Promise.race([
      fetchSoldPricesBySector(sector, district),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("register timed out")), 9000)),
    ]);
    return estimateFromSales(sales, { propertyType, sector });
  } catch (error) {
    console.error("[Valuation API] no estimate:", error instanceof Error ? error.message : error);
    return null;
  }
}

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

    // The valuation lead reaching the team is the job; the applicant's
    // confirmation is a courtesy and never fails the request on its own.
    const inbox = data.department === "lettings" ? enquiryInboxFor("lettings") : valuationInbox();
    const estimate = data.department === "sales" ? await estimateFor(data.postcode, data.propertyType) : null;
    const delivery = await deliverEnquiry({
      team: {
        to: inbox,
        replyTo: data.email,
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
          department: data.department,
          estimate,
        }),
      },
      customer: {
        to: data.email,
        replyTo: inbox,
        ...emailTemplates.valuationConfirmation({
          firstName: data.firstName,
          address: data.address,
          department: data.department,
          estimate,
        }),
      },
    });

    if (!delivery.ok) {
      console.error("[Valuation API] lead not delivered:", delivery.reason, valuationRequest.id);
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not send your request just now. Please call us on 01707 877781 and we will book it in for you.",
        },
        { status: delivery.reason === "mail-not-configured" ? 503 : 502 }
      );
    }

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
        estimate,
        department: data.department,
        data: {
          id: valuationRequest.id,
          confirmationSent: delivery.confirmationSent,
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
