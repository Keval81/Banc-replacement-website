/**
 * Back-test the instant valuation against real sales, using live HM Land Registry data.
 *
 *   node scripts/valuation-backtest.ts [outcodes…] [--out report.json]
 *
 * Every standard (non-repossession, non-company) resale of a house or flat in the
 * last 12 months of published data is valued as of the day it sold, using only
 * sales registered before that day and the index months published by then. The
 * old method (middle half of the sector's last 24 months, same type) runs on the
 * same homes for comparison.
 */
import { writeFileSync } from "node:fs";
import { estimateHome, TUNING, type Confidence, type HomeType, type HpiSeries, type Sale } from "../lib/valuation/engine.ts";
import { fetchHpi, fetchPostcodeHistory, fetchSectorSales, indexMonthAsOf } from "../lib/valuation/register.ts";

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const outPath = outIndex >= 0 ? args[outIndex + 1] : null;
const outcodes = args.filter((a, i) => !a.startsWith("--") && (outIndex < 0 || i !== outIndex + 1));
const grid = args.includes("--grid");
if (outcodes.length === 0) outcodes.push("EN6", "EN7", "EN8");

const HOME_TYPES: HomeType[] = ["detached", "semi-detached", "terraced", "flat"];
const sectorOf = (pc: string) => pc.trim().toUpperCase().replace(/\s+/g, " ").replace(/[A-Z]{2}$/, "").trim();

async function pool<T, R>(items: T[], size: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await work(items[i]!);
      }
    }),
  );
  return results;
}

async function districtsFor(outcode: string): Promise<string[]> {
  const res = await fetch(`https://api.postcodes.io/outcodes/${outcode}`);
  if (!res.ok) throw new Error(`postcodes.io outcode ${outcode}: HTTP ${res.status}`);
  const body = (await res.json()) as { result: { admin_district: string[] } };
  return body.result.admin_district.map((d) => d.toUpperCase());
}

function oldMethod(sales: Sale[], type: HomeType, asOf: Date): { low: number; high: number } | null {
  const cutoff = new Date(asOf);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 24);
  const prices = sales
    .filter((s) => s.type === type && Date.parse(s.date) >= cutoff.getTime() && Date.parse(s.date) < asOf.getTime())
    .map((s) => s.price)
    .sort((a, b) => a - b);
  if (prices.length < 3) return null;
  const at = (p: number) => {
    const idx = (prices.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return prices.at(lo)! + (prices.at(hi)! - prices.at(lo)!) * (idx - lo);
  };
  return { low: Math.round(at(0.25) / 5000) * 5000, high: Math.round(at(0.75) / 5000) * 5000 };
}

type Result = {
  type: HomeType;
  price: number;
  date: string;
  postcode: string;
  newFigure: number | null;
  newLow: number | null;
  newHigh: number | null;
  confidence: Confidence | null;
  hadOwnSale: boolean;
  comps: number;
  oldLow: number | null;
  oldHigh: number | null;
};

