import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const sections = join(import.meta.dirname, "..", "..", "app", "sections");
const read = (file: string) => readFileSync(join(sections, file), "utf8");
const featured = read("FeaturedListings.tsx");
const services = read("Services.tsx");
const alerts = read("PropertyAlerts.tsx");
const testimonials = read("Testimonials.tsx");

test("homepage sections are numbered in the order they appear", () => {
  assert.match(read("PropertySearch.tsx"), />01</);
  assert.match(featured, /number="02"/);
  assert.match(services, /number="03"/);
  assert.match(alerts, /number="04"/);
  assert.match(testimonials, /number="05"/);
  assert.match(services, /number: "3\.1"/);
  assert.doesNotMatch(services, /number: "1\.\d"/);
});

test("homepage sections use the tighter phone padding", () => {
  for (const source of [featured, services, alerts, testimonials]) {
    assert.doesNotMatch(source, /(?<![:\w-])py-20/);
    assert.match(source, /(?<![:\w-])py-12/);
  }
});

test("the alerts form uses the shared field and action styles", () => {
  assert.match(alerts, /from "@\/components\/ui\/form-styles"/);
  assert.match(alerts, /fieldControl/);
  assert.match(alerts, /actionPrimary/);
});

test("the magazine card gives its text the full width on phones", () => {
  assert.match(alerts, /lg:max-w-\[58%\]/);
  assert.doesNotMatch(alerts, /className="relative max-w-\[58%\]"/);
});
