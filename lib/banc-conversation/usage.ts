import type { ConversationRequest, ConversationResponse } from "./contracts.ts";

export type ChatUsageEvent =
  | { kind: "chat_started" }
  | { kind: "chat_handoff"; detail: "valuation" | "viewing" | "offer" | "contact" };

/** What one chat turn adds to Banc's dashboard. Counts only: never the visitor's words. */
export function chatUsageEvents(request: ConversationRequest, response: ConversationResponse): ChatUsageEvent[] {
  const events: ChatUsageEvent[] = [];
  if (request.history.length === 0) events.push({ kind: "chat_started" });
  const path = response.form?.href.split("?")[0] ?? null;
  if (path === "/valuation") events.push({ kind: "chat_handoff", detail: "valuation" });
  else if (path?.startsWith("/book-viewing/")) events.push({ kind: "chat_handoff", detail: "viewing" });
  else if (path?.startsWith("/make-offer/")) events.push({ kind: "chat_handoff", detail: "offer" });
  else if (path === "/contact") events.push({ kind: "chat_handoff", detail: "contact" });
  return events;
}
