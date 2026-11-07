/**
 * The instant valuation: this home's own last sale brought up to today with the
 * UK House Price Index, cross-checked against cleaned, index-adjusted sales of
 * the same type nearby. Pure — no network — so the live route and the back-test
 * run exactly the same arithmetic.
 *
 * Design: https://claude.ai/artifact/RsmaMfupi1VLR2K2iLKgGB
 */

export type HomeType = "detached" | "semi-detached" | "terraced" | "flat";
export type IndexKey = HomeType | "all";
export type Confidence = "high" | "medium" | "low";

/** One sale from the register. `standard` = category A (not a repossession, company or other non-market sale). */
export type Sale = {
  price: number;
  /** ISO date, YYYY-MM-DD */
  date: string;
  paon: string;
  saon: string;
  street: string;
  postcode: string;
  type: HomeType | "other";
  standard: boolean;
  newBuild: boolean;
  /** Council the register files it under, upper case, e.g. "WELWYN HATFIELD" */
  district: string;
};

/** UK HPI by month ("2026-08") and property type, for one council. */
export type HpiSeries = Record<string, Record<IndexKey, number>>;

export type EstimateInput = {
  home: { paon: string; saon: string; postcode: string; type: HomeType | null; majorWork: boolean };
  /** Every sale in the home's full postcode, any date. */
  history: Sale[];
  /** Sales across the home's postcode sector, every council it spans. */
  comps: Sale[];
  hpi: Record<string, HpiSeries>;
  homeDistrict: string;
  asOf: Date;
  /** The index month prices are brought up to: the latest published one known at `asOf`. */
  indexMonth: string;
};

export type Comparable = { address: string; postcode: string; date: string; price: number; indexed: number };

export type Estimate = {
  figure: number;
  low: number;
  high: number;
  confidence: Confidence;
  ownSale: (Comparable & { yearsAgo: number }) | null;
  /** The home's latest registered sale, whether or not it was recent enough to use. */
  homeLastSale: { date: string; price: number; used: boolean } | null;
  comparableCount: number;
  /** The most relevant comparables, closest first, for the result page. */
  comparables: Comparable[];
  indexMonth: string;
};

const OWN_SALE_MAX_YEARS = 15;
const COMP_MONTHS = 36;
const COMP_MONTHS_THIN = 60;
const COMPS_WANTED = 8;
const MIN_COMPS = 3;
// Half-widths of the range by confidence, from the EN6/7/8 back-test (750 resales, Sep 2025 – Sep 2026):
// each label's range held the real sale price 7 times in 10. 80% would need ±12% / ±22% / ±27%.
export const RANGE_BANDS: Record<Confidence, number> = { high: 0.1, medium: 0.17, low: 0.21 };

/** Weights the back-test tunes (scripts/valuation-backtest.ts --grid). */
export const TUNING = {
  ownWeight: { within5y: 0.8, within10y: 0.7, older: 0.5 },
  tierWeight: { postcode: 8, street: 4, sector: 1 },
};

const DAY_MS = 86_400_000;
const norm = (value: string) => value.trim().toUpperCase().replace(/\s+/g, " ");
const sectorOf = (postcode: string) => norm(postcode).replace(/[A-Z]{2}$/, "").trim();
const roundTo5k = (value: number) => Math.round(value / 5000) * 5000;
const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const monthsBetween = (fromIso: string, to: Date) => (to.getTime() - Date.parse(fromIso)) / (DAY_MS * 30.44);
const addressOf = (s: Sale) => [s.saon, s.paon, s.street].map((p) => p.trim()).filter(Boolean).join(" ");

export function indexPrice(price: number, saleDate: string, toMonth: string, key: IndexKey, series: HpiSeries): number | null {
  const from = series[saleDate.slice(0, 7)]?.[key];
  const to = series[toMonth]?.[key];
  if (!from || !to) return null;
  return Math.round((price * to) / from);
}

function weightedMedian(items: { value: number; weight: number }[]): number {
  const sorted = [...items].sort((a, b) => a.value - b.value);
  const half = sorted.reduce((sum, i) => sum + i.weight, 0) / 2;
  let running = 0;
  for (const item of sorted) {
    running += item.weight;
    if (running >= half) return item.value;
  }
  return sorted.at(-1)!.value;
}

const recencyWeight = (monthsAgo: number) => (monthsAgo <= 12 ? 1 : monthsAgo <= 24 ? 0.75 : monthsAgo <= 36 ? 0.5 : 0.35);

