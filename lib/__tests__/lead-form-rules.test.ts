import assert from "node:assert/strict";
import { test } from "node:test";

import {
  checkContactEnquiry,
  checkValuationStep,
  contactEnquirySchema,
  describeSubmitError,
  valuationRequestSchema,
} from "../lead-form-rules.ts";
import { buildViewingEnquiry } from "../property-enquiry.ts";

const VALUATION_LEAD = {
  firstName: "Keval",
  lastName: "",
  email: "keval@example.com",
  phone: "07946 640781",
  address: "7 Mount Drive, St Albans",
  postcode: "AL2 2NP",
  department: "lettings",
};

const FALLBACK = "That didn't send. Please call the office.";

test("a valuation request without a last name is still accepted, because the form marks it optional", () => {
  assert.equal(valuationRequestSchema.safeParse(VALUATION_LEAD).success, true);
});

test("the address step stops a partial postcode before the visitor reaches the contact step", () => {
  const problem = checkValuationStep("address", { ...VALUATION_LEAD, postcode: "AL2" });

  assert.match(problem ?? "", /postcode/i);
});

test("the address step ignores contact fields the visitor has not reached yet", () => {
  const problem = checkValuationStep("address", {
    address: VALUATION_LEAD.address,
    postcode: VALUATION_LEAD.postcode,
  });

  assert.equal(problem, null);
});

test("the contact step names the phone number when it is too short to call", () => {
  const problem = checkValuationStep("contact", { ...VALUATION_LEAD, phone: "07946" });

  assert.match(problem ?? "", /phone/i);
});

test("the contact step passes the details that reached the office in the live test", () => {
  assert.equal(checkValuationStep("contact", VALUATION_LEAD), null);
});

test("a contact enquiry whose message was cut below ten characters says so instead of failing silently", () => {
  const problem = checkContactEnquiry({
    name: "Keval",
    email: "keval@example.com",
    subject: "General Enquiry",
    message: "Call me",
    consent: true,
  });

  assert.match(problem ?? "", /message/i);
});

test("a server validation failure is described by its field messages, never as 'Validation failed'", () => {
  const described = describeSubmitError(
    {
      success: false,
      error: "Validation failed",
      details: [
        { path: ["postcode"], message: "Please enter a full postcode, like EN6 4HU" },
        { path: ["phone"], message: "Please enter a phone number we can call" },
      ],
    },
    FALLBACK,
  );

  assert.doesNotMatch(described, /validation failed/i);
  assert.match(described, /postcode/i);
  assert.match(described, /phone/i);
});

test("a server error without field details is shown as the server wrote it", () => {
  const described = describeSubmitError(
    { success: false, error: "We could not send your request just now. Please call us on 01707 877781." },
    FALLBACK,
  );

  assert.match(described, /01707 877781/);
});

test("an unreadable response falls back to the caller's message rather than showing nothing", () => {
  assert.equal(describeSubmitError(null, FALLBACK), FALLBACK);
  assert.equal(describeSubmitError({ success: false }, FALLBACK), FALLBACK);
});

test("a viewing enquiry from a visitor with a two-letter name passes the shared contact rules", () => {
  const payload = buildViewingEnquiry(
    {
      id: "BPGC1987",
      title: "Reynards Road, Welwyn",
      address: "Reynards Road, Welwyn",
      postcode: "AL6 9TP",
      price: "£650,000",
      department: "sales",
    },
    { name: "Jo", email: "jo@example.com", phone: "07700 900123", date: "2026-09-20", time: "10:00" },
  );

  assert.equal(contactEnquirySchema.safeParse(payload).success, true);
});
