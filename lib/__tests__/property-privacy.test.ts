import assert from "node:assert/strict";
import test from "node:test";

import {
  AREA_MAP_ZOOM,
  toAreaCoordinate,
  toOutwardCode,
  toPublicAddress,
} from "../property-privacy.ts";

test("drops the door number but keeps the street and area", () => {
  assert.equal(
    toPublicAddress("5 Little Berkhamsted Lane, Little Berkhamsted, Hertford"),
    "Little Berkhamsted Lane, Little Berkhamsted, Hertford",
  );
  assert.equal(toPublicAddress("12A Station Road, Cuffley"), "Station Road, Cuffley");
  assert.equal(toPublicAddress("12-14 Station Road, Cuffley"), "Station Road, Cuffley");
});

test("drops flat and unit designators along with their number", () => {
  assert.equal(
    toPublicAddress("Flat 3, 21 The Avenue, Potters Bar"),
    "The Avenue, Potters Bar",
  );
  assert.equal(toPublicAddress("Apartment 2B Tolmers Road, Cuffley"), "Tolmers Road, Cuffley");
});

test("drops postcodes wherever they appear", () => {
  assert.equal(
    toPublicAddress("1 Station Road, Cuffley, Hertfordshire, EN6 4HU"),
    "Station Road, Cuffley, Hertfordshire",
  );
  assert.equal(
    toPublicAddress("Hanyards Lane, Cuffley EN6 4EF"),
    "Hanyards Lane, Cuffley",
  );
});

test("keeps house names and marketing headings intact", () => {
  assert.equal(toPublicAddress("The Old Rectory, Northaw"), "The Old Rectory, Northaw");
  assert.equal(
    toPublicAddress("4 bed detached property in a unique setting"),
    "4 bed detached property in a unique setting",
  );
  assert.equal(toPublicAddress("6 Bedroom House, Cuffley"), "6 Bedroom House, Cuffley");
});

test("leaves an already-public address unchanged", () => {
  assert.equal(toPublicAddress("Hanyards Lane, Cuffley"), "Hanyards Lane, Cuffley");
  assert.equal(toPublicAddress(""), "");
});

test("reduces a postcode to its outward area code", () => {
  assert.equal(toOutwardCode("EN6 4HU"), "EN6");
  assert.equal(toOutwardCode("en6 4hu"), "EN6");
  assert.equal(toOutwardCode("EN64HU"), "EN6");
  assert.equal(toOutwardCode(""), "");
  assert.equal(toOutwardCode("not a postcode"), "");
});

test("rounds coordinates so a pin cannot land on the plot", () => {
  // 3dp is roughly 110m of latitude — inside the area, off the house.
  assert.equal(toAreaCoordinate(51.7091234), 51.709);
  assert.equal(toAreaCoordinate(-0.1275987), -0.128);
  assert.equal(toAreaCoordinate(Number.NaN), undefined);
  assert.equal(toAreaCoordinate(undefined), undefined);
});

test("frames the map at an area zoom rather than a rooftop zoom", () => {
  assert.ok(AREA_MAP_ZOOM <= 15, "an area map must not zoom to individual plots");
});