export function estimateHome(input: EstimateInput): Estimate | null {
  const { home, asOf, indexMonth } = input;
  const asOfDay = isoDay(asOf);
  const key: IndexKey = home.type ?? "all";
  const homePostcode = norm(home.postcode);
  const isHome = (s: Sale) => norm(s.postcode) === homePostcode && norm(s.paon) === norm(home.paon) && norm(s.saon) === norm(home.saon);
  const seriesFor = (district: string) => input.hpi[norm(district)] ?? input.hpi[norm(input.homeDistrict)];

  const own = input.history
    .filter((s) => isHome(s) && s.standard && s.date < asOfDay && monthsBetween(s.date, asOf) / 12 <= OWN_SALE_MAX_YEARS)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastRecorded = input.history
    .filter((s) => isHome(s) && s.date < asOfDay)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const ownSeries = seriesFor(input.homeDistrict);
  const ownIndexed = own && ownSeries ? indexPrice(own.price, own.date, indexMonth, key, ownSeries) : null;
  const ownSale =
    own && ownIndexed
      ? { address: addressOf(own), postcode: own.postcode, date: own.date, price: own.price, indexed: ownIndexed, yearsAgo: monthsBetween(own.date, asOf) / 12 }
      : null;

  const eligible = (months: number) =>
    input.comps.filter(
      (s) =>
        (home.type ? s.type === home.type : true) &&
        s.standard &&
        !s.newBuild &&
        !isHome(s) &&
        s.date < asOfDay &&
        monthsBetween(s.date, asOf) <= months,
    );
  let pool = eligible(COMP_MONTHS);
  if (pool.length < COMPS_WANTED) pool = eligible(COMP_MONTHS_THIN);

  const homeSector = sectorOf(home.postcode);
  const street = own ? norm(own.street) : null;
  const weighted = pool.flatMap((s) => {
    const series = seriesFor(s.district);
    const indexed = series ? indexPrice(s.price, s.date, indexMonth, key, series) : null;
    if (!indexed) return [];
    const tier = norm(s.postcode) === homePostcode ? 3 : street && norm(s.street) === street && sectorOf(s.postcode) === homeSector ? 2 : 1;
    const tierWeight = tier === 3 ? TUNING.tierWeight.postcode : tier === 2 ? TUNING.tierWeight.street : TUNING.tierWeight.sector;
    return [{ sale: s, value: indexed, tier, weight: tierWeight * recencyWeight(monthsBetween(s.date, asOf)) }];
  });

  // Drop sales wildly out of line with the rest (a derelict plot, a mansion on the edge of the sector).
  const roughMedian = weighted.length > 0 ? weightedMedian(weighted) : 0;
  const kept = weighted.filter((w) => w.value >= roughMedian * 0.6 && w.value <= roughMedian * 1.67);
  const compFigure = kept.length >= MIN_COMPS ? weightedMedian(kept) : null;

  if (!ownSale && compFigure === null) return null;

  let figure: number;
  let disagreement = 0;
  if (ownSale && compFigure !== null) {
    const ow = TUNING.ownWeight;
    const ownWeight = ownSale.yearsAgo <= 5 ? ow.within5y : ownSale.yearsAgo <= 10 ? ow.within10y : ow.older;
    figure = ownWeight * ownSale.indexed + (1 - ownWeight) * compFigure;
    disagreement = Math.abs(ownSale.indexed - compFigure) / compFigure;
  } else {
    figure = ownSale ? ownSale.indexed : compFigure!;
  }

  let confidence: Confidence;
  if (home.majorWork || home.type === null || disagreement > 0.15 || (!ownSale && kept.length < 5) || (ownSale && compFigure === null)) {
    confidence = "low";
  } else if (ownSale && ownSale.yearsAgo <= 10 && kept.length >= COMPS_WANTED && disagreement <= 0.1) {
    confidence = "high";
  } else {
    confidence = "medium";
  }

  const band = RANGE_BANDS[confidence];
  const comparables = [...kept]
    .sort((a, b) => b.tier - a.tier || b.sale.date.localeCompare(a.sale.date))
    .slice(0, 5)
    .map((w) => ({ address: addressOf(w.sale), postcode: w.sale.postcode, date: w.sale.date, price: w.sale.price, indexed: w.value }));

  return {
    figure: roundTo5k(figure),
    low: roundTo5k(figure * (1 - band)),
    high: roundTo5k(figure * (1 + band)),
    confidence,
    ownSale,
    homeLastSale: lastRecorded
      ? { date: lastRecorded.date, price: lastRecorded.price, used: Boolean(ownSale && ownSale.date === lastRecorded.date) }
      : null,
    comparableCount: kept.length,
    comparables,
    indexMonth,
  };
}
