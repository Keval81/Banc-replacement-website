/**
 * HM Land Registry reads for the valuation engine: a full postcode's whole sale
 * history, a sector's recent sales, and the UK House Price Index. Relative
 * imports only, so the back-test can run it outside Next.
 */
import { parseRegisterPropertyType } from "../api/land-registry-mapping.ts";
import type { HomeType, HpiSeries, IndexKey, Sale } from "./engine.ts";

const QUERY_URL = "https://landregistry.data.gov.uk/landregistry/query";
const TIMEOUT_MS = 8000;
// UK HPI is published about two months after the month it measures.
const HPI_LAG_MONTHS = 2;

type Row = Record<string, { value: string } | undefined>;
type Fetch = typeof fetch;

const val = (row: Row, key: string) => row[key]?.value?.trim() ?? "";

export function parseSaleRow(row: Row): Sale | null {
  const price = Number(val(row, "price"));
  const date = val(row, "date").slice(0, 10);
  if (!Number.isFinite(price) || price <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const type = parseRegisterPropertyType(val(row, "type"));
  return {
    price,
    date,
    paon: val(row, "paon"),
    saon: val(row, "saon"),
    street: val(row, "street"),
    postcode: val(row, "postcode"),
    type: type as HomeType | "other",
    standard: !val(row, "cat").endsWith("additionalPricePaidTransaction"),
    newBuild: val(row, "nb") === "true",
    district: val(row, "district").toUpperCase(),
  };
}

export const regionSlug = (district: string) => district.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function parseHpiRows(rows: Row[]): HpiSeries {
  const series: HpiSeries = {};
  const num = (row: Row, key: string) => Number(val(row, key)) || 0;
  for (const row of rows) {
    const month = val(row, "month");
    if (!/^\d{4}-\d{2}$/.test(month)) continue;
    const all = num(row, "all");
    const entry: Record<IndexKey, number> = {
      detached: num(row, "det") || all,
      "semi-detached": num(row, "semi") || all,
      terraced: num(row, "ter") || all,
      flat: num(row, "flat") || all,
      all,
    };
    series[month] = entry;
  }
  return series;
}

export function indexMonthAsOf(series: HpiSeries, asOf: Date): string | null {
  const cutoff = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() - HPI_LAG_MONTHS, 1)).toISOString().slice(0, 7);
  const months = Object.keys(series).filter((m) => m <= cutoff).sort();
  return months.at(-1) ?? null;
}

async function query(sparql: string, fetcher: Fetch): Promise<Row[]> {
  const response = await fetcher(QUERY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: `query=${encodeURIComponent(sparql)}`,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Land Registry query failed: HTTP ${response.status}`);
  const body = (await response.json()) as { results?: { bindings?: Row[] } };
  return body.results?.bindings ?? [];
}

const SALE_FIELDS = `
  OPTIONAL { ?addr lrcommon:paon ?paon } OPTIONAL { ?addr lrcommon:saon ?saon }
  OPTIONAL { ?addr lrcommon:street ?street } OPTIONAL { ?addr lrcommon:district ?district }
  OPTIONAL { ?item lrppi:propertyType ?type } OPTIONAL { ?item lrppi:transactionCategory ?cat }
  OPTIONAL { ?item lrppi:newBuild ?nb }`;
const PREFIXES = `PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>`;
const clean = (text: string) => text.replace(/["\\]/g, "");

/** Every sale ever registered in one full postcode — where a home's own last sale is found. */
export async function fetchPostcodeHistory(postcode: string, fetcher: Fetch = fetch): Promise<Sale[]> {
  const pc = clean(postcode.trim().toUpperCase().replace(/\s+/g, " "));
  const rows = await query(
    `${PREFIXES}
SELECT ?price ?date ?paon ?saon ?street ?postcode ?district ?type ?cat ?nb WHERE {
  ?addr lrcommon:postcode "${pc}" . BIND("${pc}" AS ?postcode)
  ?item lrppi:propertyAddress ?addr ; lrppi:pricePaid ?price ; lrppi:transactionDate ?date .
  ${SALE_FIELDS}
}`,
    fetcher,
  );
  return rows.map(parseSaleRow).filter((s): s is Sale => s !== null);
}

/** A sector's sales since a date, in one council (the register's district index keeps this fast). */
export async function fetchSectorSales(sector: string, district: string, sinceIso: string, fetcher: Fetch = fetch): Promise<Sale[]> {
  const rows = await query(
    `${PREFIXES}
SELECT ?price ?date ?paon ?saon ?street ?postcode ?district ?type ?cat ?nb WHERE {
  ?item lrppi:pricePaid ?price ; lrppi:transactionDate ?date ; lrppi:propertyAddress ?addr .
  ?addr lrcommon:postcode ?postcode ; lrcommon:district "${clean(district.toUpperCase())}" .
  FILTER(STRSTARTS(STR(?postcode), "${clean(sector.toUpperCase())} "))
  FILTER(?date >= "${clean(sinceIso)}"^^xsd:date)
  ${SALE_FIELDS}
}
LIMIT 3000`,
    fetcher,
  );
  return rows.map(parseSaleRow).filter((s): s is Sale => s !== null);
}

/** One council's UK HPI by month and property type, from 2010. */
export async function fetchHpi(district: string, fetcher: Fetch = fetch): Promise<HpiSeries> {
  const rows = await query(
    `PREFIX ukhpi: <http://landregistry.data.gov.uk/def/ukhpi/>
SELECT ?month ?det ?semi ?ter ?flat ?all WHERE {
  ?obs ukhpi:refRegion <http://landregistry.data.gov.uk/id/region/${regionSlug(district)}> ; ukhpi:refMonth ?month .
  OPTIONAL { ?obs ukhpi:housePriceIndexDetached ?det } OPTIONAL { ?obs ukhpi:housePriceIndexSemiDetached ?semi }
  OPTIONAL { ?obs ukhpi:housePriceIndexTerraced ?ter } OPTIONAL { ?obs ukhpi:housePriceIndexFlatMaisonette ?flat }
  OPTIONAL { ?obs ukhpi:housePriceIndex ?all }
  FILTER(?month >= "2010-01"^^xsd:gYearMonth)
}`.replace("PREFIX ukhpi:", "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\nPREFIX ukhpi:"),
    fetcher,
  );
  return parseHpiRows(rows);
}
