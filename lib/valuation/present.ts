/** Wording for an instant estimate. Browser-safe: no network, no server imports. */
import type { Comparable, Confidence } from "./engine.ts";

export type InstantEstimate = {
  figure: number;
  low: number;
  high: number;
  confidence: Confidence;
  comparableCount: number;
  usedFloorArea?: boolean;
  /** This home's floor area in m², when the estimate was sized to it. */
  floorArea?: number | null;
  ownSale: { date: string; price: number; indexed: number } | null;
  homeLastSale: { date: string; price: number; used: boolean } | null;
  comparables: Comparable[];
  indexMonth: string;
};

const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`;
const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export function headlineFor(e: InstantEstimate): { figure: string | null; range: string; label: string } {
  return {
    figure: e.confidence === "low" ? null : `About ${gbp(e.figure)}`,
    range: `${gbp(e.low)} – ${gbp(e.high)}`,
    label: CONFIDENCE_LABEL[e.confidence],
  };
}

export function describeBasis(e: InstantEstimate): string {
  const sales = `${e.comparableCount} similar ${e.comparableCount === 1 ? "sale" : "sales"} nearby`;
  const sized = e.usedFloorArea && e.floorArea ? `, sized to this home's ${Math.round(e.floorArea)} m² floor area from its energy certificate` : "";
  if (e.ownSale) {
    return `Based on this home's ${e.ownSale.date.slice(0, 4)} sale, brought up to today with the UK House Price Index, and ${sales}, from HM Land Registry${sized}.`;
  }
  return `Based on ${sales}, brought up to today with the UK House Price Index, from HM Land Registry${sized}.`;
}


const monthYear = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

export function homeSaleNote(sale: { date: string; price: number; used: boolean }): string {
  return sale.used ? `Your home · sold ${monthYear(sale.date)}` : `Your home · last sold ${monthYear(sale.date)}, too long ago to rely on`;
}

export type GaugeTone = "red" | "amber" | "green";

/** The barometer on the result card: which third the needle sits in, its colour, and one plain line on what it means. */
export function confidenceGauge(confidence: Confidence): { segment: 0 | 1 | 2; tone: GaugeTone; label: string; caption: string } {
  if (confidence === "high") {
    return { segment: 2, tone: "green", label: CONFIDENCE_LABEL.high, caption: "Recent sales of similar homes nearby agree closely." };
  }
  if (confidence === "medium") {
    return { segment: 1, tone: "amber", label: CONFIDENCE_LABEL.medium, caption: "A fair guide. A visit will narrow it down." };
  }
  return { segment: 0, tone: "red", label: CONFIDENCE_LABEL.low, caption: "The sales on record are too few, or disagree too much, to narrow this down." };
}
