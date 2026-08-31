import assert from "node:assert/strict";
import test from "node:test";

import { parseBedroomIntent } from "../property-search/bedroom-intent.ts";
import { POSTGRES_SIGNED_INTEGER_MAX } from "../property-search/query.ts";

test("parses an explicit exact bedroom requirement independently of chat orchestration", () => {
  assert.deepEqual(parseBedroomIntent("I need exactly five bedrooms"), {
    kind: "exact",
    value: 5,
  });
});

for (const [message, expected] of [
  ["Find me a 3 bed in Cuffley", { kind: "exact", value: 3 }],
  ["Show three-bedroom homes", { kind: "exact", value: 3 }],
  ["Make it 3 bedrooms", { kind: "exact", value: 3 }],
  ["Show 3+ beds", { kind: "minimum", value: 3 }],
  ["At least three bedrooms", { kind: "minimum", value: 3 }],
  ["At least a 3 bed", { kind: "minimum", value: 3 }],
  ["At least a three-bedroom home", { kind: "minimum", value: 3 }],
  ["Minimum 3 bedrooms", { kind: "minimum", value: 3 }],
  ["Show 3 or more bedrooms", { kind: "minimum", value: 3 }],
  ["Show three or more bedrooms", { kind: "minimum", value: 3 }],
  ["Show 3-or-more-bedroom homes", { kind: "minimum", value: 3 }],
  ["Show three-or-more-bedroom homes", { kind: "minimum", value: 3 }],
  ["3 bedrooms or more", { kind: "minimum", value: 3 }],
] as const) {
  test(`parses ${message}`, () => {
    assert.deepEqual(parseBedroomIntent(message), expected);
  });
}

test("returns unmatched when no bedroom-shaped phrase exists", () => {
  assert.deepEqual(parseBedroomIntent("Show homes with a garden in Cuffley"), {
    kind: "unmatched",
  });
});

for (const message of [
  "Find a 3.0 bed in Cuffley",
  "Find a -3 bed in Cuffley",
  "Find a 3,2 bed in Cuffley",
  `Find a ${Number.MAX_SAFE_INTEGER + 1} bed in Cuffley`,
  `Find a ${POSTGRES_SIGNED_INTEGER_MAX + 1} bed in Cuffley`,
] as const) {
  test(`rejects malformed bedroom count in ${message}`, () => {
    assert.throws(
      () => parseBedroomIntent(message),
      RangeError,
    );
  });
}
