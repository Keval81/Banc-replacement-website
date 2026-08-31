import { BANC_CONTACT } from "../banc-contact.ts";
import type { ApprovedBancPage } from "./types.ts";

export interface BancContactDetail {
  label: string;
  lines: readonly string[];
  href: string | null;
}

export const BANC_CONTACT_DETAILS = [
  { label: "Address", lines: ["1 Station Road", "Cuffley", "EN6 4HU"], href: null },
  { label: "Phone", lines: [BANC_CONTACT.displayPhone], href: BANC_CONTACT.callHref },
  { label: "Email", lines: ["info@bancproperty.com"], href: "mailto:info@bancproperty.com" },
  { label: "Opening Hours", lines: ["Monday to Saturday: 9am to 6pm", "Sunday: Closed"], href: null },
] as const satisfies readonly BancContactDetail[];

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
    {
      id: "cuffley-office",
      title: "Cuffley Estate Agents",
      body: BANC_CONTACT_DETAILS.flatMap((detail) => [
        detail.label,
        ...detail.lines,
      ]),
      aliases: ["contact Banc", "Cuffley office", "opening hours", "phone number"],
    },
  ],
} as const satisfies ApprovedBancPage;
