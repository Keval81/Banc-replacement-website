/**
 * The instant valuation as the website uses it: gathers the register data for one
 * home, runs the engine, and words the result. Network calls are injected so the
 * wiring is testable; the engine itself is pure (engine.ts).
 */
import { lookupOutcodeDistricts, postcodeSector, registerTypeFor } from "../valuation-estimate.ts";
import { estimateHome, type HpiSeries, type Sale } from "./engine.ts";
import { fetchHpi, fetchPostcodeHistory, fetchSectorSales } from "./register.ts";

export { describeBasis, headlineFor, type InstantEstimate } from "./present.ts";
import type { InstantEstimate } from "./present.ts";

export type AddressOption = { paon: string; saon: string; label: string };

const titleCase = (text: string) =>
  text
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\b(\d+)([a-z])\b/gi, (_, d: string, l: string) => `${d}${l.toUpperCase()}`);

const houseOrder = (paon: string): [number, string] => {
  const m = /^(\d+)(.*)$/.exec(paon.trim());
  return m ? [Number(m[1]), m[2]!.trim()] : [Number.POSITIVE_INFINITY, paon];
};

/** The addresses a postcode's sale history knows about, once each, in house-number order. */
export function addressesFromHistory(sales: Sale[]): AddressOption[] {
  const seen = new Map<string, AddressOption>();
  for (const s of sales) {
    const key = `${s.saon.trim().toUpperCase()}|${s.paon.trim().toUpperCase()}`;
    if (!s.paon.trim() || seen.has(key)) continue;
    const numbered = /^\d/.test(s.paon.trim());
    const main = numbered ? `${titleCase(s.paon)} ${titleCase(s.street)}` : `${titleCase(s.paon)}, ${titleCase(s.street)}`;
    seen.set(key, { paon: s.paon.trim(), saon: s.saon.trim(), label: s.saon.trim() ? `${titleCase(s.saon)}, ${main}` : main });
  }
  return [...seen.values()].sort((a, b) => {
    const [na, ra] = houseOrder(a.paon);
    const [nb, rb] = houseOrder(b.paon);
    return na - nb || ra.localeCompare(rb) || a.saon.localeCompare(b.saon, undefined, { numeric: true });
  });
}

/** "14 The Ridgeway" → "14"; used when the visitor typed their address instead of picking it. */
export function houseNumberFrom(address: string): string | null {
  const m = /^\s*(\d+[A-Za-z]?)\b/.exec(address);
  return m ? m[1]!.toUpperCase() : null;
}

export type InstantDeps = {
  districts: (postcode: string) => Promise<string[]>;
  history: (postcode: string) => Promise<Sale[]>;
  sectorSales: (sector: string, district: string, sinceIso: string) => Promise<Sale[]>;
  hpi: (district: string) => Promise<HpiSeries>;
};

const DAY_MS = 86_400_000;
const HPI_TTL_MS = 12 * 60 * 60 * 1000;
const hpiCache = new Map<string, { at: number; series: HpiSeries }>();

async function cachedHpi(district: string): Promise<HpiSeries> {
  const hit = hpiCache.get(district);
  if (hit && Date.now() - hit.at < HPI_TTL_MS) return hit.series;
  const series = await fetchHpi(district);
  hpiCache.set(district, { at: Date.now(), series });
  return series;
}

export const liveDeps: InstantDeps = {
  districts: (postcode) => lookupOutcodeDistricts(postcode),
  history: (postcode) => fetchPostcodeHistory(postcode),
  sectorSales: (sector, district, sinceIso) => fetchSectorSales(sector, district, sinceIso),
  hpi: cachedHpi,
};

export async function runInstantValuation(
  input: { postcode: string; paon: string | null; saon: string; propertyType?: string; majorWork: boolean },
  deps: InstantDeps = liveDeps,
  asOf: Date = new Date(),
): Promise<InstantEstimate | null> {
  const sector = postcodeSector(input.postcode);
  if (!sector) return null;
  const postcode = input.postcode.trim().toUpperCase().replace(/\s+/g, "").replace(/(\d[A-Z]{2})$/, " $1");
  const sinceIso = new Date(asOf.getTime() - 5 * 365 * DAY_MS).toISOString().slice(0, 10);

  const [districts, history] = await Promise.all([deps.districts(postcode), deps.history(postcode)]);
  if (districts.length === 0) return null;
  const [sectorSales, series] = await Promise.all([
    Promise.all(districts.map((d) => deps.sectorSales(sector, d, sinceIso))),
    Promise.all(districts.map(async (d) => [d, await deps.hpi(d)] as const)),
  ]);
  const hpi = Object.fromEntries(series);
  const homeDistrict = history.find((s) => s.district)?.district ?? districts[0]!;
  const homeSeries = hpi[homeDistrict] ?? hpi[districts[0]!];
  const indexMonth = homeSeries ? Object.keys(homeSeries).sort().at(-1) : undefined;
  if (!indexMonth) return null;

  const estimate = estimateHome({
    home: {
      paon: input.paon ?? "",
      saon: input.saon,
      postcode,
      type: input.propertyType ? registerTypeFor(input.propertyType) : null,
      majorWork: input.majorWork,
    },
    history,
    comps: sectorSales.flat(),
    hpi,
    homeDistrict,
    asOf,
    indexMonth,
  });
  if (!estimate) return null;
  const { ownSale, ...rest } = estimate;
  return { ...rest, ownSale: ownSale ? { date: ownSale.date, price: ownSale.price, indexed: ownSale.indexed } : null };
}