async function main() {
  const sectorSales = new Map<string, Sale[]>();
  const hpi: Record<string, HpiSeries> = {};
  const since = "2020-06-01";

  for (const outcode of outcodes) {
    const districts = await districtsFor(outcode);
    for (const district of districts) {
      if (!hpi[district]) hpi[district] = await fetchHpi(district);
      const sales = await fetchSectorSales(outcode, district, since);
      if (sales.length >= 3000) console.error(`warning: ${outcode}/${district} hit the 3000-row cap; split by sector`);
      for (const s of sales) {
        const key = sectorOf(s.postcode);
        sectorSales.set(key, [...(sectorSales.get(key) ?? []), s]);
      }
    }
  }

  const all = [...sectorSales.values()].flat();
  const latestSale = all.map((s) => s.date).sort().at(-1)!;
  const testFrom = new Date(Date.parse(latestSale) - 365 * 86_400_000).toISOString().slice(0, 10);
  const tests = all.filter(
    (s) => s.date >= testFrom && s.standard && !s.newBuild && (HOME_TYPES as string[]).includes(s.type) && s.paon,
  );
  console.error(`${all.length} sales loaded; testing ${tests.length} resales from ${testFrom} to ${latestSale}`);

  const histories = new Map<string, Sale[]>();
  const postcodes = [...new Set(tests.map((t) => t.postcode))];
  await pool(postcodes, 6, async (pc) => {
    histories.set(pc, await fetchPostcodeHistory(pc));
  });

  const run = (): Result[] => tests.map((t) => {
    const asOf = new Date(`${t.date}T00:00:00Z`);
    const type = t.type as HomeType;
    const homeSeries = hpi[t.district];
    const indexMonth = homeSeries ? indexMonthAsOf(homeSeries, asOf) : null;
    const comps = sectorSales.get(sectorOf(t.postcode)) ?? [];
    const e = indexMonth
      ? estimateHome({
          home: { paon: t.paon, saon: t.saon, postcode: t.postcode, type, majorWork: false },
          history: histories.get(t.postcode) ?? [],
          comps,
          hpi,
          homeDistrict: t.district,
          asOf,
          indexMonth,
        })
      : null;
    const old = oldMethod(comps, type, asOf);
    return {
      type,
      price: t.price,
      date: t.date,
      postcode: t.postcode,
      newFigure: e?.figure ?? null,
      newLow: e?.low ?? null,
      newHigh: e?.high ?? null,
      confidence: e?.confidence ?? null,
      hadOwnSale: Boolean(e?.ownSale),
      comps: e?.comparableCount ?? 0,
      oldLow: old?.low ?? null,
      oldHigh: old?.high ?? null,
    };
  });

  if (grid) {
    const variants = [
      { name: "design defaults", own: [0.6, 0.5, 0.35], tier: [3, 2, 1] },
      { name: "trust own sale more", own: [0.8, 0.7, 0.5], tier: [3, 2, 1] },
      { name: "own sale only when present", own: [1, 1, 1], tier: [3, 2, 1] },
      { name: "trust own sale less", own: [0.4, 0.3, 0.2], tier: [3, 2, 1] },
      { name: "neighbours count more", own: [0.6, 0.5, 0.35], tier: [8, 4, 1] },
      { name: "own more + neighbours more", own: [0.8, 0.7, 0.5], tier: [8, 4, 1] },
      { name: "flat tiers", own: [0.6, 0.5, 0.35], tier: [1, 1, 1] },
    ];
    for (const v of variants) {
      TUNING.ownWeight = { within5y: v.own[0]!, within10y: v.own[1]!, older: v.own[2]! };
      TUNING.tierWeight = { postcode: v.tier[0]!, street: v.tier[1]!, sector: v.tier[2]! };
      const rows = run().filter((r) => r.newFigure !== null);
      const errors = rows.map((r) => Math.abs(r.newFigure! - r.price) / r.price).sort((a, b) => a - b);
      const withOwn = rows.filter((r) => r.hadOwnSale).map((r) => Math.abs(r.newFigure! - r.price) / r.price).sort((a, b) => a - b);
      const noOwn = rows.filter((r) => !r.hadOwnSale).map((r) => Math.abs(r.newFigure! - r.price) / r.price).sort((a, b) => a - b);
      const med = (xs: number[]) => `${(100 * xs.at(Math.floor(xs.length / 2))!).toFixed(1)}%`;
      console.log(`${v.name.padEnd(30)} median ${med(errors)}  within10 ${Math.round((100 * errors.filter((e) => e <= 0.1).length) / errors.length)}%  own-sale homes ${med(withOwn)}  others ${med(noOwn)}`);
    }
    return;
  }
  const results = run();

  const pct = (n: number, d: number) => (d === 0 ? "—" : `${Math.round((100 * n) / d)}%`);
  const median = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    return s.length === 0 ? NaN : s.at(Math.floor(s.length / 2))!;
  };
  const err = (fig: number, price: number) => Math.abs(fig - price) / price;

  const summarise = (rows: Result[]) => {
    const withNew = rows.filter((r) => r.newFigure !== null);
    const withOld = rows.filter((r) => r.oldLow !== null);
    const newErr = withNew.map((r) => err(r.newFigure!, r.price));
    const oldMid = withOld.map((r) => err((r.oldLow! + r.oldHigh!) / 2, r.price));
    return {
      homes: rows.length,
      newCovered: pct(withNew.length, rows.length),
      newMedianError: `${(100 * median(newErr)).toFixed(1)}%`,
      newWithin10: pct(newErr.filter((e) => e <= 0.1).length, withNew.length),
      newRangeHeld: pct(withNew.filter((r) => r.price >= r.newLow! && r.price <= r.newHigh!).length, withNew.length),
      oldCovered: pct(withOld.length, rows.length),
      oldMidpointMedianError: `${(100 * median(oldMid)).toFixed(1)}%`,
      oldMidpointWithin10: pct(oldMid.filter((e) => e <= 0.1).length, withOld.length),
      oldRangeHeld: pct(withOld.filter((r) => r.price >= r.oldLow! && r.price <= r.oldHigh!).length, withOld.length),
      oldMedianRangeWidth: `${(100 * median(withOld.map((r) => (r.oldHigh! - r.oldLow!) / ((r.oldHigh! + r.oldLow!) / 2)))).toFixed(0)}%`,
    };
  };

  const byType = Object.fromEntries(HOME_TYPES.map((t) => [t, summarise(results.filter((r) => r.type === t))]));
  const byConfidence = Object.fromEntries(
    (["high", "medium", "low"] as const).map((c) => {
      const rows = results.filter((r) => r.confidence === c);
      const errors = rows.map((r) => err(r.newFigure!, r.price)).sort((a, b) => a - b);
      return [
        c,
        {
          homes: rows.length,
          medianError: `${(100 * median(errors)).toFixed(1)}%`,
          rangeHeld: pct(rows.filter((r) => r.price >= r.newLow! && r.price <= r.newHigh!).length, rows.length),
          // The half-width a range needs to hold the real price 8 times in 10.
          band80: errors.length ? Number(errors.at(Math.floor(errors.length * 0.8))!.toFixed(3)) : null,
        },
      ];
    }),
  );
  const report = { outcodes, testFrom, latestSale, overall: summarise(results), byType, byConfidence };
  console.log(JSON.stringify(report, null, 2));
  if (outPath) writeFileSync(outPath, JSON.stringify({ report, results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
