// Expert Agent property feed parser — "Agents Property data feed format v1.3".
// The feed arrives as XML (zipped with images) on an agent-specific FTP drop;
// this module parses the XML and maps properties to DbProperty rows.
// Spec: ~/Desktop/Banc Property/Documentation/expert-agent-feed-spec-v1.3.pdf

import { XMLParser } from "fast-xml-parser";
import type { DbProperty } from "./supabase";

export interface FeedRoom {
  name: string;
  measurement: string;
  description: string;
}

export interface FeedPicture {
  name: string;
  filename: string;
}

export interface FeedProperty {
  reference: string;
  branch: string;
  department: string;
  /** Feed's instructedDate as ISO, when present — the date the property was listed. */
  instructedAt?: string;
  propertyOfWeek: boolean;
  priceText: string;
  numericPrice: number;
  bedrooms: number;
  receptions: number;
  bathrooms: number;
  priority: string;
  advertHeading: string;
  mainAdvert: string;
  adverts: string[];
  address: string;
  postcode: string;
  tenure: string;
  features: string[];
  brochure: string;
  virtualTourUrl: string;
  epcImageUrl: string;
  propertyType: string;
  propertyStyle: string;
  rooms: FeedRoom[];
  pictures: FeedPicture[];
  floorplans: FeedPicture[];
}

export interface ExpertAgentFeed {
  agencyName: string;
  properties: FeedProperty[];
}

// fast-xml-parser returns an object for a single child and an array for many —
// normalise every repeatable node to an array.
function arr<T>(v: T | T[] | undefined | null): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function text(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "object") {
    const t = (v as Record<string, unknown>)["#text"];
    return t === undefined || t === null ? "" : String(t).trim();
  }
  return String(v).trim();
}

function joinAddress(parts: string[]): string {
  const kept: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (kept.length && kept[kept.length - 1].toLowerCase() === part.toLowerCase()) continue;
    kept.push(part);
  }
  return kept.join(", ");
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// instructedDate is "dd/mm/yyyy hh:mm:ss" and carries no timezone. Read
// day-first (a month-first reader turns 13/02 into an invalid date) and treat
// as UTC — it is only ever used to order listings, never displayed.
function instructedAt(value: string): string | undefined {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/);
  if (!m) return undefined;
  const [, day, month, year, hour = "00", minute = "00", second = "00"] = m;
  const at = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)),
  );
  if (Number.isNaN(at.getTime()) || at.getUTCDate() !== Number(day)) return undefined;
  return at.toISOString();
}

function mapProperty(raw: any, branch: string): FeedProperty {
  const houseNumber = text(raw.house_number);
  const street = text(raw.street);
  const firstLine = [houseNumber, street].filter(Boolean).join(" ");

  const features: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const b = text(raw[`bullet${i}`]);
    if (b) features.push(b);
  }

  const adverts: string[] = [];
  for (let i = 2; i <= 6; i++) {
    const a = text(raw[`advert${i}`]);
    if (a) adverts.push(a);
  }

  return {
    reference: text(raw["@_reference"]),
    instructedAt: instructedAt(text(raw.instructedDate)),
    branch,
    department: text(raw.department),
    propertyOfWeek: text(raw.propertyofweek).toLowerCase() === "yes",
    priceText: text(raw.price_text),
    numericPrice: Number(text(raw.numeric_price)) || 0,
    bedrooms: Number(text(raw.bedrooms)) || 0,
    receptions: Number(text(raw.receptions)) || 0,
    bathrooms: Number(text(raw.bathrooms)) || 0,
    priority: text(raw.priority),
    advertHeading: text(raw.advert_heading),
    mainAdvert: text(raw.main_advert),
    adverts,
    address: joinAddress([firstLine, text(raw.district), text(raw.town), text(raw.county)]),
    postcode: text(raw.postcode),
    tenure: text(raw.tenure),
    features,
    brochure: text(raw.brochure),
    virtualTourUrl: text(raw.virtual_tour_url),
    epcImageUrl: text(raw.epc),
    propertyType: text(raw.property_type),
    propertyStyle: text(raw.property_style),
    rooms: arr(raw.rooms?.room).map((r: any) => ({
      name: text(r["@_name"]),
      measurement: text(r.measurement_text),
      description: text(r.description),
    })),
    pictures: arr(raw.pictures?.picture).map((p: any) => ({
      name: text(p["@_name"]),
      filename: text(p.filename ?? p),
    })),
    floorplans: arr(raw.floorplans?.floorplan).map((f: any) => ({
      name: text(f["@_name"]),
      filename: text(f.filename ?? f),
    })),
  };
}

