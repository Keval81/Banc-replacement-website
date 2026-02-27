import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to be contacted",
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

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

    const { name, email, phone, subject, message } = result.data;

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

    // Send confirmation email to user
    const userEmailResult = await sendEmail({
      to: email,
      from: process.env.FROM_EMAIL || "noreply@bancproperty.com",
      ...emailTemplates.contactConfirmation({ name, subject }),
    });

    // Send notification email to admin
    const adminEmailResult = await sendEmail({
      to: process.env.ADMIN_EMAIL || "office@bancproperty.com",
      from: process.env.FROM_EMAIL || "noreply@bancproperty.com",
      ...emailTemplates.contactNotification({
        name,
        email,
        phone,
        subject,
        message,
      }),
    });

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
          emailSent: userEmailResult.success && adminEmailResult.success,
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

// GET endpoint for admin/development purposes
export async function GET() {
  // In production, add authentication here
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const submissions = await db.contact.findAll();
  return NextResponse.json({
    success: true,
    count: submissions.length,
    data: submissions,
  });
}
