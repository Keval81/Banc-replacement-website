export const BANC_CONTACT = {
  displayPhone: "01707 877781",
  callHref: "tel:01707877781",
  whatsappHref:
    "https://wa.me/447707877781?text=Hi%2C%20I'm%20interested%20in%20a%20property%20I%20saw%20on%20your%20website.",
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

// Area lines offered by the header phone menu. Brookmans Park and the third
// area are still pending from Nitesh (N1 in the 2026-09-02 action plan);
// adding an entry here is the only change needed to surface them.
export const BANC_PHONE_LINES: readonly BancPhoneLine[] = [
  {
    area: "Cuffley",
    displayPhone: BANC_CONTACT.displayPhone,
    callHref: BANC_CONTACT.callHref,
  },
  {
    area: "Mayfair",
    displayPhone: BANC_MAYFAIR_CONTACT.displayPhone,
    callHref: BANC_MAYFAIR_CONTACT.callHref,
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

export function enquiryInboxFor(department: BancDepartment): string {
  return BANC_ENQUIRY_INBOXES[department];
}

// The Guild-published magazine. The footer linked this directly; the homepage
// alerts block needs the same URL, so it lives in one place now.
export const LIFE_MAGAZINE_URL =
  "https://pageturner.guildproperty.co.uk/bancp1";
