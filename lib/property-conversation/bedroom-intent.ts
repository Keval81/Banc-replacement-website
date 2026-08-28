import { POSTGRES_SIGNED_INTEGER_MAX } from "../property-search/query.ts";

export type BedroomIntent =
  | { kind: "unmatched" }
  | { kind: "exact"; value: number }
  | { kind: "minimum"; value: number };

const NUMBER_WORDS: Readonly<Record<string, number>> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

const numberWordsPattern = Object.keys(NUMBER_WORDS).join("|");
const countCapture =
  `([+-]?[\\d.,]+(?:\\s+[\\d.,]+)*(?:[a-z]+)?|${numberWordsPattern})`;
const bedroomUnitPattern = "(?:bed|bedroom)s?";
const minimumPatterns = [
  new RegExp(
    `\\b(?:at\\s+least|min(?:imum)?)\\s+${countCapture}[-\\s]+${bedroomUnitPattern}\\b`,
    "i",
  ),
  new RegExp(`(?:^|[^\\w,.])${countCapture}\\+\\s*${bedroomUnitPattern}\\b`, "i"),
  new RegExp(
    `(?:^|[^\\w,.])${countCapture}(?:-\\s*|\\s+)or(?:-\\s*|\\s+)more[-\\s]+${bedroomUnitPattern}\\b`,
    "i",
  ),
  new RegExp(
    `(?:^|[^\\w,.])${countCapture}[-\\s]+${bedroomUnitPattern}\\s+or\\s+more\\b`,
    "i",
  ),
];
const exactPattern = new RegExp(
  `(?:^|[^\\w,.])${countCapture}[-\\s]+${bedroomUnitPattern}\\b`,
  "i",
);

function parseCountValue(raw: string): number | undefined {
  const normalized = raw.toLowerCase();
  const wordValue = NUMBER_WORDS[normalized];
  const numericShaped = /^[+-]?[\d.,]/.test(normalized);
  if (wordValue === undefined && !numericShaped) return undefined;
  if (
    wordValue === undefined &&
    !/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)$/.test(normalized)
  ) {
    throw new RangeError("Bedroom count is outside the supported search range");
  }

  const value = wordValue ?? Number(normalized.replaceAll(",", ""));
  if (
    !Number.isSafeInteger(value) ||
    value < 0 ||
    value > POSTGRES_SIGNED_INTEGER_MAX
  ) {
    throw new RangeError("Bedroom count is outside the supported search range");
  }

  return value;
}

function parseBedroomMatch(
  pattern: RegExp,
  message: string,
): number | undefined {
  const match = message.match(pattern);
  if (!match?.[1]) return undefined;
  return parseCountValue(match[1]);
}

export function parseBedroomIntent(message: string): BedroomIntent {
  for (const pattern of minimumPatterns) {
    const value = parseBedroomMatch(pattern, message);
    if (value !== undefined) {
      return { kind: "minimum", value };
    }
  }

  const exact = parseBedroomMatch(exactPattern, message);
  if (exact !== undefined) {
    return { kind: "exact", value: exact };
  }

  return { kind: "unmatched" };
}
