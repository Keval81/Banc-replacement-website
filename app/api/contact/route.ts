import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { enquiryInboxFor, officeInbox } from "@/lib/banc-contact";
import { emailTemplates } from "@/lib/email";
import { deliverEnquiry } from "@/lib/enquiry-delivery";
import {
  createPublicFormRateLimiter,
  isHoneypotTripped,
  rateLimitResponse,
} from "@/lib/public-form-guard";

export const runtime = "nodejs";

const limiter = createPublicFormRateLimiter();

// Validation schema (bounded lengths; unknown fields are stripped)
const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(254),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(1, "Please select a subject").max(120),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to be contacted",
  }),
  website: z.string().max(0).optional(), // honeypot
  // Set by property enquiries so the lead reaches the team that can act on
  // it. Absent on the general contact form, which still goes to the office.
  department: z.enum(["sales", "lettings"]).optional(),
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
        { success: true, message: "Your message has been sent successfully" },
        { status: 200 }
      );
    }

    // Validate input
    const result = contactSchema.safeParse(body);
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

    const { name, email, phone, subject, message, department } = result.data;

    // Store submission in database
    const submission = await db.contact.create({
      name,
      email,
      phone: phone || null,
      subject,
      message,
      source: "contact-page",
      status: "new",
    });

    // Route to the team that can act on it. A property enquiry names its
    // department; the general contact form does not, and still goes to the
    // office inbox.
    const notificationInbox = department ? enquiryInboxFor(department) : officeInbox();

    // The lead reaching the team is the job. If it cannot be delivered the
    // visitor is told, rather than shown a confirmation that isn't true.
    const delivery = await deliverEnquiry({
      team: {
        to: notificationInbox,
        replyTo: email,
        ...emailTemplates.contactNotification({ name, email, phone, subject, message }),
      },
      customer: {
        to: email,
        replyTo: notificationInbox,
        ...emailTemplates.contactConfirmation({ name, subject, message }),
      },
    });

    if (!delivery.ok) {
      const unreachable = delivery.reason === "mail-not-configured";
      console.error("[Contact API] enquiry not delivered:", delivery.reason, submission.id);
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not send your message just now. Please call us on 01707 877781 and we will pick it up straight away.",
        },
        { status: unreachable ? 503 : 502 }
      );
    }

    // Send webhook to CRM if configured
    if (process.env.CRM_WEBHOOK_URL) {
      try {
        await fetch(process.env.CRM_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "contact_form",
            data: submission,
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
        message: "Your message has been sent successfully",
        data: {
          id: submission.id,
          confirmationSent: delivery.confirmationSent,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Contact API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process your request. Please try again later.",
      },
      { status: 500 }
    );
  }
}
