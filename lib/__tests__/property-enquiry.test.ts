import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOfferEnquiry,
  buildViewingEnquiry,
  submitContactEnquiry,
} from "../property-enquiry.ts";

const property = {
  id: "BPGC/1479",
  title: "5 LITTLE BERKHAMSTED LANE",
  address: "Little Berkhamsted, Hertford",
  postcode: "SG13 8LY",
  price: "£1,250,000",
  department: "sales" as const,
};

test("viewing enquiries match the /api/contact schema and carry the property context", () => {
  const payload = buildViewingEnquiry(property, {
    name: "  Jane Doe ",
    email: " jane@example.com ",
    phone: "07700 900123",
    date: "2026-09-10",
    time: "10:30",
    specialRequests: "Parking needed",
  });

  assert.equal(payload.name, "Jane Doe");
  assert.equal(payload.email, "jane@example.com");
  assert.equal(payload.phone, "07700 900123");
  assert.equal(payload.subject, "Viewing request — BPGC/1479");
  assert.equal(payload.consent, true);
  assert.equal(payload.website, "");
  assert.ok(payload.subject.length <= 120);
  assert.ok(payload.message.length >= 10);
  for (const line of [
    "Property: 5 LITTLE BERKHAMSTED LANE",
    "Address: Little Berkhamsted, Hertford, SG13 8LY",
    "Reference: BPGC/1479",
    "Listing: https://bancproperty.com/sales/properties/BPGC%2F1479",
    "Preferred date: 2026-09-10",
    "Preferred time: 10:30",
    "Special requests: Parking needed",
  ]) {
    assert.ok(payload.message.includes(line), line);
  }
});

test("offer enquiries summarise the buyer position and never attach the file", () => {
  const payload = buildOfferEnquiry(property, {
    name: "John",
    email: "john@example.com",
    phone: "",
    amount: 1_187_500,
    position: "mortgage_in_principle",
    timescale: "1_month",
    chainFree: true,
    proofOfFundsFileName: "statement.pdf",
  });

  assert.equal(payload.phone, undefined);
  assert.equal(payload.subject, "Offer submission — BPGC/1479");
  assert.ok(payload.message.includes("Offer amount: £1,187,500"));
  assert.ok(payload.message.includes("Buying position: mortgage in principle"));
  assert.ok(payload.message.includes("Timescale: 1 month"));
  assert.ok(payload.message.includes("Chain free: Yes"));
  assert.ok(payload.message.includes("Mortgage in principle: No"));
  assert.ok(payload.message.includes("Proof of funds: statement.pdf"));
  assert.equal(Object.keys(payload).includes("proofOfFunds"), false);
});

test("submitContactEnquiry posts JSON and reports success or the API error", async () => {
  const calls: Array<{ input: string; body: unknown }> = [];
  const payload = buildViewingEnquiry(property, {
    name: "Jane",
    email: "jane@example.com",
    phone: "07700 900123",
    date: "2026-09-10",
    time: "10:30",
  });

  const ok = await submitContactEnquiry(async (input, init) => {
    calls.push({ input, body: JSON.parse(init.body) });
    return { ok: true, json: async () => ({ success: true }) };
  }, payload);
  assert.deepEqual(ok, { ok: true });
  assert.equal(calls[0].input, "/api/contact");
  assert.deepEqual(calls[0].body, payload);

  const rejected = await submitContactEnquiry(
    async () => ({ ok: false, json: async () => ({ success: false, error: "Too many requests" }) }),
    payload,
  );
  assert.deepEqual(rejected, { ok: false, error: "Too many requests" });

  const crashed = await submitContactEnquiry(async () => {
    throw new Error("network");
  }, payload);
  assert.equal(crashed.ok, false);
});
