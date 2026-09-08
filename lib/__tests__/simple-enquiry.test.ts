import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildSimpleEnquiryMessage,
  buildSimpleEnquiryName,
  buildSimpleEnquiryPayload,
  formatSimpleEnquirySubject,
  MAX_SUBJECT_LENGTH,
  MIN_MESSAGE_LENGTH,
  type SimpleEnquiryField,
} from "../simple-enquiry.ts";

const FIELDS: SimpleEnquiryField[] = [
  { name: "firstName", label: "First Name", type: "text", required: true },
  { name: "lastName", label: "Last Name", type: "text", required: true },
  { name: "phone", label: "Phone Number", type: "tel" },
  { name: "email", label: "Email Address", type: "email", required: true },
  { name: "propertyAddress", label: "Property Address", type: "text" },
  {
    name: "discuss",
    label: "What would you like to discuss?",
    type: "select",
    options: ["Selling My Property", "Other"],
    required: true,
  },
  { name: "when", label: "Preferred Date & Time", type: "datetime-local" },
  { name: "message", label: "Additional Message", type: "textarea" },
];

test("labels every filled field, in form order", () => {
  const message = buildSimpleEnquiryMessage(FIELDS, {
    message: "Keen to move before Christmas.",
    discuss: "Selling My Property",
    propertyAddress: "1 Station Road, Cuffley",
  });

  assert.equal(
    message,
    [
      "Property Address: 1 Station Road, Cuffley",
      "What would you like to discuss?: Selling My Property",
      "Additional Message: Keen to move before Christmas.",
    ].join("\n")
  );
});

test("skips empty and whitespace-only optional fields", () => {
  const message = buildSimpleEnquiryMessage(FIELDS, {
    propertyAddress: "   ",
    discuss: "Other",
    when: "",
  });

  assert.equal(message, "What would you like to discuss?: Other");
});

test("keeps name, email and phone out of the message body", () => {
  const message = buildSimpleEnquiryMessage(FIELDS, {
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    phone: "01707 877781",
    discuss: "Selling My Property",
  });

  assert.doesNotMatch(message, /John|Smith|john@example\.com|01707/);
});

test("puts the intro line first, separated from the fields", () => {
  const message = buildSimpleEnquiryMessage(
    FIELDS,
    { discuss: "Other" },
    "Appointment request from the Cuffley office page."
  );

  assert.equal(
    message,
    "Appointment request from the Cuffley office page.\n\nWhat would you like to discuss?: Other"
  );
});

test("pads a message shorter than the API minimum so it is not rejected", () => {
  const fields: SimpleEnquiryField[] = [{ name: "note", label: "Note", type: "textarea" }];

  const message = buildSimpleEnquiryMessage(fields, { note: "x" });

  assert.ok(message.length >= MIN_MESSAGE_LENGTH, `too short: "${message}"`);
  assert.ok(message.startsWith("Note: x"));

  const empty = buildSimpleEnquiryMessage(fields, {});
  assert.ok(empty.length >= MIN_MESSAGE_LENGTH, `too short: "${empty}"`);
});

test("writes a datetime-local value as a readable date and time", () => {
  const message = buildSimpleEnquiryMessage(FIELDS, { when: "2026-09-10T14:30" });

  assert.equal(message, "Preferred Date & Time: 2026-09-10 14:30");
});

test("combines first and last name, or uses a single name field", () => {
  assert.equal(buildSimpleEnquiryName({ firstName: " John ", lastName: "Smith" }), "John Smith");
  assert.equal(buildSimpleEnquiryName({ firstName: "Cher" }), "Cher");
  assert.equal(buildSimpleEnquiryName({ name: "  Jane Doe " }), "Jane Doe");
  assert.equal(buildSimpleEnquiryName({}), "");
});

test("subject templates fill placeholders from the values, name included", () => {
  assert.equal(
    formatSimpleEnquirySubject("Career enquiry — {name}", { name: "Jane Doe" }),
    "Career enquiry — Jane Doe"
  );
  assert.equal(
    formatSimpleEnquirySubject("Complaint — {nature}", { nature: "Fees or Charges" }),
    "Complaint — Fees or Charges"
  );
});

test("subject templates drop a trailing separator when the placeholder is empty", () => {
  assert.equal(formatSimpleEnquirySubject("Complaint — {nature}", {}), "Complaint");
});

test("subjects are capped at the API limit", () => {
  const long = formatSimpleEnquirySubject("Career enquiry — {name}", { name: "x".repeat(200) });

  assert.equal(long.length, MAX_SUBJECT_LENGTH);
});

test("payload sends contact details top-level and everything else in the message", () => {
  const payload = buildSimpleEnquiryPayload({
    fields: FIELDS,
    values: {
      firstName: "John",
      lastName: "Smith",
      email: " john@example.com ",
      phone: "",
      discuss: "Selling My Property",
      website: "",
    },
    subject: "Appointment request — Cuffley office — {discuss}",
    intro: "Appointment request from the Cuffley office page.",
  });

  assert.deepEqual(payload, {
    name: "John Smith",
    email: "john@example.com",
    phone: undefined,
    subject: "Appointment request — Cuffley office — Selling My Property",
    message:
      "Appointment request from the Cuffley office page.\n\nWhat would you like to discuss?: Selling My Property",
    consent: true,
    website: "",
  });
});

test("payload keeps a filled phone and forwards whatever the honeypot holds", () => {
  const payload = buildSimpleEnquiryPayload({
    fields: FIELDS,
    values: { name: "Jane Doe", email: "jane@example.com", phone: " 01707 877781 ", website: "http://spam" },
    subject: (values) => `Career enquiry — ${values.name}`,
  });

  assert.equal(payload.phone, "01707 877781");
  assert.equal(payload.subject, "Career enquiry — Jane Doe");
  assert.equal(payload.website, "http://spam");
});
