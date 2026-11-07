import assert from "node:assert/strict";
import test from "node:test";

import { formFor } from "../banc-conversation/forms.ts";

test("a valuation request goes to the instant valuation form", () => {
  assert.deepEqual(formFor("valuation"), { title: "Get your instant valuation", href: "/valuation" });
  assert.deepEqual(formFor("valuation", "EA-1"), { title: "Get your instant valuation", href: "/valuation" });
});

test("a viewing or offer on a known property goes to that property's own form", () => {
  assert.deepEqual(formFor("viewing", "BPGC1986"), { title: "Book a viewing", href: "/book-viewing/BPGC1986" });
  assert.deepEqual(formFor("offer", "BPGC1986"), { title: "Make an offer", href: "/make-offer/BPGC1986" });
});

test("everything else, or a viewing with no property chosen, goes to the contact form", () => {
  const contact = { title: "Send Banc a message", href: "/contact" };
  assert.deepEqual(formFor("viewing"), contact);
  assert.deepEqual(formFor("human"), contact);
  assert.deepEqual(formFor("availability", "BPGC1"), contact);
  assert.deepEqual(formFor("fees_finance_legal"), contact);
});
