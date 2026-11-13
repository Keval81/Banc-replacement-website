// A home shown inside the chat panel, so a visitor can look at it properly
// without leaving the conversation.

import { getSafePropertyImageUrl } from "./property-detail-view.ts";
import type { PropertyCardData } from "./property-view.ts";
import { readableLabel } from "./readable-label.ts";

export interface PropertyPeek {
  id: string;
  department: "sales" | "lettings";
  title: string;
  address: string;
  price: string;
  tag: string | null;
  /** For sale or to let: only then is a viewing offered. */
  available: boolean;
  images: string[];
  /** "4 bedrooms", "2 bathrooms", "3 receptions", "Freehold". */
  facts: string[];
  features: string[];
  description: string[];
  floorplan: string | null;
}

const LISTING_HREF = /^\/(sales|lettings)\/properties\/([A-Za-z0-9-]{1,64})(?:\?from=bot)?$/;
const MAX_FEATURES = 12;
const MAX_PARAGRAPHS = 6;

export function listingFromHref(
  href: string,
): { id: string; department: "sales" | "lettings" } | null {
  const match = LISTING_HREF.exec(href);
  return match === null
    ? null
    : { id: match[2]!, department: match[1] as "sales" | "lettings" };
}

function counted(count: unknown, singular: string): string[] {
  return typeof count === "number" && Number.isInteger(count) && count > 0
    ? [`${count} ${singular}${count === 1 ? "" : "s"}`]
    : [];
}

function safeImages(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.flatMap((value) => {
    const url = typeof value === "string" ? getSafePropertyImageUrl(value) : null;
    return url === null ? [] : [url];
  });
}

function text(value: unknown, maximum: number): string {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

/** What a search card already carries: enough to open the view at once. */
export function peekFromCard(card: PropertyCardData): PropertyPeek {
  return {
    id: card.id,
    department: card.department,
    title: card.title,
    address: card.address,
    price: card.price,
    tag: card.tags[0] ?? null,
    available: card.status === "for_sale" || card.status === "to_let",
    images: safeImages(card.images),
    facts: [...counted(card.stats.beds, "bedroom"), ...counted(card.stats.baths, "bathroom")],
    features: [],
    description: card.summary ? [card.summary] : [],
    floorplan: null,
  };
}

/** The fuller record from /api/properties/[id]. Null unless it is a usable listing. */
export function parsePropertyPeek(payload: unknown): PropertyPeek | null {
  const property = typeof payload === "object" && payload !== null
    ? (payload as { property?: unknown }).property
    : null;
  if (typeof property !== "object" || property === null) return null;
  const record = property as Record<string, unknown>;

  const id = text(record.id, 64);
  const title = text(record.title, 240);
  const price = text(record.price, 120);
  const department = record.department;
  if (!id || !title || !price || (department !== "sales" && department !== "lettings")) {
    return null;
  }

  const stats = typeof record.stats === "object" && record.stats !== null
    ? (record.stats as Record<string, unknown>)
    : {};
  const tenure = text(record.tenure, 40);
  const firstFloorplan = Array.isArray(record.floorplans) ? record.floorplans[0] : null;
  const floorplanUrl = typeof firstFloorplan === "object" && firstFloorplan !== null
    ? (firstFloorplan as { url?: unknown }).url
    : null;
  const tags = Array.isArray(record.tags) ? record.tags : [];

  return {
    id,
    department,
    title,
    address: text(record.address, 240),
    price,
    tag: text(tags[0], 40) || null,
    available: record.status === "for_sale" || record.status === "to_let",
    images: safeImages(record.images),
    facts: [
      ...counted(stats.beds, "bedroom"),
      ...counted(stats.baths, "bathroom"),
      ...counted(record.receptions, "reception"),
      ...(tenure ? [tenure] : []),
    ],
    features: (Array.isArray(record.features) ? record.features : [])
      .flatMap((feature) => {
        const label = text(feature, 160);
        return label ? [readableLabel(label)] : [];
      })
      .slice(0, MAX_FEATURES),
    description: (text(record.description, 6_000) || text(record.summary, 2_000))
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      // Some listings repeat their opening paragraph.
      .filter((paragraph, index, all) => paragraph.length > 0 && all.indexOf(paragraph) === index)
      .slice(0, MAX_PARAGRAPHS),
    floorplan: safeImages([floorplanUrl])[0] ?? null,
  };
}
