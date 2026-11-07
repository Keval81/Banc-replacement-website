/**
 * The instant valuation as the website uses it: gathers the register data for one
 * home, runs the engine, and words the result. Network calls are injected so the
 * wiring is testable; the engine itself is pure (engine.ts).
 */
import { lookupOutcodeDistricts, postcodeSector, registerTypeFor } from "../valuation-estimate.ts";
import { estimateHome, type HpiSeries, type Sale } from "./engine.ts";
import { fetchAreaSales, fetchHpiForDistricts, fetchPostcodeHistory } from "./register.ts";

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
  /** One query for the whole sector, every council it spans. */
  areaSales: (sector: string, districts: string[], sinceIso: string) => Promise<Sale[]>;
  /** Price index for several councils, keyed by every name each goes by. */
  hpi: (districts: string[]) => Promise<Record<string, HpiSeries>>;
};

const DAY_MS = 86_400_000;
const DIRECTOR_LED_OUTCODE = /^W1[A-Z]?$/;
const HPI_TTL_MS = 12 * 60 * 60 * 1000;
const hpiCache = new Map<string, { at: number; hpi: Record<string, HpiSeries> }>();

async function cachedHpi(districts: string[]): Promise<Record<string, HpiSeries>> {
  const key = [...districts].map((d) => d.toUpperCase()).sort().join("|");
  const hit = hpiCache.get(key);
  if (hit && Date.now() - hit.at < HPI_TTL_MS) return hit.hpi;
  const hpi = await fetchHpiForDistricts(districts);
  hpiCache.set(key, { at: Date.now(), hpi });
  return hpi;
}

export const liveDeps: InstantDeps = {
  districts: (postcode) => lookupOutcodeDistricts(postcode),
  history: (postcode) => fetchPostcodeHistory(postcode),
  areaSales: (sector, districts, sinceIso) => fetchAreaSales(sector, districts, sinceIso),
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
  const homeDistrict = history.find((s) => s.district)?.district ?? districts[0]!.toUpperCase();
  const councils = [...new Set([...districts, homeDistrict])];
  const [comps, hpi] = await Promise.all([deps.areaSales(sector, councils, sinceIso), deps.hpi(councils)]);
  const homeSeries = hpi[homeDistrict.toUpperCase()] ?? Object.values(hpi)[0];
  const indexMonth = homeSeries ? Object.keys(homeSeries).sort().at(-1) : undefined;
  if (!indexMonth) return null;

  const estimate = estimateHome({
    home: {
      paon: input.paon ?? "",
      saon: input.saon,
      postcode,
      type: input.propertyType ? registerTypeFor(input.propertyType) : null,
      // Prime central London prices turn on things public records can't see (Banc's Mayfair office): director-led.
      majorWork: input.majorWork || DIRECTOR_LED_OUTCODE.test(postcode.split(" ")[0] ?? ""),
    },
    history,
    comps,
    hpi,
    homeDistrict,
    asOf,
    indexMonth,
  });
  if (!estimate) return null;
  const { ownSale, ...rest } = estimate;
  return { ...rest, ownSale: ownSale ? { date: ownSale.date, price: ownSale.price, indexed: ownSale.indexed } : null };
}
