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
