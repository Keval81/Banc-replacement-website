import assert from "node:assert/strict";
import test from "node:test";

import { buildNewsletterEnquiry } from "../newsletter-enquiry.ts";

test("sends the sign-up to the office inbox with reply-to on the subscriber", () => {
  const mail = buildNewsletterEnquiry(
    { email: "jo@example.com", firstName: "Jo", lastName: "Bloggs", location: "Cuffley", minPrice: 500000, maxPrice: 750000, bedrooms: 3, preferences: { newProperties: true, priceDrops: true, blogPosts: false } },
    "info@bancproperty.com",
  );
  assert.equal(mail.team.to, "info@bancproperty.com");
  assert.equal(mail.team.replyTo, "jo@example.com");
  assert.match(mail.team.subject, /Newsletter sign-up/);
  assert.match(mail.team.html, /Jo Bloggs/);
  assert.match(mail.team.html, /Cuffley/);
  assert.match(mail.team.html, /£500,000 – £750,000/);
  assert.match(mail.team.html, /Bedrooms: 3\+/);
  assert.match(mail.team.html, /new properties, price drops/);
});

test("confirms to the subscriber, replying to the office", () => {
  const mail = buildNewsletterEnquiry({ email: "jo@example.com" }, "info@bancproperty.com");
  assert.equal(mail.customer.to, "jo@example.com");
  assert.equal(mail.customer.replyTo, "info@bancproperty.com");
  assert.match(mail.customer.html, /Thanks, Newsletter/);
});

test("copes with an email-only sign-up", () => {
  const mail = buildNewsletterEnquiry({ email: "jo@example.com" }, "info@bancproperty.com");
  assert.match(mail.team.html, /Newsletter subscriber signed up/);
  assert.doesNotMatch(mail.team.html, /Budget|Bedrooms|Wants/);
});