export function parseExpertAgentFeed(xml: string): ExpertAgentFeed {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
  });
  const doc = parser.parse(xml);
  const agency = doc.agency ?? {};
  const properties: FeedProperty[] = [];

  for (const branch of arr<any>(agency.branches?.branch)) {
    const branchName = text(branch["@_name"]);
    for (const raw of arr<any>(branch.properties?.property)) {
      properties.push(mapProperty(raw, branchName));
    }
  }

  return { agencyName: text(agency["@_name"]), properties };
}

// "Sold STC" and "Let STC" are completed business, not live stock. Expert
// Agent never advances them to plain "Sold"/"Let", so they accumulate: the
// 3 Sep 2026 feed carried 237 Sold STC instructed as far back as 2017 and 59
// Let STC back to 2020, against 43 genuinely on the market. Mapping them to
// under_offer/let_agreed published that entire nine-year archive as available
// property. They map to sold/let, which sit outside
// MARKETABLE_PROPERTY_STATUSES, so search, detail pages and Banc Bot all drop
// them while the rows stay for any future "recently sold" work.
const SALES_STATUS_BY_PRIORITY: Record<string, DbProperty["status"]> = {
  "on market": "for_sale",
  "under offer": "under_offer",
  "sold": "sold",
  "sold stc": "sold",
  "withdrawn": "withdrawn",
};

const LETTINGS_STATUS_BY_PRIORITY: Record<string, DbProperty["status"]> = {
  "on market": "to_let",
  "under offer": "let_agreed",
  "sold": "let",
  "sold stc": "let",
  "withdrawn": "withdrawn",
  "available to let": "to_let",
  "let stc": "let",
  "let": "let",
};

// Standard EPC bands (SAP score -> letter).
export function epcBand(score: number): string {
  if (score >= 92) return "A";
  if (score >= 81) return "B";
  if (score >= 69) return "C";
  if (score >= 55) return "D";
  if (score >= 39) return "E";
  if (score >= 21) return "F";
  return "G";
}

// Expert Agent EPC image filenames encode the four scores as EPC_CCPPccpp
// (energy current/potential, environmental current/potential, 2 digits each).
function epcRatingFromImage(url: string): string | undefined {
  // EPC_CCPPccpp (8 digits) or PEA_CCPP (4 digits) — first pair = current score
  const m = url.match(/(?:EPC_(\d{2})\d{6}|PEA_(\d{2})\d{2})/i);
  const current = m ? Number(m[1] ?? m[2]) : NaN;
  return Number.isFinite(current) ? epcBand(current) : undefined;
}

export function toDbProperty(
  p: FeedProperty
): Omit<
  DbProperty,
  | "id"
  | "created_at"
  | "updated_at"
  | "source_system"
  | "source_id"
  | "last_synced_at"
  | "is_active"
  | "search_property_type"
  | "search_tenure"
  | "search_features"
> {
  const description = [p.mainAdvert, ...p.adverts].filter(Boolean).join("\n\n");
  const lettings = /lettings/i.test(p.department);
  const fallback: DbProperty["status"] = lettings ? "to_let" : "for_sale";
  const statusByPriority = lettings
    ? LETTINGS_STATUS_BY_PRIORITY
    : SALES_STATUS_BY_PRIORITY;
  return {
    department: lettings ? "lettings" : "sales",
    expert_agent_id: p.reference,
    source_updated_at: p.instructedAt,
    title: p.advertHeading || joinAddress([p.address]),
    address: p.address,
    postcode: p.postcode,
    price: p.numericPrice,
    price_qualifier: p.priceText || undefined,
    status: statusByPriority[p.priority.toLowerCase()] ?? fallback,
    property_type: [p.propertyStyle, p.propertyType].filter(Boolean).join(" "),
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    receptions: p.receptions,
    description,
    features: p.features,
    images: p.pictures.map((pic) => pic.filename),
    tenure: p.tenure,
    epc_rating: epcRatingFromImage(p.epcImageUrl),
    epc_image_url: p.epcImageUrl,
    brochure_url: p.brochure,
    virtual_tour_url: p.virtualTourUrl,
    rooms: p.rooms.map((r) => ({
      name: r.name,
      measurement: r.measurement,
      description: r.description,
    })),
    floorplans: p.floorplans.map((f) => f.filename).filter(Boolean),
  };
}
