// Builds real enquiries for the book-viewing and make-offer flows. Both post
// to /api/contact, so the payload has to match that route's Zod schema
// exactly: name, email, phone?, subject, message, consent, website (honeypot,
// must stay empty).

import { buildPropertyHref, type LivePropertyDetail } from "./property-view.ts";

export interface ContactEnquiryPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent: true;
  website: "";
}

export type EnquiryProperty = Pick<
  LivePropertyDetail,
  "id" | "title" | "address" | "postcode" | "price" | "department"
>;

export interface ViewingEnquiryInput {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  specialRequests?: string;
}

export interface OfferEnquiryInput {
  name: string;
  email: string;
  phone: string;
  amount: number;
  position: string;
  timescale: string;
  mortgageInPrinciple?: boolean;
  chainFree?: boolean;
  additionalComments?: string;
  proofOfFundsFileName?: string;
}

export const ENQUIRY_SUBJECTS = {
  viewing: "Viewing request",
  offer: "Offer submission",
} as const;

function propertyLines(property: EnquiryProperty): string[] {
  const path = buildPropertyHref(property.department, property.id);
  return [
    `Property: ${property.title}`,
    `Address: ${property.address}${property.postcode ? `, ${property.postcode}` : ""}`,
    `Reference: ${property.id}`,
    `Listed price: ${property.price}`,
    `Listing: https://bancproperty.com${path}`,
  ];
}

function yesNo(value: boolean | undefined): string {
  return value ? "Yes" : "No";
}

function humanise(value: string): string {
  return value.replace(/_/g, " ");
}

export function buildViewingEnquiry(
  property: EnquiryProperty,
  input: ViewingEnquiryInput,
): ContactEnquiryPayload {
  const lines = [
    `Viewing request for ${property.title} (ref ${property.id}).`,
    "",
    ...propertyLines(property),
    "",
    `Preferred date: ${input.date}`,
    `Preferred time: ${input.time}`,
  ];
  const requests = input.specialRequests?.trim();
  if (requests) lines.push("", `Special requests: ${requests}`);

  return {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim() || undefined,
    subject: `${ENQUIRY_SUBJECTS.viewing} — ${property.id}`.slice(0, 120),
    message: lines.join("\n"),
    consent: true,
    website: "",
  };
}

export function buildOfferEnquiry(
  property: EnquiryProperty,
  input: OfferEnquiryInput,
): ContactEnquiryPayload {
  const lines = [
    `Offer of £${Math.round(input.amount).toLocaleString("en-GB")} for ${property.title} (ref ${property.id}).`,
    "",
    ...propertyLines(property),
    "",
    `Offer amount: £${Math.round(input.amount).toLocaleString("en-GB")}`,
    `Buying position: ${humanise(input.position)}`,
    `Timescale: ${humanise(input.timescale)}`,
    `Mortgage in principle: ${yesNo(input.mortgageInPrinciple)}`,
    `Chain free: ${yesNo(input.chainFree)}`,
    `Proof of funds: ${
      input.proofOfFundsFileName
        ? `${input.proofOfFundsFileName} (buyer will send on request)`
        : "not yet provided"
    }`,
  ];
  const comments = input.additionalComments?.trim();
  if (comments) lines.push("", `Additional comments: ${comments}`);

  return {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim() || undefined,
    subject: `${ENQUIRY_SUBJECTS.offer} — ${property.id}`.slice(0, 120),
    message: lines.join("\n"),
    consent: true,
    website: "",
  };
}

export type EnquirySubmitResult =
  | { ok: true }
  | { ok: false; error: string };

type EnquiryFetch = (
  input: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

const GENERIC_ERROR =
  "We couldn't send your enquiry just now. Please try again or call the office.";

export async function submitContactEnquiry(
  fetcher: EnquiryFetch,
  payload: ContactEnquiryPayload,
): Promise<EnquirySubmitResult> {
  try {
    const response = await fetcher("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    const success =
      response.ok &&
      typeof data === "object" &&
      data !== null &&
      (data as { success?: unknown }).success === true;
    if (success) return { ok: true };

    const error =
      typeof data === "object" &&
      data !== null &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : GENERIC_ERROR;
    return { ok: false, error };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}
