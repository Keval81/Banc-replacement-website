import type { HandoffCategory } from "./contracts.ts";

export type FormLink = { title: string; href: string };

const CONTACT_FORM: FormLink = { title: "Send Banc a message", href: "/contact" };

/** The website form that handles a handoff. Banc asked for forms, not the phone, so every lead is captured in writing. */
export function formFor(reason: HandoffCategory, propertyId?: string): FormLink {
  const id = propertyId ? encodeURIComponent(propertyId) : null;
  switch (reason) {
    case "valuation":
      return { title: "Get your instant valuation", href: "/valuation" };
    case "viewing":
      return id ? { title: "Book a viewing", href: `/book-viewing/${id}` } : CONTACT_FORM;
    case "offer":
      return id ? { title: "Make an offer", href: `/make-offer/${id}` } : CONTACT_FORM;
    default:
      return CONTACT_FORM;
  }
}

export const contactForm = (): FormLink => ({ ...CONTACT_FORM });
