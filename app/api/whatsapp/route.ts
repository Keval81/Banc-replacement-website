import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const DEFAULT_PHONE = "447707877781";
const PHONE_PATTERN = /^\d{7,15}$/;

const paramsSchema = z.object({
  phone: z.string().regex(PHONE_PATTERN, "Invalid phone number").optional(),
  message: z.string().max(500, "Message too long").optional(),
  propertyRef: z.string().trim().max(40).optional(),
  source: z.string().trim().max(40).optional(),
});

type WhatsAppLinkParams = z.infer<typeof paramsSchema>;

/** Strip spaces and leading "+" before validation so "+44 7707 877781" works. */
function cleanPhone(value: string | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  return value.replace(/[\s+]/g, "");
}

function buildLink(params: WhatsAppLinkParams) {
  const phone = params.phone || cleanPhone(process.env.WHATSAPP_PHONE) || DEFAULT_PHONE;
  let message = params.message || "";

  // Build message if property ref provided
  if (params.propertyRef && !message) {
    message = `Hi, I'm interested in property ${params.propertyRef}. Can you provide more information?`;
  }

  // Add source tracking
  const source = params.source || "website";
  const fullMessage = message + (message ? " " : "") + `(via ${source})`;

  return {
    url: `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`,
    phone,
    message: fullMessage,
    propertyRef: params.propertyRef,
    source,
  };
}

function invalid(issues: z.ZodIssue[]) {
  return NextResponse.json(
    { success: false, error: "Invalid request", details: issues },
    { status: 400 }
  );
}

/**
 * Generate WhatsApp deep link
 * GET /api/whatsapp?phone=447707877781&message=Hello
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const parsed = paramsSchema.safeParse({
    phone: cleanPhone(searchParams.get("phone")),
    message: searchParams.get("message") ?? undefined,
    propertyRef: searchParams.get("propertyRef") ?? undefined,
    source: searchParams.get("source") ?? undefined,
  });
  if (!parsed.success) return invalid(parsed.error.issues);

  const data = buildLink(parsed.data);

  // Return JSON or redirect based on Accept header
  const acceptHeader = request.headers.get("accept");
  if (acceptHeader?.includes("application/json")) {
    return NextResponse.json({ success: true, data });
  }

  // Redirect to WhatsApp
  return NextResponse.redirect(data.url, 302);
}

/**
 * Generate WhatsApp link via POST
 * POST /api/whatsapp
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const json: unknown = await request.json();
    if (!json || typeof json !== "object") throw new Error("not an object");
    body = json as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parsed = paramsSchema.safeParse({
    ...body,
    phone: typeof body.phone === "string" ? cleanPhone(body.phone) : body.phone,
  });
  if (!parsed.success) return invalid(parsed.error.issues);

  return NextResponse.json({ success: true, data: buildLink(parsed.data) });
}
