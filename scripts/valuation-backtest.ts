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
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { estimateHome, TUNING, type Confidence, type HomeType, type HpiSeries, type Sale } from "../lib/valuation/engine.ts";
import { fetchFloorArea, fetchPostcodeCertificates, matchCertificate } from "../lib/valuation/epc.ts";
import { fetchHpi, fetchPostcodeHistory, fetchSectorSales, indexMonthAsOf } from "../lib/valuation/register.ts";

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const outPath = outIndex >= 0 ? args[outIndex + 1] : null;
const outcodes = args.filter((a) => /^[A-Z]{1,2}\d[A-Z\d]?$/.test(a));
// --epc <cache.json>: also value every home with floor areas from the energy certificate register.
const epcIndex = args.indexOf("--epc");
const epcCachePath = epcIndex >= 0 ? args[epcIndex + 1] : null;
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

const homeKey = (s: { postcode: string; saon: string; paon: string }) => `${s.postcode}|${s.saon}|${s.paon}`.toUpperCase();

/** Floor area per home (null = no certificate found), cached on disk so a re-run costs nothing. */
async function loadAreas(sales: Sale[], cachePath: string): Promise<Record<string, number | null>> {
  const token = process.env.EPC_API_TOKEN;
  if (!token) throw new Error("EPC_API_TOKEN is not set; run with node --env-file=.env.local");
  const areas: Record<string, number | null> = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};
  const byPostcode = new Map<string, Sale[]>();
  for (const s of sales) {
    if (!s.paon || homeKey(s) in areas) continue;
    byPostcode.set(s.postcode, [...(byPostcode.get(s.postcode) ?? []), s]);
  }
  // The register allows 6000 requests per 5 minutes; 4 workers pausing 250ms stay under it.
  const pace = () => new Promise((resolve) => setTimeout(resolve, 250));
  let done = 0;
  await pool([...byPostcode.entries()], 4, async ([postcode, homes]) => {
    const rows = await fetchPostcodeCertificates(postcode, token);
    await pace();
    for (const home of homes) {
      if (homeKey(home) in areas) continue;
      const match = matchCertificate(home, rows);
      areas[homeKey(home)] = match ? await fetchFloorArea(match.certificateNumber, token) : null;
      if (match) await pace();
    }
    if (++done % 200 === 0) {
      writeFileSync(cachePath, JSON.stringify(areas));
      console.error(`floor areas: ${done}/${byPostcode.size} postcodes`);
    }
  });
  writeFileSync(cachePath, JSON.stringify(areas));
  return areas;
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
  hasArea: boolean;
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
      // One query per sector ("EN8 0" … "EN8 9"): a whole outcode can exceed the register's 3000-row cap.
      const sales: Sale[] = [];
      for (let digit = 0; digit <= 9; digit++) {
        const sector = await fetchSectorSales(`${outcode} ${digit}`, district, since);
        if (sector.length >= 3000) throw new Error(`${outcode} ${digit}/${district} hit the 3000-row cap; results would be incomplete`);
        sales.push(...sector);
      }
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

  if (epcCachePath) {
    const areas = await loadAreas(all, epcCachePath);
    for (const s of all) s.area = areas[homeKey(s)] ?? undefined;
    const found = all.filter((s) => s.area).length;
    console.error(`floor area found for ${found} of ${all.length} sales (${Math.round((100 * found) / all.length)}%)`);
  }

  const run = (useAreas = true): Result[] => tests.map((t) => {
    const asOf = new Date(`${t.date}T00:00:00Z`);
    const type = t.type as HomeType;
    const homeSeries = hpi[t.district];
    const indexMonth = homeSeries ? indexMonthAsOf(homeSeries, asOf) : null;
    const comps = sectorSales.get(sectorOf(t.postcode)) ?? [];
    const e = indexMonth
      ? estimateHome({
          home: { paon: t.paon, saon: t.saon, postcode: t.postcode, type, majorWork: false, area: useAreas ? t.area : undefined },
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
      hasArea: Boolean(t.area),
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
  if (epcCachePath) {
    if (args.includes("--size-grid")) {
      const errorsOf = (rows: Result[]) => rows.filter((r) => r.newFigure !== null).map((r) => Math.abs(r.newFigure! - r.price) / r.price).sort((x, y) => x - y);
      const med = (xs: number[]) => (100 * xs.at(Math.floor(xs.length / 2))!).toFixed(1);
      for (const elasticity of [0, 0.4, 0.5, 0.6, 0.7, 0.8, 1]) {
        for (const similarity of [0, 1, 2, 4]) {
          TUNING.sizeElasticity = elasticity;
          TUNING.sizeSimilarity = similarity;
          const rows = run(true);
          const all = errorsOf(rows);
          const byOutcode = outcodes.map((o) => `${o} ${med(errorsOf(rows.filter((r) => r.postcode.startsWith(`${o} `))))}`).join("  ");
          console.log(`elasticity ${elasticity}  similarity ${similarity}  median ${med(all)}%  within10 ${Math.round((100 * all.filter((e) => e <= 0.1).length) / all.length)}%  p90 ${(100 * all.at(Math.floor(all.length * 0.9))!).toFixed(0)}%  own ${med(errorsOf(rows.filter((r) => r.hadOwnSale)))}  none ${med(errorsOf(rows.filter((r) => !r.hadOwnSale)))}  | ${byOutcode}`);
        }
      }
      return;
    }
    const before = run(false);
    const after = run(true);
    const line = (name: string, keep: (r: Result) => boolean) => {
      const stats = (rows: Result[]) => {
        const errors = rows.filter((r) => r.newFigure !== null).map((r) => Math.abs(r.newFigure! - r.price) / r.price).sort((a, b) => a - b);
        const share = (limit: number) => `${Math.round((100 * errors.filter((e) => e <= limit).length) / errors.length)}%`;
        return errors.length === 0 ? "—" : `median ${(100 * errors.at(Math.floor(errors.length / 2))!).toFixed(1)}%  within5 ${share(0.05)}  within10 ${share(0.1)}  within20 ${share(0.2)}  p90 ${(100 * errors.at(Math.floor(errors.length * 0.9))!).toFixed(0)}%`;
      };
      const kept = after.map((r, i) => (keep(r) ? i : -1)).filter((i) => i >= 0);
      console.log(`${name.padEnd(34)} n ${String(kept.length).padEnd(4)} without area: ${stats(kept.map((i) => before[i]!))}\n${"".padEnd(41)} with area:    ${stats(kept.map((i) => after[i]!))}`);
    };
    line("all homes", () => true);
    line("homes with a floor area", (r) => r.hasArea);
    line("  …and an own sale", (r) => r.hasArea && r.hadOwnSale);
    line("  …and no own sale", (r) => r.hasArea && !r.hadOwnSale);
    for (const t of HOME_TYPES) line(`  ${t} with a floor area`, (r) => r.hasArea && r.type === t);
    // What half-width each confidence label's range needs to hold the real price 7 and 8 times in 10.
    for (const [name, rows] of [["without area", before], ["with area", after]] as const) {
      for (const c of ["high", "medium", "low"] as const) {
        const group = rows.filter((r) => r.confidence === c);
        const errors = group.map((r) => Math.abs(r.newFigure! - r.price) / r.price).sort((x, y) => x - y);
        const at = (p: number) => (errors.length ? (100 * errors.at(Math.floor(errors.length * p))!).toFixed(1) : "—");
        const held = group.filter((r) => r.price >= r.newLow! && r.price <= r.newHigh!).length;
        console.log(`${name.padEnd(13)} ${c.padEnd(7)} n ${String(group.length).padEnd(4)} median ${at(0.5)}%  band70 ±${at(0.7)}%  band80 ±${at(0.8)}%  current range held ${errors.length ? Math.round((100 * held) / group.length) : 0}%`);
      }
    }
    if (outPath) writeFileSync(outPath, JSON.stringify({ before, after }, null, 2));
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
