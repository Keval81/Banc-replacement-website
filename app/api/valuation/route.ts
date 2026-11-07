import { after, NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailTemplates } from "@/lib/email";
import { reportFormEvent } from "@/lib/portal-events";
import { deliverEnquiry } from "@/lib/enquiry-delivery";
import { enquiryInboxFor, valuationInbox } from "@/lib/banc-contact";
import { valuationRequestSchema } from "@/lib/lead-form-rules";
import { houseNumberFrom, runInstantValuation, type InstantEstimate } from "@/lib/valuation/instant";
import {
  createPublicFormRateLimiter,
  isHoneypotTripped,
  rateLimitResponse,
} from "@/lib/public-form-guard";

export const runtime = "nodejs";

const limiter = createPublicFormRateLimiter();

/**
 * The instant estimate, or nothing. A slow or empty register never blocks the
 * lead — the estimate is a courtesy, the call is the product.
 */
async function estimateFor(data: {
  postcode: string;
  address: string;
  propertyType?: string;
  paon?: string;
  saon?: string;
  majorWork?: boolean;
}): Promise<InstantEstimate | null> {
  try {
    return await Promise.race([
      runInstantValuation({
        postcode: data.postcode,
        paon: data.paon || houseNumberFrom(data.address),
        saon: data.saon ?? "",
        propertyType: data.propertyType,
        majorWork: data.majorWork ?? false,
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("register timed out")), 9000)),
    ]);
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
    const result = valuationRequestSchema.safeParse(body);
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
      lastName: data.lastName ?? "",
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
    const estimate = data.department === "sales" ? await estimateFor(data) : null;
    const delivery = await deliverEnquiry({
      team: {
        to: inbox,
        replyTo: data.email,
        ...emailTemplates.valuationNotification({
          firstName: data.firstName,
          lastName: data.lastName ?? "",
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
          majorWork: data.majorWork,
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

    after(() => reportFormEvent({ kind: "valuation" }));

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
