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

const STATUS_BY_PRIORITY: Record<string, DbProperty["status"]> = {
  "on market": "for_sale",
  "under offer": "under_offer",
  "sold": "sold",
  "sold stc": "under_offer",
  "withdrawn": "withdrawn",
  "available to let": "to_let",
  "let stc": "let_agreed",
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
): Omit<DbProperty, "id" | "created_at" | "updated_at"> {
  const description = [p.mainAdvert, ...p.adverts].filter(Boolean).join("\n\n");
  const lettings = /lettings/i.test(p.department);
  const fallback: DbProperty["status"] = lettings ? "to_let" : "for_sale";
  return {
    department: lettings ? "lettings" : "sales",
    expert_agent_id: p.reference,
    title: p.advertHeading || joinAddress([p.address]),
    address: p.address,
    postcode: p.postcode,
    price: p.numericPrice,
    price_qualifier: p.priceText || undefined,
    status: STATUS_BY_PRIORITY[p.priority.toLowerCase()] ?? fallback,
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
