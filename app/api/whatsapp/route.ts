import { NextRequest, NextResponse } from "next/server";

interface WhatsAppLinkParams {
  phone?: string;
  message?: string;
  propertyRef?: string;
  source?: string;
}

/**
 * Generate WhatsApp deep link
 * GET /api/whatsapp?phone=447707877781&message=Hello
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Get parameters
  let phone = searchParams.get("phone") || process.env.WHATSAPP_PHONE || "447707877781";
  let message = searchParams.get("message") || "";
  const propertyRef = searchParams.get("propertyRef");
  const source = searchParams.get("source") || "website";

  // Clean phone number (remove spaces and +)
  phone = phone.replace(/[\s+]/g, "");

  // Build message if property ref provided
  if (propertyRef && !message) {
    message = `Hi, I'm interested in property ${propertyRef}. Can you provide more information?`;
  }

  // Add source tracking
  const fullMessage = message + (message ? " " : "") + `(via ${source})`;

  // Generate WhatsApp link
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;

  // Return JSON or redirect based on Accept header
  const acceptHeader = request.headers.get("accept");
  
  if (acceptHeader?.includes("application/json")) {
    return NextResponse.json({
      success: true,
      data: {
        url: whatsappUrl,
        phone,
        message: fullMessage,
        propertyRef,
        source,
      },
    });
  }

  // Redirect to WhatsApp
  return NextResponse.redirect(whatsappUrl, 302);
}

/**
 * Generate WhatsApp link via POST
 * POST /api/whatsapp
 */
export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppLinkParams = await request.json();
    
    let phone = body.phone || process.env.WHATSAPP_PHONE || "447707877781";
    let message = body.message || "";
    
    // Clean phone number
    phone = phone.replace(/[\s+]/g, "");

    // Build message if property ref provided
    if (body.propertyRef && !message) {
      message = `Hi, I'm interested in property ${body.propertyRef}. Can you provide more information?`;
    }

    // Add source tracking
    const source = body.source || "website";
    const fullMessage = message + (message ? " " : "") + `(via ${source})`;

    // Generate WhatsApp link
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;

    return NextResponse.json({
      success: true,
      data: {
        url: whatsappUrl,
        phone,
        message: fullMessage,
        propertyRef: body.propertyRef,
        source,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
