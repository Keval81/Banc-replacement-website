// Transactional mail for Banc Property Group, sent through Resend.
//
// Until bancproperty.com carries its own authentication records, mail goes out
// on the Digital Inroads verified domain with Banc's name on the front and
// reply-to pointing at whoever should be replied to. That is the arrangement
// Your Panacea has run on since July; swapping CONTACT_FROM to a Banc address
// is the only change needed once James adds the records.
//
// Env: RESEND_API_KEY (required — without it nothing sends and every caller is
// told so), plus optional CONTACT_FROM.

const DEFAULT_FROM = "Banc Property Group <banc@digitalinroads.com>";

export type MailFailure = "mail-not-configured" | "mail-send-failed";

export type MailResult =
  | { ok: true; id?: string }
  | { ok: false; reason: MailFailure; detail?: string };

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Where a reply should land — the customer on team mail, the team on theirs. */
  replyTo?: string;
}

/** Injectable so tests exercise the real send path without a network call. */
export type MailFetch = (url: string, init: RequestInit) => Promise<Response>;

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function mailFrom(): string {
  return process.env.CONTACT_FROM ?? DEFAULT_FROM;
}

/**
 * Sends one message. Never reports success for a message that did not leave —
 * the previous implementation defaulted to a mock that returned success, which
 * is how every lead the site captured came to be silently discarded.
 */
