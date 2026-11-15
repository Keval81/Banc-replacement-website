import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const form = readFileSync(
  join(import.meta.dirname, "..", "..", "app", "valuation", "ValuationPageClient.tsx"),
  "utf8",
);
const stepTwo = form.slice(form.indexOf("case 2:"), form.indexOf("case 3:"));

test("the property details step cannot be skipped", () => {
  // SanSan, 15 Nov 2026: the estimate depends on these answers, so a visitor
  // who skips them gets a different figure for the same home.
  assert.doesNotMatch(stepTwo, /return true; \/\/ Property details are optional/);
  assert.match(stepTwo, /!formData\.propertyType/);
  assert.match(stepTwo, /!formData\.bedrooms/);
  assert.match(stepTwo, /!isLettings && majorWork === null/);
});

test("each required detail tells the visitor what is missing", () => {
  assert.match(stepTwo, /Please choose your property type/);
  assert.match(stepTwo, /Please choose the number of bedrooms/);
  assert.match(stepTwo, /Please tell us whether the home has been extended or refurbished/);
});

test("the required details are marked like the other required fields", () => {
  assert.match(form, /<label htmlFor="propertyType" className=\{fieldLabel\}>Property Type \*<\/label>/);
  assert.match(form, /id="propertyType"/);
  assert.match(form, />Bedrooms \*</);
});

test("a message about a detail that has since been answered does not carry onto the next step", () => {
  assert.match(form, /if \(validateStep\(currentStep\)\) \{\s*\/\/[^\n]*\n\s*setError\(null\);/);
});
