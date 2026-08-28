import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanDescriptionParagraphs,
  getAvailablePropertyMedia,
  getAvailablePropertyMediaModes,
  getDisplayCount,
  getDisplayFact,
  getNextPropertyMediaMode,
  getPropertyResultsBackLink,
  getPropertyPhotoPresentation,
  getSafeExternalUrl,
  getSafePropertyImageUrl,
  getWrappedGalleryIndex,
  isPropertyDetailPath,
} from "../property-detail-view.ts";

test("moves, wraps and jumps through available property media modes", () => {
  const modes = ["photos", "floorplan", "map"] as const;
  assert.equal(getNextPropertyMediaMode(modes, "photos", "ArrowLeft"), "map");
  assert.equal(getNextPropertyMediaMode(modes, "map", "ArrowRight"), "photos");
  assert.equal(getNextPropertyMediaMode(modes, "map", "Home"), "photos");
  assert.equal(getNextPropertyMediaMode(modes, "floorplan", "End"), "map");
});

test("keeps EPC out of the media stage while ordering live visual modes", () => {
  assert.deepEqual(
    getAvailablePropertyMediaModes({
      images: [{ id: "photo-1" }],
      floorplans: [{ id: "floorplan-1" }],
      latitude: 51.7252,
      longitude: -0.2049,
    }),
    ["photos", "floorplan", "map"]
  );
});

test("selects the first real non-photo medium when photos are unavailable", () => {
  assert.deepEqual(
    getAvailablePropertyMediaModes({
      images: [],
      floorplans: [{ id: "floorplan-1" }],
      latitude: 51.7252,
      longitude: -0.2049,
    }),
    ["floorplan", "map"]
  );
});

test("returns no media modes when the property has no media", () => {
  assert.deepEqual(
    getAvailablePropertyMediaModes({
      images: [],
      floorplans: [],
    }),
    []
  );
});

test("builds department-correct property results back links", () => {
  assert.deepEqual(getPropertyResultsBackLink("sales"), {
    href: "/sales/properties",
    label: "Back to properties",
  });
  assert.deepEqual(getPropertyResultsBackLink("lettings"), {
    href: "/lettings/properties",
    label: "Back to properties",
  });
});

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

test("omits invalid property counts", () => {
  assert.equal(getDisplayCount(0), null);
  assert.equal(getDisplayCount(-1), null);
  assert.equal(getDisplayCount(Number.NaN), null);
  assert.equal(getDisplayCount(4), 4);
});

test("accepts only absolute http and https media URLs", () => {
  assert.equal(getSafeExternalUrl(" https://example.com/brochure.pdf "), "https://example.com/brochure.pdf");
  assert.equal(getSafeExternalUrl("http://example.com/tour"), "http://example.com/tour");
  assert.equal(getSafeExternalUrl("javascript:alert(1)"), null);
  assert.equal(getSafeExternalUrl("/relative.pdf"), null);
  assert.equal(getSafeExternalUrl("not a url"), null);
});

test("accepts only property image hosts configured for Next Image", () => {
  assert.equal(
    getSafePropertyImageUrl(" http://med05.expertagent.co.uk/a/photo.jpg "),
    "http://med05.expertagent.co.uk/a/photo.jpg"
  );
  assert.equal(
    getSafePropertyImageUrl("https://media.expertagent.co.uk/a/floorplan.gif"),
    "https://media.expertagent.co.uk/a/floorplan.gif"
  );
  assert.equal(getSafePropertyImageUrl("https://future-streets.example/photo.jpg"), null);
  assert.equal(getSafePropertyImageUrl("https://expertagent.co.uk/photo.jpg"), null);
  assert.equal(getSafePropertyImageUrl("FP1.gif"), null);
  assert.equal(getSafePropertyImageUrl("zip://archive/FP1.gif"), null);
});

test("returns only floorplan and map tabs backed by live media data", () => {
  assert.deepEqual(
    getAvailablePropertyMedia({
      floorplans: [{ id: "fp-1" }],
      latitude: 51.71,
      longitude: -0.11,
    }),
    ["floorplan", "map"]
  );
  assert.deepEqual(
    getAvailablePropertyMedia({ floorplans: [], latitude: 51.71 }),
    []
  );
});

test("treats zero as a valid coordinate when both coordinates exist", () => {
  assert.deepEqual(
    getAvailablePropertyMedia({ floorplans: [], latitude: 0, longitude: 0 }),
    ["map"]
  );
});

test("recognises sales and lettings detail routes but not results routes", () => {
  assert.equal(isPropertyDetailPath("/sales/properties/BPGC869"), true);
  assert.equal(isPropertyDetailPath("/lettings/properties/BPGC%201607/"), true);
  assert.equal(isPropertyDetailPath("/sales/properties"), false);
  assert.equal(isPropertyDetailPath("/contact"), false);
});

test("does not classify nested or malformed routes as property details", () => {
  assert.equal(isPropertyDetailPath("/sales/properties/BPGC869/gallery"), false);
  assert.equal(isPropertyDetailPath("/sales/properties/"), false);
  assert.equal(isPropertyDetailPath("/rentals/properties/BPGC869"), false);
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

test("keeps an empty CRM gallery honest instead of fabricating a property photo", () => {
  assert.deepEqual(getPropertyPhotoPresentation([]), {
    items: [],
    emptyMessage: "No photos available",
  });
  assert.deepEqual(getPropertyPhotoPresentation(["photo-a.jpg"]), {
    items: ["photo-a.jpg"],
    emptyMessage: null,
  });
});
