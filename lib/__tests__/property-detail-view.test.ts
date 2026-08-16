import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanDescriptionParagraphs,
  getAvailablePropertyMedia,
  getDisplayFact,
  getSafeExternalUrl,
  getWrappedGalleryIndex,
  isPropertyDetailPath,
} from "../property-detail-view.ts";

test("deduplicates description paragraphs while preserving their first occurrence", () => {
  assert.deepEqual(
    cleanDescriptionParagraphs("First paragraph.\n\nSecond paragraph.\n\n First   paragraph. "),
    ["First paragraph.", "Second paragraph."]
  );
});

test("normalises whitespace and omits empty description paragraphs", () => {
  assert.deepEqual(cleanDescriptionParagraphs("  A   bright home. \n\n \n\n Near the station. "), [
    "A bright home.",
    "Near the station.",
  ]);
});

test("treats description duplicates as case insensitive", () => {
  assert.deepEqual(cleanDescriptionParagraphs("A premium home.\n\na PREMIUM home."), [
    "A premium home.",
  ]);
});

test("omits meaningless property facts", () => {
  for (const value of [undefined, null, "", "  ", "Unknown", "N/A", "Not known", "-"]) {
    assert.equal(getDisplayFact(value), null);
  }
  assert.equal(getDisplayFact(" Freehold "), "Freehold");
});

test("accepts only absolute http and https media URLs", () => {
  assert.equal(getSafeExternalUrl(" https://example.com/brochure.pdf "), "https://example.com/brochure.pdf");
  assert.equal(getSafeExternalUrl("http://example.com/tour"), "http://example.com/tour");
  assert.equal(getSafeExternalUrl("javascript:alert(1)"), null);
  assert.equal(getSafeExternalUrl("/relative.pdf"), null);
  assert.equal(getSafeExternalUrl("not a url"), null);
});

test("returns only media tabs backed by live data in the intended order", () => {
  assert.deepEqual(
    getAvailablePropertyMedia({
      floorplans: [{ id: "fp-1" }],
      epcImageUrl: "https://example.com/epc.png",
      latitude: 51.71,
      longitude: -0.11,
    }),
    ["floorplan", "epc", "map"]
  );
  assert.deepEqual(
    getAvailablePropertyMedia({ floorplans: [], epcImageUrl: "", latitude: 51.71 }),
    []
  );
});

test("recognises sales and lettings detail routes but not results routes", () => {
  assert.equal(isPropertyDetailPath("/sales/properties/BPGC869"), true);
  assert.equal(isPropertyDetailPath("/lettings/properties/BPGC%201607/"), true);
  assert.equal(isPropertyDetailPath("/sales/properties"), false);
  assert.equal(isPropertyDetailPath("/contact"), false);
});

test("wraps gallery navigation in both directions", () => {
  assert.equal(getWrappedGalleryIndex(0, -1, 5), 4);
  assert.equal(getWrappedGalleryIndex(4, 1, 5), 0);
  assert.equal(getWrappedGalleryIndex(2, 1, 5), 3);
  assert.equal(getWrappedGalleryIndex(0, 1, 0), 0);
});

test("keeps a single-image gallery on its only image", () => {
  assert.equal(getWrappedGalleryIndex(0, -1, 1), 0);
  assert.equal(getWrappedGalleryIndex(0, 1, 1), 0);
});
