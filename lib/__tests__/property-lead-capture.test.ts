import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { buildPropertyLeadActions } from "../property-view.ts";
import { BANC_ENQUIRY_INBOXES, enquiryInboxFor } from "../banc-contact.ts";

const root = join(import.meta.dirname, "..", "..");

// A mailto: link is not lead capture. It needs a configured mail client, which
// plenty of visitors on a phone or webmail simply do not have — for them the
// button does nothing at all. Nothing reaches the database, no date or time is
// asked for, and the enquirer gets no confirmation. The booking page already
// exists and does all of that; it just was not linked to.
test("the property enquiry CTA opens the booking flow, not a mail client", () => {
  for (const department of ["sales", "lettings"] as const) {
    const actions = buildPropertyLeadActions(department, "BPGC1116");
    assert.doesNotMatch(
      actions.primaryHref,
      /^mailto:/,
      `${department}: the primary CTA must not be a mailto link`,
    );
    assert.match(
      actions.primaryHref,
      /^\/book-viewing\/BPGC1116/,
      `${department}: the primary CTA must open the booking page for that property`,
    );
  }
});

test("the booking page a property links to is actually reachable", () => {
  // The page existed for weeks with nothing pointing at it, which is the same
  // way the calculators ended up footer-only.
  const actions = buildPropertyLeadActions("sales", "BPGC1116");
  const route = actions.primaryHref.split("?")[0].replace("/BPGC1116", "/[propertyId]");
  assert.ok(
    readFileSync(join(root, "app", route, "page.tsx"), "utf8").length > 0,
    `no page backs ${actions.primaryHref}`,
  );
});

test("viewing enquiries route to the department that can answer them", () => {
  assert.equal(enquiryInboxFor("sales"), BANC_ENQUIRY_INBOXES.sales);
  assert.equal(enquiryInboxFor("lettings"), BANC_ENQUIRY_INBOXES.lettings);
  assert.notEqual(
    BANC_ENQUIRY_INBOXES.sales,
    BANC_ENQUIRY_INBOXES.lettings,
    "sales and lettings enquiries should not land in the same tray once the real addresses arrive",
  );
});

test("no placeholder address can ship in the enquiry inboxes", () => {
  // The real sales and lettings addresses are still owed by Nitesh (N2). This
  // is the same guard the phone lines carry: a stand-in must never go live.
  for (const [department, address] of Object.entries(BANC_ENQUIRY_INBOXES)) {
    assert.match(address, /^[^\s@]+@bancproperty\.com$/, `${department}: ${address}`);
    assert.doesNotMatch(
      address,
      /example|placeholder|test|todo|change-?me/i,
      `${department}: ${address} looks like a placeholder`,
    );
  }
});

test("a viewing enquiry carries the department that has to answer it", async () => {
  const { buildViewingEnquiry } = await import("../property-enquiry.ts");
  const property = {
    id: "BPGC1116",
    title: "Tolmers Road, Cuffley",
    address: "Tolmers Road, Cuffley",
    postcode: "EN6",
    price: "£750,000",
    department: "lettings" as const,
  };
  const payload = buildViewingEnquiry(property, {
    name: "A Tenant",
    email: "tenant@example.com",
    phone: "01707 877781",
    date: "2026-09-12",
    time: "10:00",
  });

  // Without this the API cannot tell sales from lettings, and every enquiry
  // lands in one tray regardless of which team can act on it.
  assert.equal(payload.department, "lettings");
  assert.match(payload.message, /Preferred date: 2026-09-12/);
  assert.match(payload.message, /Preferred time: 10:00/);
});
