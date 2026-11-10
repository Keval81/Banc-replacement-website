import assert from "node:assert/strict";
import test from "node:test";

import { matchCertificate, parseFloorArea, type CertificateRow } from "../valuation/epc.ts";

const row = (over: Partial<CertificateRow>): CertificateRow => ({
  certificateNumber: "0000-0000-0000-0000-0001",
  addressLine1: "9 Poets Gate",
  addressLine2: "Cheshunt",
  addressLine3: null,
  addressLine4: null,
  registrationDate: "2024-01-01",
  ...over,
});
const home = (paon: string, saon = "") => ({ paon, saon });

test("matches a house by its number, not a neighbour whose number contains it", () => {
  const rows = [
    row({ certificateNumber: "A", addressLine1: "19 Poets Gate" }),
    row({ certificateNumber: "B", addressLine1: "9 Poets Gate" }),
    row({ certificateNumber: "C", addressLine1: "9A Poets Gate" }),
  ];
  assert.equal(matchCertificate(home("9"), rows)?.certificateNumber, "B");
});

test("matches a flat by flat and building number, never the whole building or another flat", () => {
  const rows = [
    row({ certificateNumber: "A", addressLine1: "14 High Street" }),
    row({ certificateNumber: "B", addressLine1: "Flat 12", addressLine2: "14 High Street" }),
    row({ certificateNumber: "C", addressLine1: "Flat 2, 14 High Street" }),
  ];
  assert.equal(matchCertificate(home("14", "FLAT 2"), rows)?.certificateNumber, "C");
  assert.equal(matchCertificate(home("14"), rows)?.certificateNumber, "A");
});

test("matches a named house on its name", () => {
  const rows = [row({ certificateNumber: "A", addressLine1: "Rose Cottage", addressLine2: "Mill Lane" }), row({ certificateNumber: "B", addressLine1: "The Old Barn", addressLine2: "Mill Lane" })];
  assert.equal(matchCertificate(home("ROSE COTTAGE"), rows)?.certificateNumber, "A");
});

test("takes the newest certificate when a home has several", () => {
  const rows = [row({ certificateNumber: "OLD", registrationDate: "2012-05-01" }), row({ certificateNumber: "NEW", registrationDate: "2026-03-11" })];
  assert.equal(matchCertificate(home("9"), rows)?.certificateNumber, "NEW");
});

test("gives no match rather than guess when nothing fits", () => {
  assert.equal(matchCertificate(home("11"), [row({})]), null);
});

test("reads a floor area in square metres and rejects implausible ones", () => {
  assert.equal(parseFloorArea({ total_floor_area: 250 }), 250);
  assert.equal(parseFloorArea({ total_floor_area: "95.5" }), 95.5);
  assert.equal(parseFloorArea({ total_floor_area: 4 }), null);
  assert.equal(parseFloorArea({}), null);
});
