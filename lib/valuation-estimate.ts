import type { SoldPriceRecord } from "./types/data.ts";

export type RegisterType = Exclude<SoldPriceRecord["propertyType"], "other">;

export interface ValuationEstimate {
  /** Lower and upper bounds, rounded to £5,000. */
  low: number;
  high: number;
  /** How many sales the range rests on. */
  sampleSize: number;
  /** "type" = same property type in the sector; "area" = every type, because the type alone was too thin. */
  basis: "type" | "area";
  /** The postcode sector the sales came from, e.g. "EN6 4". */
  sector: string;
  monthsBack: number;
}

const MIN_SAMPLE = 3;
const MONTHS_BACK = 24;

/** The valuation form's property types, onto the register's vocabulary. Bungalows and cottages
 *  are "other" in the register, so they take the whole-area range. */
export function registerTypeFor(formType: string): RegisterType | null {
  const t = formType.trim().toLowerCase();
  if (!t) return null;
  if (t.startsWith("semi")) return "semi-detached";
  if (t.startsWith("detached")) return "detached";
  if (t.startsWith("terrace")) return "terraced";
  if (t.startsWith("flat") || t.startsWith("maisonette") || t.startsWith("apartment")) return "flat";
  return null;
}

/** "EN6 4HU" → "EN6 4". A sector is the smallest area with enough sales to say anything. */
export function postcodeSector(postcode: string): string | null {
  const compact = postcode.replace(/\s+/g, "").toUpperCase();
  const m = compact.match(/^([A-Z]{1,2}\d[A-Z\d]?)(\d)[A-Z]{2}$/);
  return m ? `${m[1]} ${m[2]}` : null;
}

const roundTo5k = (value: number) => Math.round(value / 5000) * 5000;

function quartiles(prices: number[]): { q1: number; q3: number } {
  const sorted = [...prices].sort((a, b) => a - b);
  const at = (p: number) => {
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };
  return { q1: at(0.25), q3: at(0.75) };
}

/**
 * An indicative range from what has actually sold nearby: the middle half of
 * the last two years' sales of the same type in the sector. Never a single
 * figure, never from fewer than three sales, and never from sales older than
 * the window — an estate agent quoting an invented number is worse than one
 * that says "we'll call you".
 */
export function estimateFromSales(
  sales: SoldPriceRecord[],
  options: { propertyType?: string; sector?: string; now?: Date },
): ValuationEstimate | null {
  const now = options.now ?? new Date();
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - MONTHS_BACK);
  const recent = sales.filter((s) => {
    const d = new Date(s.date);
    return !Number.isNaN(d.getTime()) && d >= cutoff && d <= now && s.price > 0;
  });
  const type = options.propertyType ? registerTypeFor(options.propertyType) : null;
  const sameType = type ? recent.filter((s) => s.propertyType === type) : [];
  const pool = sameType.length >= MIN_SAMPLE ? sameType : recent;
  if (pool.length < MIN_SAMPLE) return null;
  const { q1, q3 } = quartiles(pool.map((s) => s.price));
  return {
    low: roundTo5k(q1),
    high: roundTo5k(q3),
    sampleSize: pool.length,
    basis: sameType.length >= MIN_SAMPLE ? "type" : "area",
    sector: options.sector ?? postcodeSector(pool[0].postcode) ?? "",
    monthsBack: MONTHS_BACK,
  };
}

export function formatEstimate(e: ValuationEstimate): string {
  const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`;
  return `${gbp(e.low)} – ${gbp(e.high)}`;
}

/** The local-authority district the register files a postcode under, from postcodes.io — no key needed. */
export async function lookupPostcodeDistrict(
  postcode: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  const compact = postcode.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(compact)) return null;
  try {
    const res = await fetcher(`https://api.postcodes.io/postcodes/${encodeURIComponent(compact)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { result?: { admin_district?: string | null } };
    const district = body.result?.admin_district?.trim();
    return district ? district.toUpperCase() : null;
  } catch {
    return null;
  }
}