export async function sendEmail(
  message: EmailMessage,
  fetcher: MailFetch = fetch as unknown as MailFetch,
): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: "mail-not-configured" };

  try {
    const response = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: mailFrom(),
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        ...(message.text ? { text: message.text } : {}),
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[mail] Resend rejected the message", response.status, detail);
      return { ok: false, reason: "mail-send-failed", detail };
    }

    const body = (await response.json().catch(() => null)) as { id?: string } | null;
    return { ok: true, id: body?.id };
  } catch (error) {
    console.error("[mail] send failed", error);
    return {
      ok: false,
      reason: "mail-send-failed",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Email templates — built to BANC Brand Guidelines v1.0.
 *
 * Dark 900 header, Banc Sky as a hairline only (the guide forbids Sky as a
 * large field on dark), Sky 800 on filled buttons because white on Sky is
 * 1.96:1, Playfair Display over Georgia and DM Sans over Arial because Gmail
 * and Outlook strip web fonts. Table layout and inline styles throughout, for
 * the same reason.
 *
 * Everything interpolated is escaped: these render text a stranger typed into
 * a public form, straight into a colleague's inbox.
 */

/**
 * Where email images are served from.
 *
 * NOT bancproperty.com: until the cut-over that apex answers on a dead IP, so
 * every image in the first send timed out and the mail arrived unbranded. The
 * Vercel host serves the same files publicly today. One env change moves this
 * to Banc's own domain once the records land.
 */
const DEFAULT_ASSET_BASE = "https://banc-website-kappa.vercel.app";

export function emailAssetBase(): string {
  return (process.env.EMAIL_ASSET_BASE ?? DEFAULT_ASSET_BASE).replace(/\/+$/, "");
}

const asset = (path: string) => `${emailAssetBase()}${path}`;

const esc = (value: string | undefined | null): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const SANS = "font-family:'DM Sans',Arial,Helvetica,sans-serif;";
const DISPLAY = "font-family:'Playfair Display',Georgia,'Times New Roman',serif;";

const OFFICE = "1 Station Road, Cuffley, Hertfordshire EN6 4HU";
const PHONE = "01707 877781";

/** Shared shell.
 *
 *  The picture is the header: four of the team outside the Cuffley office says
 *  more to a stranger than a wordmark does. The wordmark signs off at the foot
 *  instead, in teal on Dark 900. A solid Banc Sky band tops the email so the
 *  brand still reads when a client blocks images.
 */
function shell(
  preheader: string,
  kicker: string,
  inner: string,
  foot: string,
  portrait = false,
): string {
  const team = asset("/images/team/banc-team-clay.jpg");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>@media only screen and (max-width:480px){.bp-pad{padding:24px 20px 8px!important}.bp-h1{font-size:23px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#F4F3F1;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:#F4F3F1;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;border-collapse:collapse;background:#FFFFFF;border:1px solid #E0DFDC;">
  <tr><td style="height:8px;background:#4AC8E8;font-size:0;line-height:0;">&nbsp;</td></tr>
${
  portrait
    ? `  <tr><td style="padding:0;font-size:0;line-height:0;background:#1A1917;">
    <img src="${team}" width="560" alt="Nitesh, Andrew, Vicki and Kay outside the Banc Property Group office in Cuffley" style="width:100%;max-width:560px;height:auto;display:block;border:0;">
  </td></tr>`
    : `  <tr><td style="background:#1A1917;padding:18px 32px;">
    <p style="${SANS}font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:#4AC8E8;margin:0;">Banc Property Group</p>
  </td></tr>`
}
  <tr><td class="bp-pad" style="padding:30px 32px 8px;">
    <p style="${SANS}font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#0A6078;margin:0 0 8px;">${esc(kicker)}</p>
    ${inner}
  </td></tr>
  <tr><td style="padding:8px 32px 0;">${foot}</td></tr>
  ${signOff()}
</table>
</td></tr></table>
</body></html>`.trim();
}

/** The wordmark, from the official logo pack.
 *
 *  `banc-logo-blue.png` is byte-identical to "Banc Property Group - Blue
 *  (White Background).png" in 02-Design/Banc Property Group Logos/ — the
 *  approved flat lockup, drawn for a light ground, which is why the sign-off
 *  is Dark 50 rather than Dark 900.
 *
 *  The metallic 3D files loose in 02-Design are an older treatment and are not
 *  in that pack; a test now stops one shipping again.
 *
 *  180px, against the Brand Kit's 120px digital minimum. The deployed file is
 *  the full-resolution master — /email/banc-logo-blue.png is a 420px copy that
 *  takes over as soon as it is deployed.
 */
function signOff(): string {
  return `<tr><td style="height:8px;background:#4AC8E8;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td align="center" style="background:#F4F3F1;padding:32px 32px 34px;">
    <img src="${asset("/banc-logo-blue.png")}" width="180" alt="Banc Property Group" style="width:180px;height:auto;display:block;margin:0 auto 20px;border:0;">
    <p style="${SANS}font-size:12px;line-height:1.7;color:#5F5D57;margin:0;">${OFFICE}</p>
    <p style="${SANS}font-size:12px;line-height:1.7;color:#5F5D57;margin:2px 0 0;">${PHONE} &nbsp;·&nbsp; <a href="https://bancproperty.com" style="color:#0A6078;text-decoration:none;">bancproperty.com</a></p>
  </td></tr>`;
}

/** Sits directly above the sign-off: a hairline and any fine print. The "Property Group"
 *  device that used to sit here read as a stray label under the picture (Nitesh, 7 Sep). */
function customerFoot(extra = ""): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid #E0DFDC;">
  <tr><td align="center" style="padding:${extra ? "18px 0 20px" : "10px 0 12px"};">
    ${extra}
  </td></tr></table>`;
}

function teamFoot(who: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:8px;border-top:1px solid #E0DFDC;"><tr><td style="padding:18px 0 0;">
    <p style="${SANS}font-size:12px;line-height:1.65;color:#5F5D57;margin:0;">Hit <strong style="color:#2C2A27;">reply</strong> to go straight back to ${esc(who)}. Sent by the <a href="https://bancproperty.com" style="color:#0A6078;text-decoration:none;">bancproperty.com</a> website.</p>
  </td></tr></table>`;
}

const h1 = (text: string) =>
  `<h1 class="bp-h1" style="${DISPLAY}font-size:27px;font-weight:400;line-height:1.25;margin:0 0 16px;color:#2C2A27;">${esc(text)}</h1>`;

const p = (html: string, size = 15) =>
  `<p style="${SANS}font-size:${size}px;line-height:1.75;color:#3D3B37;margin:0 0 16px;">${html}</p>`;

const h2 = (text: string) =>
  `<p style="${SANS}font-size:16px;font-weight:500;color:#2C2A27;margin:24px 0 8px;">${esc(text)}</p>`;

/** Label/value rows on Dark 50. */
function facts(rows: [string, string][]): string {
  const body = rows
    .filter(([, value]) => value && value.trim() !== "")
    .map(
      ([label, value], i, all) =>
        `<tr><td style="padding:11px 16px;${SANS}font-size:14px;line-height:1.5;color:#5F5D57;width:40%;${i < all.length - 1 ? "border-bottom:1px solid #E0DFDC;" : ""}">${esc(label)}</td><td style="padding:11px 16px;${SANS}font-size:14px;line-height:1.5;color:#2C2A27;font-weight:500;${i < all.length - 1 ? "border-bottom:1px solid #E0DFDC;" : ""}">${esc(value)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:#E8F8FC;margin:0 0 24px;">${body}</table>`;
}

/** What the visitor typed, quoted back. */
const quote = (text: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 24px;"><tr>
    <td style="width:2px;background:#4AC8E8;font-size:0;line-height:0;">&nbsp;</td>
    <td style="padding:2px 0 2px 16px;${SANS}font-size:14.5px;line-height:1.7;color:#3D3B37;white-space:pre-line;">${esc(text)}</td>
  </tr></table>`;

const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 16px;"><tr>
    <td style="background:#0A6078;"><a href="${esc(href)}" style="display:inline-block;padding:13px 28px;${SANS}font-size:15px;font-weight:500;color:#FFFFFF;text-decoration:none;">${esc(label)}</a></td>
  </tr></table>`;

/** What the valuation form showed the customer — the same range goes to the team. */
export interface ValuationEstimateSummary {
  low: number;
  high: number;
  sampleSize: number;
  basis: "type" | "area";
  sector: string;
  monthsBack: number;
}

const formatEstimateRange = (e: ValuationEstimateSummary) =>
  `£${e.low.toLocaleString("en-GB")} – £${e.high.toLocaleString("en-GB")}`;

/** The range, with the caveat Nitesh asked for on 7 Sep: it is an estimate, and the call gives the real figure. */
function estimateBlock(e: ValuationEstimateSummary): string {
  const years = e.monthsBack >= 24 ? "two years" : `${e.monthsBack} months`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:#E8F8FC;margin:0 0 24px;"><tr><td style="padding:18px 20px;">
    <p style="${SANS}font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#0A6078;margin:0 0 6px;">Indicative estimate</p>
    <p style="${DISPLAY}font-size:26px;line-height:1.2;color:#2C2A27;margin:0 0 8px;">${formatEstimateRange(e)}</p>
    <p style="${SANS}font-size:13px;line-height:1.65;color:#3D3B37;margin:0;">Based on ${e.sampleSize} sales of ${e.basis === "type" ? "similar homes" : "homes of all types"} in ${esc(e.sector)} over the last ${years}, from HM Land Registry. Please keep in mind this is an estimate from public records, not a valuation of your home — one of the directors will call to give you an accurate figure.</p>
  </td></tr></table>`;
}

export const emailTemplates = {
  contactConfirmation: (data: { name: string; subject: string; message?: string }) => {
    const first = data.name.split(" ")[0] || "there";
    return {
      subject: `We've got your message — Banc Property Group`,
      html: shell(
        `We'll come back to you within one working day.`,
        "Message received",
        [
          h1(`Thanks, ${first} — we've got it`),
          p(
            `Someone from the team will come back to you within one working day. If it's urgent, the Cuffley office is open 9am–5:30pm on <strong style="color:#2C2A27;">${PHONE}</strong>.`,
            16,
          ),
          h2("What you sent us"),
          facts([["Subject", data.subject]]),
          data.message ? quote(data.message) : "",
          p("There's nothing you need to do — we'll be in touch."),
        ].join(""),
        customerFoot(),
        true,
      ),
    };
  },

  contactNotification: (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => ({
    subject: `Enquiry — ${data.subject} — ${data.name}`,
    html: shell(
      `${data.name} · ${data.phone ?? data.email}`,
      "New enquiry",
      [
        h1(data.name),
        facts([
          ["Subject", data.subject],
          ["Phone", data.phone ?? ""],
          ["Email", data.email],
        ]),
        h2("What they wrote"),
        quote(data.message),
      ].join(""),
      teamFoot(data.name.split(" ")[0] || "them"),
    ),
  }),

  valuationConfirmation: (data: {
    firstName: string;
    address: string;
    department?: "sales" | "lettings";
    estimate?: ValuationEstimateSummary | null;
  }) => {
    const lettings = data.department === "lettings";
    const estimate = !lettings && data.estimate ? data.estimate : null;
    return {
      subject: lettings
        ? `Your rental valuation request — ${data.address}`
        : `Your valuation request — ${data.address}`,
      html: shell(
        estimate
          ? `An indicative range for ${data.address}, and a director will call within one working day.`
          : `One of the directors will call you within one working day.`,
        lettings ? "Rental valuation request received" : "Valuation request received",
        [
          h1(`Thank you, ${data.firstName}`),
          p(
            lettings
              ? `We have your request for a rental appraisal of <strong style="color:#2C2A27;">${esc(data.address)}</strong>. One of the directors will call you within one working day to talk through what it could let for and how we would manage it.`
              : `We have your request for <strong style="color:#2C2A27;">${esc(data.address)}</strong>. One of the directors will call you within one working day.`,
            16,
          ),
          estimate ? estimateBlock(estimate) : "",
          h2(lettings ? "What a Banc rental appraisal involves" : "What a Banc valuation involves"),
          lettings
            ? `<ol style="${SANS}font-size:15px;line-height:1.75;color:#3D3B37;margin:0 0 16px;padding-left:20px;">
          <li style="margin-bottom:8px;">A visit at a time that suits you — usually about 30 minutes.</li>
          <li style="margin-bottom:8px;">A rent figure based on what is genuinely letting nearby, not what's advertised.</li>
          <li style="margin-bottom:8px;">Straight advice on presentation, compliance and what tenants in this area look for.</li>
          <li>A written summary afterwards. No obligation.</li>
        </ol>`
            : `<ol style="${SANS}font-size:15px;line-height:1.75;color:#3D3B37;margin:0 0 16px;padding-left:20px;">
          <li style="margin-bottom:8px;">A visit at a time that suits you — usually about 45 minutes.</li>
          <li style="margin-bottom:8px;">A figure based on what has genuinely sold nearby, not what's listed.</li>
          <li style="margin-bottom:8px;">Honest advice on presentation: what's worth doing before marketing, and what isn't.</li>
          <li>A written summary afterwards. No obligation, and no pressure to instruct us.</li>
        </ol>`,
          p(
            `If you'd rather talk it through first, call the Cuffley office on <strong style="color:#2C2A27;">${PHONE}</strong> and ask for Nitesh or Andrew.`,
          ),
          lettings ? "" : button("https://bancproperty.com/track-record", "See what we've sold locally"),
        ].join(""),
        customerFoot(),
        true,
      ),
    };
  },

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
    department?: "sales" | "lettings";
    estimate?: ValuationEstimateSummary | null;
  }) => {
    const name = `${data.firstName} ${data.lastName}`.trim();
    const lettings = data.department === "lettings";
    const estimate = !lettings && data.estimate ? data.estimate : null;
    return {
      subject: `${lettings ? "Rental valuation" : "Valuation"} — ${data.address}, ${data.postcode} — ${data.timeframe}`,
      html: shell(
        `${name} · ${data.phone}`,
        lettings ? "New rental valuation request" : "New valuation request",
        [
          h1(name),
          facts([
            ["Address", `${data.address}, ${data.postcode}`],
            ["Property", `${data.propertyType} · ${data.bedrooms} bed`],
            ["Wants to", lettings ? "Let" : "Sell"],
            ["Timeframe", data.timeframe],
            ["Phone", data.phone],
            ["Email", data.email],
            ["Shown online", estimate ? `${formatEstimateRange(estimate)} (${estimate.sampleSize} sales, ${estimate.sector})` : lettings ? "No figure — rental" : "No figure — not enough recent sales"],
          ]),
          data.message ? h2("Anything else we should know") + quote(data.message) : "",
        ].join(""),
        teamFoot(data.firstName),
      ),
    };
  },
};
