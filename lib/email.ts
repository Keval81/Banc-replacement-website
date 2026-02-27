// Email service configuration for Banc Property Group
// Supports SendGrid/AWS SES - configured via environment variables

interface EmailPayload {
  to: string | string[];
  from: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailConfig {
  provider: "sendgrid" | "aws-ses" | "mock";
  apiKey?: string;
  region?: string;
}

function getEmailConfig(): EmailConfig {
  const provider = process.env.EMAIL_PROVIDER as EmailConfig["provider"] || "mock";
  return {
    provider,
    apiKey: process.env.EMAIL_API_KEY,
    region: process.env.AWS_REGION,
  };
}

/**
 * Send an email using the configured provider
 * Falls back to mock mode in development
 */
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getEmailConfig();

  try {
    // Log email in development/mock mode
    if (config.provider === "mock" || process.env.NODE_ENV === "development") {
      console.log("[EMAIL MOCK] Would send email:");
      console.log(`  To: ${payload.to}`);
      console.log(`  From: ${payload.from}`);
      console.log(`  Subject: ${payload.subject}`);
      return { success: true, messageId: `mock-${Date.now()}` };
    }

    // SendGrid implementation
    if (config.provider === "sendgrid" && config.apiKey) {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: Array.isArray(payload.to) ? payload.to.map(e => ({ email: e })) : [{ email: payload.to }] }],
          from: { email: payload.from },
          subject: payload.subject,
          content: [
            { type: "text/plain", value: payload.text || "" },
            { type: "text/html", value: payload.html },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`SendGrid error: ${response.status}`);
      }

      return { success: true, messageId: response.headers.get("X-Message-Id") || undefined };
    }

    // AWS SES implementation
    if (config.provider === "aws-ses") {
      // AWS SES implementation would go here
      // For now, fall back to mock
      console.log("[AWS SES] Email sending not yet implemented, using mock");
      return { success: true, messageId: `mock-${Date.now()}` };
    }

    return { success: false, error: "No email provider configured" };
  } catch (error) {
    console.error("[EMAIL ERROR]", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Email templates for various purposes
 */
export const emailTemplates = {
  contactConfirmation: (data: { name: string; subject: string }) => ({
    subject: `Thank you for contacting Banc Property Group - ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Contacting Banc</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 20px 0; background: linear-gradient(135deg, #2C2F33 0%, #3A3D42 100%); text-align: center;">
              <h1 style="color: #1DBFDD; margin: 0; font-size: 28px; font-weight: 600;">Banc Property Group</h1>
            </td>
          </tr>
        </table>
        
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #2C2F33; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Thank You, ${data.name}!</h2>
              
              <p style="color: #6B6E72; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We have received your message regarding <strong style="color: #2C2F33;">${data.subject}</strong> and wanted to let you know that we've received it.
              </p>
              
              <p style="color: #6B6E72; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                One of our team members will review your inquiry and get back to you as soon as possible, usually within 24 hours during business days.
              </p>
              
              <div style="background-color: #F0F0ED; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #2C2F33; font-weight: 600; margin: 0 0 10px 0;">What happens next?</p>
                <ul style="color: #6B6E72; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>We'll review your message</li>
                  <li>A team member will be assigned to help you</li>
                  <li>We'll contact you within 24 hours</li>
                </ul>
              </div>
              
              <p style="color: #6B6E72; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                If you need immediate assistance, please don't hesitate to call us:
              </p>
              
              <p style="margin: 0;">
                <a href="tel:01707877781" style="color: #1DBFDD; text-decoration: none; font-weight: 600; font-size: 18px;">01707 877781</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;">
              
              <p style="color: #6B6E72; font-size: 14px; line-height: 1.6; margin: 0;">
                Best regards,<br>
                <strong style="color: #2C2F33;">The Banc Property Group Team</strong>
              </p>
            </td>
          </tr>
        </table>
        
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="padding: 20px 30px; text-align: center; color: #6B6E72; font-size: 12px;">
              <p style="margin: 0;">
                1 Station Road, Cuffley, EN6 4HU<br>
                <a href="mailto:info@bancproperty.com" style="color: #1DBFDD;">info@bancproperty.com</a> | 
                <a href="tel:01707877781" style="color: #1DBFDD;">01707 877781</a>
              </p>
              <p style="margin: 10px 0 0 0;">
                <a href="https://bancproperty.com/privacy" style="color: #6B6E72;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Thank you for contacting Banc Property Group!

Hi ${data.name},

We have received your message regarding "${data.subject}" and wanted to let you know that we've received it.

One of our team members will review your inquiry and get back to you as soon as possible, usually within 24 hours during business days.

What happens next?
- We'll review your message
- A team member will be assigned to help you
- We'll contact you within 24 hours

If you need immediate assistance, please call us: 01707 877781

Best regards,
The Banc Property Group Team

1 Station Road, Cuffley, EN6 4HU
info@bancproperty.com | 01707 877781`,
  }),

  contactNotification: (data: { name: string; email: string; phone?: string; subject: string; message: string }) => ({
    subject: `New Contact Form Submission: ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 20px 0; background: linear-gradient(135deg, #1DBFDD 0%, #0E8CAB 100%); text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Contact Form Submission</h1>
            </td>
          </tr>
        </table>
        
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px 30px;">
              <div style="background-color: #F0F0ED; padding: 25px; border-radius: 8px; border-left: 4px solid #1DBFDD;">
                <h2 style="color: #2C2F33; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Contact Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6B6E72; font-weight: 600; width: 120px;">Name:</td>
                    <td style="padding: 8px 0; color: #2C2F33;">${data.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6B6E72; font-weight: 600;">Email:</td>
                    <td style="padding: 8px 0;">
                      <a href="mailto:${data.email}" style="color: #1DBFDD; text-decoration: none;">${data.email}</a>
                    </td>
                  </tr>
                  ${data.phone ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6B6E72; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0;">
                      <a href="tel:${data.phone}" style="color: #1DBFDD; text-decoration: none;">${data.phone}</a>
                    </td>
                  </tr>
                  ` : ""}
                  <tr>
                    <td style="padding: 8px 0; color: #6B6E72; font-weight: 600;">Subject:</td>
                    <td style="padding: 8px 0; color: #2C2F33;">${data.subject}</td>
                  </tr>
                </table>
                
                <hr style="border: none; border-top: 1px solid #C8C9CB; margin: 20px 0;">
                
                <h3 style="color: #2C2F33; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Message:</h3>
                <p style="color: #6B6E72; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.message}</p>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="mailto:${data.email}" style="display: inline-block; background: linear-gradient(135deg, #1DBFDD 0%, #0E8CAB 100%); color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reply to ${data.name}</a>
              </div>
            </td>
          </tr>
        </table>
        
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="padding: 20px 30px; text-align: center; color: #6B6E72; font-size: 12px;">
              <p style="margin: 0;">This is an automated message from the Banc Property Group website.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `New Contact Form Submission

Contact Details:
Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}\n` : ""}Subject: ${data.subject}

Message:
${data.message}

Reply to: ${data.email}`,
  }),

  valuationConfirmation: (data: { firstName: string; address: string }) => ({
    subject: "Your Property Valuation Request - Banc Property Group",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Valuation Request Received</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 20px 0; background: linear-gradient(135deg, #2C2F33 0%, #3A3D42 100%); text-align: center;">
              <h1 style="color: #1DBFDD; margin: 0; font-size: 28px; font-weight: 600;">Banc Property Group</h1>
            </td>
          </tr>
        </table>
        
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #2C2F33; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Thank You, ${data.firstName}!</h2>
              
              <p style="color: #6B6E72; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We've received your valuation request for <strong style="color: #2C2F33;">${data.address}</strong>.
              </p>
              
              <div style="background: linear-gradient(135deg, #1DBFDD 0%, #0E8CAB 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">What happens next?</p>
                <p style="color: #ffffff; opacity: 0.9; margin: 0; line-height: 1.6;">
                  One of our local property experts will contact you within 24 hours to arrange your free, no-obligation valuation at a time that suits you.
                </p>
              </div>
              
              <div style="background-color: #F0F0ED; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #2C2F33; font-weight: 600; margin: 0 0 15px 0;">Our Valuation Service Includes:</p>
                <ul style="color: #6B6E72; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Free, no-obligation market appraisal</li>
                  <li>Detailed local market analysis</li>
                  <li>Advice on presentation and improvements</li>
                  <li>Marketing strategy recommendations</li>
                  <li>Realistic valuation based on recent sales</li>
                </ul>
              </div>
              
              <p style="color: #6B6E72; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                If you have any questions in the meantime, please don't hesitate to contact us:
              </p>
              
              <p style="margin: 0;">
                <a href="tel:01707877781" style="color: #1DBFDD; text-decoration: none; font-weight: 600; font-size: 18px;">01707 877781</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;">
              
              <p style="color: #6B6E72; font-size: 14px; line-height: 1.6; margin: 0;">
                Best regards,<br>
                <strong style="color: #2C2F33;">The Banc Property Group Team</strong>
              </p>
            </td>
          </tr>
        </table>
        
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="padding: 20px 30px; text-align: center; color: #6B6E72; font-size: 12px;">
              <p style="margin: 0;">
                1 Station Road, Cuffley, EN6 4HU<br>
                <a href="mailto:valuations@bancproperty.com" style="color: #1DBFDD;">valuations@bancproperty.com</a> | 
                <a href="tel:01707877781" style="color: #1DBFDD;">01707 877781</a>
              </p>
              <p style="margin: 10px 0 0 0;">
                <a href="https://bancproperty.com/privacy" style="color: #6B6E72;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Thank You for Your Valuation Request!

Hi ${data.firstName},

We've received your valuation request for ${data.address}.

What happens next?
One of our local property experts will contact you within 24 hours to arrange your free, no-obligation valuation at a time that suits you.

Our Valuation Service Includes:
- Free, no-obligation market appraisal
- Detailed local market analysis
- Advice on presentation and improvements
- Marketing strategy recommendations
- Realistic valuation based on recent sales

If you have any questions, please contact us: 01707 877781

Best regards,
The Banc Property Group Team

1 Station Road, Cuffley, EN6 4HU
valuations@bancproperty.com | 01707 877781`,
  }),

  valuationNotification: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    postcode: string;
    propertyType: string;
    bedrooms: string;
    timeframe: string;
    message?: string;
  }) => ({
    subject: `New Valuation Request: ${data.address}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Valuation Request</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 20px 0; background: linear-gradient(135deg, #1DBFDD 0%, #0E8CAB 100%); text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Valuation Request</h1>
            </td>
          </tr>
        </table>
        
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px 30px;">
              <div style="background-color: #F0F0ED; padding: 25px; border-radius: 8px; border-left: 4px solid #1DBFDD;">
                <h2 style="color: #2C2F33; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Property Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6B6E72; font-weight: 600; width: 140px;">Owner:</td>
                    <td style="padding: 8px 0; color: #2C2F33;">${data.firstName} ${data.lastName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6B6E72; font-weight: 600;">Email:</td>
                    <td style="padding: 8px 0;">
                      <a href="mailto:${data.email}" style="color: #1DBFDD; text-decoration: none;">${data.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6B6E72; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0;">
                      <a href="tel:${data.phone}" style="color: #1DBFDD; text-decoration: none;">${data.phone}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6B6E72; font-weight: 600;">Address:</td>
                    <td style="padding: 8px 0; color: #2C2F33;">${data.address}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6B6E72; font-weight: 600;">Postcode:</td>
                    <td style="padding: 8px 0; color: #2C2F33;">${data.postcode}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6B6E72; font-weight: 600;">Property Type:</td>
                    <td style="padding: 8px 0; color: #2C2F33;">${data.propertyType || "Not specified"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6B6E72; font-weight: 600;">Bedrooms:</td>
                    <td style="padding: 8px 0; color: #2C2F33;">${data.bedrooms || "Not specified"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6B6E72; font-weight: 600;">Timeframe:</td>
                    <td style="padding: 8px 0; color: #2C2F33;">${data.timeframe || "Not specified"}</td>
                  </tr>
                </table>
                
                ${data.message ? `
                <hr style="border: none; border-top: 1px solid #C8C9CB; margin: 20px 0;">
                <h3 style="color: #2C2F33; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Additional Information:</h3>
                <p style="color: #6B6E72; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.message}</p>
                ` : ""}
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="tel:${data.phone}" style="display: inline-block; background: linear-gradient(135deg, #1DBFDD 0%, #0E8CAB 100%); color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Call ${data.firstName}</a>
              </div>
            </td>
          </tr>
        </table>
        
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="padding: 20px 30px; text-align: center; color: #6B6E72; font-size: 12px;">
              <p style="margin: 0;">This is an automated message from the Banc Property Group website.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `New Valuation Request

Property Details:
Owner: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
Address: ${data.address}
Postcode: ${data.postcode}
Property Type: ${data.propertyType || "Not specified"}
Bedrooms: ${data.bedrooms || "Not specified"}
Timeframe: ${data.timeframe || "Not specified"}

${data.message ? `Additional Information:\n${data.message}\n\n` : ""}Call: ${data.phone}`,
  }),
};
