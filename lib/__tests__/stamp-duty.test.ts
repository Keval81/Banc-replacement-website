import assert from "node:assert/strict";
import test from "node:test";

import { calculateStampDuty } from "../calculations.ts";

// Expected values per rates published on gov.uk / revenue.scot / gov.wales as of 2026-08-27.

test("England home mover pays 2% and 5% bands on a £500,000 purchase", () => {
  const result = calculateStampDuty(500000, "home-mover", "england");
  assert.equal(result.totalTax, 15000);
});

test("England first-time buyer pays nothing up to £300,000", () => {
  const result = calculateStampDuty(300000, "first-time", "england");
  assert.equal(result.totalTax, 0);
});

test("England first-time buyer pays 5% on the portion between £300,001 and £500,000", () => {
  const result = calculateStampDuty(500000, "first-time", "england");
  assert.equal(result.totalTax, 10000);
});

test("England first-time buyer relief is lost above £500,000", () => {
  const result = calculateStampDuty(600000, "first-time", "england");
  assert.equal(result.totalTax, 20000);
});

test("England additional property adds a 5% surcharge to every band", () => {
  const result = calculateStampDuty(300000, "additional-property", "england");
  assert.equal(result.totalTax, 20000);
});

test("Scotland home mover pays LBTT bands on a £300,000 purchase", () => {
  const result = calculateStampDuty(300000, "home-mover", "scotland");
  assert.equal(result.totalTax, 4600);
});

test("Scotland additional dwelling supplement is 8% of the full price", () => {
  const result = calculateStampDuty(300000, "additional-property", "scotland");
  assert.equal(result.totalTax, 28600);
});

test("Wales home mover pays 6% on the portion over £225,000", () => {
  const result = calculateStampDuty(300000, "home-mover", "wales");
  assert.equal(result.totalTax, 4500);
});

test("Wales additional property uses the banded higher rates from December 2024", () => {
  const result = calculateStampDuty(300000, "additional-property", "wales");
  assert.equal(result.totalTax, 19950);
});

test("zero and negative prices return no tax", () => {
  assert.equal(calculateStampDuty(0, "home-mover", "england").totalTax, 0);
  assert.equal(calculateStampDuty(-100, "home-mover", "england").totalTax, 0);
});
