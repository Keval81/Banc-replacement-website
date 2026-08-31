import {
  BANC_CONTACT,
  BANC_MAYFAIR_CONTACT,
} from "../banc-contact.ts";
import type {
  ApprovedBancPage,
  ApprovedBancSection,
} from "./types.ts";

export interface BancContactDetail {
  label: string;
  lines: readonly string[];
  href: string | null;
}

export interface BancOfficeContact {
  id: string;
  title: string;
  addressLines: readonly string[];
  phone: {
    displayPhone: string;
    callHref: `tel:${string}`;
  };
  email: {
    displayEmail: string;
    mailtoHref: `mailto:${string}`;
  };
  openingHours: readonly string[];
  aliases: readonly string[];
}

const BANC_EMAIL = {
  displayEmail: "info@bancproperty.com",
  mailtoHref: "mailto:info@bancproperty.com",
} as const;

export const BANC_OFFICES = {
  cuffley: {
    id: "cuffley-office",
    title: "Cuffley Estate Agents",
    addressLines: ["1 Station Road", "Cuffley", "EN6 4HU"],
    phone: BANC_CONTACT,
    email: BANC_EMAIL,
    openingHours: ["Monday to Saturday: 9am to 6pm", "Sunday: Closed"],
    aliases: ["contact Banc", "Cuffley office", "opening hours", "phone number"],
  },
  mayfair: {
    id: "mayfair-office",
    title: "Mayfair Office",
    addressLines: ["121 Park Lane, Mayfair, W1K 7AG"],
    phone: BANC_MAYFAIR_CONTACT,
    email: BANC_EMAIL,
    openingHours: [],
    aliases: ["Mayfair office", "Mayfair phone number", "Park Lane office"],
  },
} as const satisfies Record<string, BancOfficeContact>;

const cuffleyOffice = BANC_OFFICES.cuffley;

export const BANC_CONTACT_DETAILS = [
  { label: "Address", lines: cuffleyOffice.addressLines, href: null },
  { label: "Phone", lines: [cuffleyOffice.phone.displayPhone], href: cuffleyOffice.phone.callHref },
  { label: "Email", lines: [cuffleyOffice.email.displayEmail], href: cuffleyOffice.email.mailtoHref },
  { label: "Opening Hours", lines: cuffleyOffice.openingHours, href: null },
] as const satisfies readonly BancContactDetail[];

function officeSection(office: BancOfficeContact): ApprovedBancSection {
  return {
    id: office.id,
    title: office.title,
    body: [
      "Address",
      ...office.addressLines,
      "Phone",
      office.phone.displayPhone,
      "Email",
      office.email.displayEmail,
      ...(office.openingHours.length > 0
        ? ["Opening Hours", ...office.openingHours]
        : []),
    ],
    aliases: office.aliases,
  };
}

export const BANC_TESTIMONIALS = [
  {
    text: "Andrew, Nitesh and Vicky sold my house quickly and efficiently. Very professional friendly team supported me through the process. I am a happy, satisfied customer and can highly recommend Banc estate agents.",
    author: "Iwona K.",
  },
  {
    text: "Highly recommend Banc. Nitesh, Andrew and Vicki were extremely helpful and responsive throughout. The sale of our property was managed very professionally and we were delighted with the overall service.",
    author: "H M.",
  },
  {
    text: "We have just sold our house through Banc Property Group and it was such a positive experience. I cannot speak highly enough of Andrew who couldn't have been more helpful. We achieved the asking price very quickly. If I am selling again I would go straight to Banc. Thank you to the whole team",
    author: "Dawn P.",
  },
] as const;

export const CONTACT_PAGE = {
  title: "Contact Banc",
  href: "/contact",
  sections: [
    officeSection(BANC_OFFICES.cuffley),
    officeSection(BANC_OFFICES.mayfair),
  ],
} as const satisfies ApprovedBancPage;
