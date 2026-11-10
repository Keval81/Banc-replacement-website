/**
 * Floor areas (m²) for the valuation engine. Homes sold in Banc's patch since 2020
 * come from a file built ahead of time (scripts/valuation-backtest.ts --epc), because
 * the register needs one request per home — far too slow for a live estimate. This
 * home's own area is read live when the file doesn't have it.
 */
import known from "./data/floor-areas.json" with { type: "json" };
import type { Sale } from "./engine.ts";
import { fetchFloorArea, fetchPostcodeCertificates, matchCertificate } from "./epc.ts";

type Home = { postcode: string; saon: string; paon: string };
const table = known as Record<string, number>;

export const areaKey = (home: Home) => `${home.postcode}|${home.saon}|${home.paon}`.toUpperCase();

export const withKnownAreas = (sales: Sale[]): Sale[] => sales.map((s) => (table[areaKey(s)] ? { ...s, area: table[areaKey(s)] } : s));

export async function lookupHomeArea(home: Home): Promise<number | null> {
  const filed = table[areaKey(home)];
  if (filed) return filed;
  const token = process.env.EPC_API_TOKEN;
  if (!token || !home.paon) return null;
  const match = matchCertificate(home, await fetchPostcodeCertificates(home.postcode, token));
  return match ? fetchFloorArea(match.certificateNumber, token) : null;
}
