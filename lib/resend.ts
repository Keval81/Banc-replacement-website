// Resend Email Service for Banc Property Group
// TODO: Add credentials to .env.local:
//   RESEND_API_KEY=your_resend_api_key

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_EMAIL = "Banc Property Group <noreply@bancproperty.com>";

function isConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isConfigured()) {
    console.warn("Resend not configured — email not sent:", options.subject);
    return { success: false, error: "Resend API key not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend error:", error);
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (err) {
    console.error("Resend send failed:", err);
    return { success: false, error: String(err) };
  }
}

// ============================================
// Email Templates
// ============================================

export async function sendValuationConfirmation(to: string, name: string, address: string) {
  return sendEmail({
    to,
    subject: "Your Valuation Request — Banc Property Group",
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F4F3F1; padding: 40px 20px;">
        <div style="background: white; border-radius: 10px; padding: 40px; text-align: center;">
          <img src="https://bancproperty.com/banc-logo-blue.png" alt="Banc Property Group" style="height: 40px; margin-bottom: 24px;" />
          <h1 style="font-family: 'Source Serif 4', Georgia, serif; color: #2C2A27; font-size: 24px; margin-bottom: 16px;">
            Thank You, ${name}
          </h1>
          <p style="color: #8A8880; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            We've received your valuation request for <strong style="color: #2C2A27;">${address}</strong>.
            One of our property experts will be in touch within 24 hours.
          </p>
          <a href="https://bancproperty.com" style="display: inline-block; background: #4AC8E8; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Visit Our Website
          </a>
          <p style="color: #8A8880; font-size: 12px; margin-top: 32px;">
            Banc Property Group | 1 Station Road, Cuffley, EN6 4HU | 01707 877781
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendViewingConfirmation(to: string, name: string, property: string, date: string, time: string) {
  return sendEmail({
    to,
    subject: `Viewing Confirmed — ${property}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F4F3F1; padding: 40px 20px;">
        <div style="background: white; border-radius: 10px; padding: 40px;">
          <img src="https://bancproperty.com/banc-logo-blue.png" alt="Banc Property Group" style="height: 40px; margin-bottom: 24px;" />
          <h1 style="font-family: 'Source Serif 4', Georgia, serif; color: #2C2A27; font-size: 24px; margin-bottom: 16px;">
            Viewing Confirmed
          </h1>
          <p style="color: #8A8880; font-size: 16px; line-height: 1.6;">
            Hi ${name}, your viewing has been confirmed:
          </p>
          <div style="background: #F4F3F1; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #2C2A27; font-weight: 600;">${property}</p>
            <p style="margin: 8px 0 0; color: #8A8880;">${date} at ${time}</p>
          </div>
          <p style="color: #8A8880; font-size: 14px; line-height: 1.6;">
            Please arrive 5 minutes early. If you need to reschedule, call us on 01707 877781.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendEnquiryNotification(agentEmail: string, enquiry: {
  name: string;
  email: string;
  phone: string;
  property: string;
  message: string;
}) {
  return sendEmail({
    to: agentEmail,
    subject: `New Enquiry — ${enquiry.property}`,
    replyTo: enquiry.email,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2C2A27;">New Property Enquiry</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #8A8880;">Property</td><td style="padding: 8px 0; color: #2C2A27; font-weight: 600;">${enquiry.property}</td></tr>
          <tr><td style="padding: 8px 0; color: #8A8880;">Name</td><td style="padding: 8px 0; color: #2C2A27;">${enquiry.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #8A8880;">Email</td><td style="padding: 8px 0;"><a href="mailto:${enquiry.email}" style="color: #4AC8E8;">${enquiry.email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #8A8880;">Phone</td><td style="padding: 8px 0;"><a href="tel:${enquiry.phone}" style="color: #4AC8E8;">${enquiry.phone}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #8A8880;">Message</td><td style="padding: 8px 0; color: #2C2A27;">${enquiry.message}</td></tr>
        </table>
      </div>
    `,
  });
}
