import assert from "node:assert/strict";
import test from "node:test";

import { emailTemplates } from "../email.ts";

const estimate = { figure: 1_000_000, low: 900_000, high: 1_100_000, confidence: "high" as const, comparableCount: 12, ownSale: { date: "2019-05-01", price: 820_000, indexed: 990_000 }, comparables: [], indexMonth: "2026-08" };

test("a sales valuation confirmation leads with the figure, then the range and confidence, with the caveat Nitesh asked for", () => {
  const mail = emailTemplates.valuationConfirmation({ firstName: "David", address: "14 The Ridgeway, Cuffley", department: "sales", estimate });
  assert.match(mail.html, /About £1,000,000/);
  assert.match(mail.html, /£900,000 – £1,100,000/);
  assert.match(mail.html, /High confidence/);
  assert.match(mail.html, /2019 sale/);
  assert.match(mail.html, /12 similar sales/);
  assert.match(mail.html, /one of the directors will call/i);
});

test("with no estimate the confirmation invents nothing and still promises the call", () => {
  const mail = emailTemplates.valuationConfirmation({ firstName: "David", address: "14 The Ridgeway, Cuffley", department: "sales", estimate: null });
  assert.doesNotMatch(mail.html, /£\d/);
  assert.match(mail.html, /one of the directors will call/i);
});

test("a lettings request reads as a rental appraisal, with no figure", () => {
  const mail = emailTemplates.valuationConfirmation({ firstName: "Priya", address: "3 Station Road, Cuffley", department: "lettings", estimate: null });
  assert.match(mail.subject, /rental/i);
  assert.match(mail.html, /rent/i);
  assert.doesNotMatch(mail.html, /£\d/);
});

test("the team email says which team it is for and carries the estimate the customer saw", () => {
  const base = { firstName: "David", lastName: "Okafor", email: "d@example.com", phone: "07700 900456", address: "14 The Ridgeway", postcode: "EN6 4BB", propertyType: "Detached House", bedrooms: "4", timeframe: "Within 3 months" };
  const sales = emailTemplates.valuationNotification({ ...base, department: "sales", estimate });
  assert.match(sales.subject, /^Valuation —/);
  assert.match(sales.html, /About £1,000,000 \(£900,000 – £1,100,000\), high confidence, 12 sales/);
  const lets = emailTemplates.valuationNotification({ ...base, department: "lettings", estimate: null });
  assert.match(lets.subject, /^Rental valuation —/);
  assert.doesNotMatch(lets.html, /£\d/);
});

test("a low-confidence estimate is emailed as a range only, never a single figure", () => {
  const mail = emailTemplates.valuationConfirmation({ firstName: "David", address: "14 The Ridgeway, Cuffley", department: "sales", estimate: { ...estimate, confidence: "low" } });
  assert.doesNotMatch(mail.html, /About £/);
  assert.match(mail.html, /£900,000 – £1,100,000/);
});
