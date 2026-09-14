import { z } from "zod";

// One set of rules shared by the lead forms and the routes that receive them,
// so a form can never let through something its route will reject and leave
// the visitor staring at a bare "Validation failed".

export const contactEnquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(254),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(1, "Please select a subject").max(120),
  message: z
    .string()
    .trim()
    .min(10, "Please add a little more to your message (at least 10 characters)")
    .max(5000),
  consent: z.boolean().refine((val) => val === true, {
    message: "Please tick the box to confirm we may contact you",
  }),
  website: z.string().max(0).optional(), // honeypot
  // Set by property enquiries so the lead reaches the team that can act on
  // it. Absent on the general contact form, which still goes to the office.
  department: z.enum(["sales", "lettings"]).optional(),
});

const FULL_POSTCODE = "Please enter the full postcode, like EN6 4HU";

export const valuationRequestSchema = z.object({
  firstName: z.string().trim().min(1, "Please enter your first name").max(80),
  // The form marks it optional; a lead is never turned away over a surname.
  lastName: z.string().trim().max(80).optional(),
  email: z.string().trim().email("Please enter a valid email address").max(254),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((value) => value.replace(/\D/g, "").length >= 10, {
      message: "Please enter a phone number we can call, like 07700 900123",
    }),
  address: z.string().trim().min(5, "Please enter the property address").max(300),
  postcode: z.string().trim().min(5, FULL_POSTCODE).max(10, FULL_POSTCODE),
  propertyType: z.string().trim().max(60).optional(),
  bedrooms: z.string().trim().max(10).optional(),
  timeframe: z.string().trim().max(60).optional(),
  message: z.string().trim().max(5000).optional(),
  // "sell" or "let" — the form asks first. Lettings go to the lettings team and
  // get no online figure; there is no public source of rental comparables.
  department: z.enum(["sales", "lettings"]).default("sales"),
  website: z.string().max(0).optional(), // honeypot
});

type Issues = readonly { message: string }[];

const firstProblem = (issues: Issues) => issues[0]?.message ?? "Please check the form and try again.";

export function checkValuationStep(
  step: "address" | "contact",
  values: Record<string, unknown>,
): string | null {
  const schema =
    step === "address"
      ? valuationRequestSchema.pick({ address: true, postcode: true })
      : valuationRequestSchema.pick({ firstName: true, lastName: true, email: true, phone: true });
  const result = schema.safeParse(values);
  return result.success ? null : firstProblem(result.error.issues);
}

export function checkContactEnquiry(values: Record<string, unknown>): string | null {
  const result = contactEnquirySchema.safeParse(values);
  return result.success ? null : firstProblem(result.error.issues);
}

const GENERIC_VALIDATION_ERROR = "Validation failed";

/**
 * What to tell the visitor when a lead route says no: the field messages when
 * the route lists them, the route's own wording when it explains itself (a
 * delivery failure carries the office number), otherwise the caller's fallback.
 */
export function describeSubmitError(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const { error, details } = body as { error?: unknown; details?: unknown };

  const messages = Array.isArray(details)
    ? details.flatMap((issue) => {
        const message = (issue as { message?: unknown } | null)?.message;
        return typeof message === "string" && message.trim() ? [message.trim()] : [];
      })
    : [];
  if (messages.length) return [...new Set(messages)].join(". ");

  if (typeof error === "string" && error.trim() && error !== GENERIC_VALIDATION_ERROR) return error;
  return fallback;
}
