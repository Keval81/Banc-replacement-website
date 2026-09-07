import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { CMP_CERTIFICATE_URL, COMPLAINTS_PROCEDURE_URL, FEES_TO_LANDLORDS_URL, FEES_TO_TENANTS_URL } from "../banc-contact.ts";
import { TENANT_FEES } from "../banc-content/tenants-guide.ts";

test("every document the site links to is a real PDF in public/", () => {
  for (const url of [CMP_CERTIFICATE_URL, COMPLAINTS_PROCEDURE_URL, FEES_TO_LANDLORDS_URL, FEES_TO_TENANTS_URL]) {
    assert.match(url, /^\/documents\/.*\.pdf$/);
    assert.ok(existsSync(join(import.meta.dirname, "..", "..", "public", url)), `missing ${url}`);
  }
});

test("the tenant fees on the site are Banc's published schedule, not invented ones", () => {
  const byTitle = Object.fromEntries(TENANT_FEES.map((fee) => [fee.title, fee.amount]));
  assert.match(byTitle["Amendment Fee"], /£50/);
  assert.match(byTitle["Call-outs caused by the tenant"], /£30 per hour/);
  assert.match(byTitle["Lost Keys or Security Devices"], /£20 admin/);
  assert.match(byTitle["Late Rent"], /3% above/);
  for (const fee of TENANT_FEES) {
    assert.doesNotMatch(fee.amount + fee.description, /£100 \(incl|£15\/hr|£15 per hour/, `${fee.title} still carries a figure Banc never published`);
  }
});
