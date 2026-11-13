// Looking at a home without leaving the conversation: the panel shows the
// photos and key details itself, so the thread is never lost.
import assert from "node:assert/strict";
import test from "node:test";

import {
  listingFromHref,
  parsePropertyPeek,
  peekFromCard,
} from "../property-chat-peek.ts";
import { readableLabel } from "../readable-label.ts";

const IMAGE = "https://med05.expertagent.co.uk/in4glestates/a/b/main.jpg";

test("reads the listing a chat link points at", () => {
  assert.deepEqual(listingFromHref("/sales/properties/BPGC2055"), { id: "BPGC2055", department: "sales" });
  assert.deepEqual(listingFromHref("/lettings/properties/BPGC1561?from=bot"), { id: "BPGC1561", department: "lettings" });
  assert.equal(listingFromHref("/buyers-guide"), null);
  assert.equal(listingFromHref("https://evil.example/sales/properties/X"), null);
});

test("a search card is enough to show photos, price and summary straight away", () => {
  const peek = peekFromCard({
    id: "BPGC2055", title: "Brookside Crescent, Cuffley", address: "Brookside Crescent, Cuffley, Hertfordshire",
    price: "£895,000", priceNum: 895000, tags: [], stats: { beds: 4, baths: 2 }, images: [IMAGE, IMAGE],
    summary: "A detached house.", propertyType: "house", department: "sales", status: "for_sale",
  });
  assert.equal(peek.images.length, 2);
  assert.equal(peek.price, "£895,000");
  assert.deepEqual(peek.facts, ["4 bedrooms", "2 bathrooms"]);
  assert.equal(peek.available, true);
  assert.equal(peek.features.length, 0);
});

test("the full details add features, receptions, tenure, description and floorplan", () => {
  const peek = parsePropertyPeek({
    property: {
      id: "BPGC2055", title: "Brookside Crescent, Cuffley", address: "Brookside Crescent, Cuffley, Hertfordshire",
      price: "£895,000", department: "sales", status: "under_offer", tags: ["Under Offer"],
      stats: { beds: 1, baths: 1 }, receptions: 3, tenure: "Freehold",
      images: [IMAGE, "javascript:alert(1)", IMAGE],
      features: ["GROUND FLOOR WC", "Garage"],
      description: "First paragraph.\n\nSecond paragraph.\n\nFirst paragraph.",
      summary: "First paragraph.",
      floorplans: [{ id: "fp", url: IMAGE }],
    },
  });
  assert.ok(peek);
  assert.equal(peek.images.length, 2, "an unsafe image address is dropped");
  assert.deepEqual(peek.facts, ["1 bedroom", "1 bathroom", "3 receptions", "Freehold"]);
  assert.deepEqual(peek.features, ["Ground Floor WC", "Garage"]);
  assert.deepEqual(peek.description, ["First paragraph.", "Second paragraph."]);
  assert.equal(peek.floorplan, IMAGE);
  assert.equal(peek.tag, "Under Offer");
  assert.equal(peek.available, false);
});

test("a malformed or missing property is not shown", () => {
  assert.equal(parsePropertyPeek({ property: null }), null);
  assert.equal(parsePropertyPeek({ property: { id: "X" } }), null);
  assert.equal(parsePropertyPeek("nope"), null);
});

test("labels typed in capitals read in title case, acronyms kept", () => {
  assert.equal(readableLabel("DRIVEWAY AND GARAGE"), "Driveway and Garage");
  assert.equal(readableLabel("GROUND FLOOR WC"), "Ground Floor WC");
  assert.equal(readableLabel("Already fine"), "Already fine");
});
