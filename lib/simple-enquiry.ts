/**
 * Pure helpers behind `SimpleEnquiryForm`: they turn a page's field list and
 * the visitor's answers into the JSON `POST /api/contact` accepts.
 *
 * Name, email and phone travel as top-level API fields; every other answer is
 * written into the message as "Label: value" so the office reads the whole
 * enquiry in one email.
 */

export type SimpleEnquiryFieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "date"
  | "time"
  | "datetime-local"
  | "select";

export interface SimpleEnquiryField {
  name: string;
  label: string;
  type: SimpleEnquiryFieldType;
  required?: boolean;
  placeholder?: string;
  /** `select` only. The chosen option text is what the office reads. */
  options?: readonly string[];
  /** `textarea` only. */
  rows?: number;
  /** Consecutive "half" fields share a two-column row on wider screens. */
  span?: "half" | "full";
}

export type SimpleEnquiryValues = Record<string, string | undefined>;

/**
 * A template such as "Career enquiry — {name}" (placeholders resolve from the
 * values, `{name}` from the composed name), or a function for client callers.
 */
export type SimpleEnquirySubject = string | ((values: SimpleEnquiryValues) => string);

export interface SimpleEnquiryPayload {
  name: string;
  email: string;
  phone: string | undefined;
  subject: string;
  message: string;
  consent: true;
  website: string;
}

/** Sent as top-level API fields, so never repeated inside the message. */
const CONTACT_FIELD_NAMES = new Set(["name", "firstName", "lastName", "email", "phone", "website"]);

export const MIN_MESSAGE_LENGTH = 10;
export const MAX_SUBJECT_LENGTH = 120;

const clean = (value: string | undefined) => (value ?? "").trim();

export function buildSimpleEnquiryName(values: SimpleEnquiryValues): string {
  const single = clean(values.name);
  if (single) return single;
  return [clean(values.firstName), clean(values.lastName)].filter(Boolean).join(" ");
}

function formatValue(field: SimpleEnquiryField, value: string | undefined): string {
  const text = clean(value);
  return field.type === "datetime-local" ? text.replace("T", " ") : text;
}

export function buildSimpleEnquiryMessage(
  fields: readonly SimpleEnquiryField[],
  values: SimpleEnquiryValues,
  intro?: string
): string {
  const lines = fields
    .filter((field) => !CONTACT_FIELD_NAMES.has(field.name))
    .flatMap((field) => {
      const value = formatValue(field, values[field.name]);
      return value ? [`${field.label}: ${value}`] : [];
    });

  const lead = clean(intro);
  const message = (lead ? [lead, "", ...lines] : lines).join("\n").trim();
  if (message.length >= MIN_MESSAGE_LENGTH) return message;

  return [message, "No further details were given."].filter(Boolean).join("\n");
}

export function formatSimpleEnquirySubject(
  subject: SimpleEnquirySubject,
  values: SimpleEnquiryValues
): string {
  const resolved: SimpleEnquiryValues = { ...values, name: buildSimpleEnquiryName(values) };
  const text =
    typeof subject === "function"
      ? subject(resolved)
      : subject.replace(/\{(\w+)\}/g, (_, key: string) => clean(resolved[key]));

  return text
    .replace(/\s+[—–-]\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, MAX_SUBJECT_LENGTH);
}

export function buildSimpleEnquiryPayload({
  fields,
  values,
  subject,
  intro,
}: {
  fields: readonly SimpleEnquiryField[];
  values: SimpleEnquiryValues;
  subject: SimpleEnquirySubject;
  intro?: string;
}): SimpleEnquiryPayload {
  return {
    name: buildSimpleEnquiryName(values),
    email: clean(values.email),
    phone: clean(values.phone) || undefined,
    subject: formatSimpleEnquirySubject(subject, values),
    message: buildSimpleEnquiryMessage(fields, values, intro),
    consent: true,
    website: values.website ?? "",
  };
}
