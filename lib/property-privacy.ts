// Public listing surfaces must not identify a specific home. The brief from
// the 2 Sep client meeting is: street and area only — no door numbers, no
// postcodes, and a map that resolves to the area rather than the plot.
//
// The feed and the database keep the true address, which the team needs for
// leads and which the search RPC needs for distance filtering. Everything a
// visitor can see goes through this module first.

const FULL_POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi;
const OUTWARD_CODE = /^[A-Z]{1,2}\d[A-Z\d]?$/i;
const INWARD_CODE = /^\d[A-Z]{2}$/i;

// "12", "12A", "12-14", "12 / 14"
const BUILDING_NUMBER = /^\d+[A-Za-z]?(?:\s*[-/]\s*\d+[A-Za-z]?)?$/;
const UNIT_WORD = /^(?:flat|apartment|apt|unit|plot|suite|room)$/i;
// A leading count in a marketing heading ("4 bed detached", "6 Bedroom House")
// is not a door number.
const COUNTED_NOUN = /^(?:bed|beds|bedroom|bedrooms|bath|baths|bathroom|bathrooms)$/i;

function isPostcodeFragment(segment: string): boolean {
  return OUTWARD_CODE.test(segment) || INWARD_CODE.test(segment);
}

// Removes the building identifiers from one address segment. Returns an empty
// string when the segment was nothing but an identifier, so the caller can
// move on to the next segment ("Flat 3, 21 The Avenue").
//
// The number is not always leading: the feed joins house_number and street,
// and house_number often carries a house name as well, giving
// "Bridge House 69 Station Road". So every standalone number in the segment
// goes, unless it counts something ("4 bed detached").
function stripBuildingIdentifier(segment: string): string {
  const tokens = segment.split(/\s+/).filter(Boolean);

  if (
    tokens.length >= 2 &&
    UNIT_WORD.test(tokens[0]) &&
    BUILDING_NUMBER.test(tokens[1])
  ) {
    tokens.splice(0, 2);
  }

  const kept = tokens.filter((token, index) => {
    if (!BUILDING_NUMBER.test(token)) return true;
    const next = tokens[index + 1];
    return next !== undefined && COUNTED_NOUN.test(next);
  });

  return kept.join(" ");
}

export function toPublicAddress(value: string): string {
  const segments = value
    .replace(FULL_POSTCODE, " ")
    .split(",")
    .map((segment) => segment.trim().replace(/\s+/g, " "))
    .filter((segment) => segment !== "" && !isPostcodeFragment(segment));

  const kept: string[] = [];
  for (const segment of segments) {
    if (kept.length === 0) {
      const stripped = stripBuildingIdentifier(segment);
      if (stripped === "") continue;
      kept.push(stripped);
      continue;
    }
    kept.push(segment);
  }

  return kept.join(", ");
}

// "EN6 4HU" and "EN64HU" both reduce to "EN6" — an area, not an address.
export function toOutwardCode(postcode: string): string {
  const cleaned = postcode.trim().toUpperCase();
  if (cleaned === "") return "";

  const spaced = cleaned.split(/\s+/)[0] ?? "";
  if (OUTWARD_CODE.test(spaced)) return spaced;

  const match = cleaned.match(/^([A-Z]{1,2}\d[A-Z\d]?)\d[A-Z]{2}$/);
  return match?.[1] ?? "";
}

// ~110m of latitude: enough to keep a pin off the plot while still showing
// the right village.
const AREA_COORDINATE_PRECISION = 1000;

export function toAreaCoordinate(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.round(value * AREA_COORDINATE_PRECISION) / AREA_COORDINATE_PRECISION;
}

// At this zoom a Google or OSM frame shows the neighbourhood, not the roof.
export const AREA_MAP_ZOOM = 14;
