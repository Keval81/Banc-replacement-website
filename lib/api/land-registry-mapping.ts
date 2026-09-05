/**
 * Turning HM Land Registry's SPARQL rows into records the sold-prices page can
 * render. Pure functions, no network and no path aliases, so they are testable
 * on their own — which matters here, because every defect this module fixes was
 * invisible from the outside: the page simply showed nothing.
 *
 * Shapes verified against the live endpoint
 * (https://landregistry.data.gov.uk/landregistry/query) rather than assumed.
 */

export type RegisterPropertyType =
  | "detached"
  | "semi-detached"
  | "terraced"
  | "flat"
  | "other";

export type RegisterTenure = "freehold" | "leasehold" | "unknown";

export interface AddressParts {
  saon?: string;
  paon?: string;
  street?: string;
  town?: string;
}

export interface SparqlBinding {
  [key: string]: { value: string } | undefined;
}

/** The register publishes in block capitals; the page should not shout. */
function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b([a-z])/g, (letter) => letter.toUpperCase())
    // 80a Station Road reads better as 80A.
    .replace(/\b(\d+)([a-z])\b/g, (_, digits, letter) => `${digits}${letter.toUpperCase()}`);
}

/**
 * The register keeps the address in separate fields — secondary name, primary
 * number, street, town — and the query used to bind the address *resource*
 * instead, which would have printed a URL where the street belongs.
 */
export function composeSoldPriceAddress(parts: AddressParts): string {
  const { saon, paon, street, town } = parts;

  const line = [saon, [paon, street].filter(Boolean).join(" ")]
    .map((segment) => segment?.trim())
    .filter((segment): segment is string => Boolean(segment));

  const all = [...line, town?.trim()].filter(
    (segment): segment is string => Boolean(segment),
  );

  return all.map(toTitleCase).join(", ");
}

/**
 * Types arrive as vocabulary URIs (.../def/common/detached), not the single
 * letter codes the price-paid CSV uses.
 */
export function parseRegisterPropertyType(value: string): RegisterPropertyType {
  const term = value.split("/").pop()?.toLowerCase() ?? "";

  if (term.startsWith("semi")) return "semi-detached";
  if (term.startsWith("detached")) return "detached";
  if (term.startsWith("terraced")) return "terraced";
  if (term.startsWith("flat")) return "flat";
  return "other";
}

/** Tenure is published as `estateType`, not `tenure`. */
export function parseEstateType(value: string): RegisterTenure {
  const term = value.split("/").pop()?.toLowerCase() ?? "";

  if (term.includes("freehold")) return "freehold";
  if (term.includes("leasehold")) return "leasehold";
  return "unknown";
}

export function formatSoldPrice(price: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(price);
}

export interface MappedSoldPrice {
  id: string;
  address: string;
  postcode: string;
  price: number;
  priceFormatted: string;
  date: string;
  propertyType: RegisterPropertyType;
  tenure: RegisterTenure;
  newBuild: boolean;
}

export function mapSoldPriceBinding(
  binding: SparqlBinding,
  postcode: string,
  index: number,
): MappedSoldPrice {
  const read = (key: string): string => binding[key]?.value ?? "";
  const price = Number.parseInt(read("price") || "0", 10);

  return {
    id: read("item") || `sale-${index}`,
    address: composeSoldPriceAddress({
      saon: read("saon"),
      paon: read("paon"),
      street: read("street"),
      town: read("town"),
    }),
    postcode: postcode.toUpperCase(),
    price,
    priceFormatted: formatSoldPrice(price),
    date: read("date"),
    propertyType: parseRegisterPropertyType(read("propertyType")),
    tenure: parseEstateType(read("estateType")),
    newBuild: read("newBuild") === "true",
  };
}

export interface SoldPriceRow {
  price: number;
  date: string;
}

export interface ComputedSoldPriceStats {
  averagePrice: number;
  medianPrice: number;
  priceChangePercent: number;
  salesCount12Months: number;
  salesCount6Months: number;
}

function monthsBefore(from: Date, months: number): Date {
  const date = new Date(from);
  date.setMonth(date.getMonth() - months);
  return date;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

/**
 * `now` is injected so the windows are testable; the register's rows are
 * historical and a hard-coded clock would make these assertions rot.
 *
 * Deliberately no price per square foot: price-paid records carry no floor
 * area, so any such figure would be invented — which is exactly the defect
 * this page was already found publishing.
 */
export function computeSoldPriceStats(
  records: SoldPriceRow[],
  now: Date = new Date(),
): ComputedSoldPriceStats {
  const prices = records.map((record) => record.price);
  const sorted = [...prices].sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);
  const medianPrice =
    sorted.length === 0
      ? 0
      : sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];

  const sixMonthsAgo = monthsBefore(now, 6);
  const twelveMonthsAgo = monthsBefore(now, 12);
  const on = (record: SoldPriceRow) => new Date(record.date);

  const recent = records.filter((record) => on(record) >= sixMonthsAgo);
  // The six months BEFORE the recent six — the previous window sits between
  // twelve and six months back, not the other way round.
  const previous = records.filter(
    (record) => on(record) >= twelveMonthsAgo && on(record) < sixMonthsAgo,
  );

  const recentAverage = mean(recent.map((record) => record.price));
  const previousAverage = mean(previous.map((record) => record.price));
  const priceChangePercent =
    previousAverage > 0
      ? Math.round(((recentAverage - previousAverage) / previousAverage) * 1000) / 10
      : 0;

  return {
    averagePrice: mean(prices),
    medianPrice,
    priceChangePercent,
    salesCount12Months: records.filter((record) => on(record) >= twelveMonthsAgo).length,
    salesCount6Months: recent.length,
  };
}
