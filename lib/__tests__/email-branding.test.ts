import assert from "node:assert/strict";
import test from "node:test";

import { emailTemplates } from "../email.ts";

/**
 * The templates were written against a palette the site abandoned — #1DBFDD on
 * Montserrat — so an enquiry confirmation looked nothing like the site that
 * sent it. These hold them to BANC Brand Guidelines v1.0.
 */

const RETIRED = [/#1DBFDD/i, /#2C2F33/i, /Montserrat/i, /#0E8CAB/i];

const rendered = {
  contactConfirmation: emailTemplates.contactConfirmation({
    name: "Helen Mardle",
    subject: "Landlord — full management",
  }),
  contactNotification: emailTemplates.contactNotification({
    name: "Helen Mardle",
    email: "helen.mardle@icloud.com",
    phone: "07700 900771",
    subject: "Landlord — full management",
    message: "Two flats in Goffs Oak, currently managed elsewhere.",
  }),
  valuationConfirmation: emailTemplates.valuationConfirmation({
    firstName: "Daniel",
    address: "14 Tolmers Road, Cuffley",
  }),
  valuationNotification: emailTemplates.valuationNotification({
    firstName: "Daniel",
    lastName: "Okafor",
    email: "d.okafor@outlook.com",
    phone: "07700 900318",
    address: "14 Tolmers Road, Cuffley",
    postcode: "EN6 4DR",
    propertyType: "Semi-detached",
    bedrooms: "4",
    timeframe: "Within 3 months",
    message: "Extended at the back in 2021.",
  }),
};

test("no email still carries the retired brand", () => {
  for (const [name, email] of Object.entries(rendered)) {
    for (const pattern of RETIRED) {
      assert.doesNotMatch(email.html, pattern, `${name} still uses ${pattern}`);
    }
  }
});

test("every email is built from the guide's own colours", () => {
  for (const [name, email] of Object.entries(rendered)) {
    assert.match(email.html, /#1A1917/i, `${name}: missing Dark 900`);
    assert.match(email.html, /#4AC8E8/i, `${name}: missing Banc Sky`);
  }
});

test("filled buttons use Sky 800, never Sky itself", () => {
  // White on #4AC8E8 is 1.96:1 and fails the legal floor — the same decision
  // already taken across every CTA on the site.
  for (const [name, email] of Object.entries(rendered)) {
    const buttons = email.html.match(/background:\s*#4AC8E8[^;]*;[^"]*color:\s*#FFFFFF/gi);
    assert.equal(buttons, null, `${name}: a white-on-sky button fails contrast`);
  }
});

test("the guide's two typefaces are the ones asked for", () => {
  for (const [name, email] of Object.entries(rendered)) {
    assert.match(email.html, /Playfair Display/, `${name}: display face missing`);
    assert.match(email.html, /DM Sans/, `${name}: body face missing`);
    assert.match(email.html, /Georgia/, `${name}: needs a real serif fallback for Gmail`);
    assert.match(email.html, /Arial/, `${name}: needs a real sans fallback for Gmail`);
  }
});

test("a customer never gets a phone number they cannot use", () => {
  for (const name of ["contactConfirmation", "valuationConfirmation"] as const) {
    assert.match(rendered[name].html, /01707 877781/, `${name}: no office number`);
  }
});

test("nothing tells a customer a viewing is confirmed", () => {
  // The owner has not been asked yet. The old template said "Viewing Confirmed".
  assert.doesNotMatch(rendered.contactConfirmation.html, /viewing confirmed/i);
  assert.doesNotMatch(rendered.contactConfirmation.subject, /confirmed/i);
});

test("the team can reply straight into the enquiry", () => {
  for (const name of ["contactNotification", "valuationNotification"] as const) {
    assert.match(
      rendered[name].html,
      /reply/i,
      `${name}: should tell whoever opens it that reply reaches the enquirer`,
    );
  }
});

test("the enquirer's own words come back to them, so they know it arrived", () => {
  assert.match(rendered.contactConfirmation.html, /Landlord — full management/);
  assert.match(rendered.valuationConfirmation.html, /14 Tolmers Road, Cuffley/);
});

test("subject lines are useful in an inbox list", () => {
  assert.match(
    rendered.valuationNotification.subject,
    /14 Tolmers Road/,
    "the address is what makes a valuation lead findable",
  );
  assert.match(
    rendered.contactNotification.subject,
    /Helen Mardle/,
    "a bare 'New Contact Form Submission' tells the office nothing",
  );
});

test("every rendered email escapes what the visitor typed", () => {
  const hostile = emailTemplates.contactNotification({
    name: '<script>alert("x")</script>',
    email: "a@b.com",
    phone: "1",
    subject: "hi",
    message: "<img src=x onerror=alert(1)>",
  });
  // Escaped text still contains the words "onerror=" — inertly, as characters.
  // What matters is that no tag the visitor typed survives as a tag.
  assert.doesNotMatch(hostile.html, /<script>/i, "a public form must not relay markup");
  assert.doesNotMatch(hostile.html, /<img[^>]*onerror/i, "no live image tag may survive");
  assert.match(hostile.html, /&lt;script&gt;/, "the markup should arrive as visible text");
  assert.match(hostile.html, /&lt;img src=x onerror/, "and so should the image tag");
});
