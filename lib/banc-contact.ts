// WhatsApp needs a mobile, and Nitesh is still getting one (7 Sep). Until the
// number is set in the environment every WhatsApp surface stays hidden — the
// old default pointed wa.me at the Cuffley landline, which cannot receive it.
const WHATSAPP_MESSAGE = "Hi, I'm interested in a property I saw on your website.";

export const BANC_WHATSAPP_NUMBER: string | null = (() => {
  const digits = (process.env.NEXT_PUBLIC_BANC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
})();

export const BANC_CONTACT = {
  displayPhone: "01707 877781",
  callHref: "tel:01707877781",
  /** Empty when there is no WhatsApp number — callers hide the control. */
  whatsappHref: BANC_WHATSAPP_NUMBER
    ? `https://wa.me/${BANC_WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
    : "",
} as const;

export const BANC_MAYFAIR_CONTACT = {
  displayPhone: "0203 368 8972",
  callHref: "tel:02033688972",
} as const;

export interface BancPhoneLine {
  area: string;
  displayPhone: string;
  callHref: string;
}

// Area lines offered by the header phone menu.
//
// Mayfair was dropped from this menu on Nitesh's instruction (7 Sep) — the
// number itself stays on the Mayfair office page and the offices index, it is
// simply no longer offered as an area line. The two further landlines arrived
// from him on the evening of 7 Sep.
export const BANC_PHONE_LINES: readonly BancPhoneLine[] = [
  {
    area: "Cuffley & Northaw",
    displayPhone: BANC_CONTACT.displayPhone,
    callHref: BANC_CONTACT.callHref,
  },
  {
    area: "Brookmans Park & Potters Bar",
    displayPhone: "01707 907186",
    callHref: "tel:01707907186",
  },
  {
    area: "Goffs Oak & Cheshunt",
    displayPhone: "01992 919085",
    callHref: "tel:01992919085",
  },
] as const;

export type BancDepartment = "sales" | "lettings";

// Where viewing requests and property enquiries land. Nitesh still owes the
// real sales and lettings addresses (N2 in the 2026-09-02 action plan); until
// they arrive these route to the general office inbox, which is where they
// were already going. Replacing the two values here is the only change
// needed — a test forbids placeholders, so a stand-in cannot ship.
export const BANC_ENQUIRY_INBOXES: Record<BancDepartment, string> = {
  sales: "sales@bancproperty.com",
  lettings: "lettings@bancproperty.com",
} as const;

// Environment overrides so Nitesh's real addresses drop in from Vercel without
// a rebuild — the values above stay as the fallback and the guard test still
// forbids a placeholder shipping in them.
const INBOX_ENV_KEYS: Record<BancDepartment, string> = {
  sales: "BANC_SALES_INBOX",
  lettings: "BANC_LETTINGS_INBOX",
} as const;

export function enquiryInboxFor(department: BancDepartment): string {
  const override = process.env[INBOX_ENV_KEYS[department]]?.trim();
  return override && override.includes("@") ? override : BANC_ENQUIRY_INBOXES[department];
}

/** Where valuation leads land. Its own line because it may be a separate tray. */
export function valuationInbox(): string {
  const override = process.env.BANC_VALUATIONS_INBOX?.trim();
  return override && override.includes("@") ? override : "valuations@bancproperty.com";
}

/** The general office tray, for anything with no department attached. */
export function officeInbox(): string {
  const override = process.env.BANC_OFFICE_INBOX?.trim();
  return override && override.includes("@") ? override : "info@bancproperty.com";
}

// The Guild-published magazine. The footer linked this directly; the homepage
// alerts block needs the same URL, so it lives in one place now.
export const LIFE_MAGAZINE_URL =
  "https://pageturner.guildproperty.co.uk/bancp1";

/** Banc's Client Money Protection membership certificate, as sent by Nitesh on 7 Sep. */
export const CMP_CERTIFICATE_URL = "/documents/cmp-membership-certificate.pdf";

/** The published fee schedules and complaints procedure, carried over from the old site on 7 Sep 2026. */
export const FEES_TO_LANDLORDS_URL = "/documents/fees-to-landlords.pdf";
export const FEES_TO_TENANTS_URL = "/documents/fees-to-tenants.pdf";
export const COMPLAINTS_PROCEDURE_URL = "/documents/complaints-procedure.pdf";
