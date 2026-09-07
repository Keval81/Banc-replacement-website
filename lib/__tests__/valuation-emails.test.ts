import assert from "node:assert/strict";
import test from "node:test";

import { emailTemplates } from "../email.ts";

const estimate = { low: 950_000, high: 1_050_000, sampleSize: 12, basis: "type" as const, sector: "EN6 4", monthsBack: 24 };

test("a sales valuation confirmation shows the range with the caveat Nitesh asked for", () => {
  const mail = emailTemplates.valuationConfirmation({ firstName: "David", address: "14 The Ridgeway, Cuffley", department: "sales", estimate });
  assert.match(mail.html, /£950,000 – £1,050,000/);
  assert.match(mail.html, /estimate/i);
  assert.match(mail.html, /12 sales/);
  assert.match(mail.html, /EN6 4/);
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
  assert.match(sales.html, /£950,000 – £1,050,000/);
  const lets = emailTemplates.valuationNotification({ ...base, department: "lettings", estimate: null });
  assert.match(lets.subject, /^Rental valuation —/);
  assert.doesNotMatch(lets.html, /£\d/);
});
