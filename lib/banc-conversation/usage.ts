import type { ConversationRequest, ConversationResponse } from "./contracts.ts";

export type ChatUsageEvent =
  | { kind: "chat_started" }
  | { kind: "chat_results" }
  | { kind: "chat_handoff"; detail: "valuation" | "viewing" | "offer" | "contact" };

/** What one chat turn adds to Banc's dashboard. Counts only: never the visitor's words. */
export function chatUsageEvents(request: ConversationRequest, response: ConversationResponse): ChatUsageEvent[] {
  const events: ChatUsageEvent[] = [];
  // The chat window sends its greeting as history, so "started" means no earlier message from the visitor.
  if (!request.history.some((m) => m.role === "user")) events.push({ kind: "chat_started" });
  if ((response.properties?.length ?? 0) > 0) events.push({ kind: "chat_results" });
  const path = response.form?.href.split("?")[0] ?? null;
  if (path === "/valuation") events.push({ kind: "chat_handoff", detail: "valuation" });
  else if (path?.startsWith("/book-viewing/")) events.push({ kind: "chat_handoff", detail: "viewing" });
  else if (path?.startsWith("/make-offer/")) events.push({ kind: "chat_handoff", detail: "offer" });
  else if (path === "/contact") events.push({ kind: "chat_handoff", detail: "contact" });
  return events;
}

const LISTING_CODE = /^[A-Za-z0-9-]{1,40}$/;

/** The one event the browser may report: a property card opened from the chat. */
export function parsePropertyOpen(body: unknown): { kind: "chat_property_open"; property: string } | null {
  if (typeof body !== "object" || body === null) return null;
  const fields = body as Record<string, unknown>;
  if (fields.kind !== "chat_property_open") return null;
  return typeof fields.property === "string" && LISTING_CODE.test(fields.property)
    ? { kind: "chat_property_open", property: fields.property }
    : null;
}
