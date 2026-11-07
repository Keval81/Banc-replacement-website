// Count-only form events for the DI client portal's "Your website" dashboard.
// Never carries personal data, and never fails the visitor's enquiry.

import { ENQUIRY_SUBJECTS } from "./property-enquiry.ts";

export type FormEventKind = "contact" | "valuation" | "viewing" | "offer";
export type FormEvent = { kind: FormEventKind; property?: string; via?: "bot" };
export type PortalEvent =
  | FormEvent
  | { kind: "chat_started" }
  | { kind: "chat_results" }
  | { kind: "chat_property_open"; property: string }
  | { kind: "chat_handoff"; detail: "valuation" | "viewing" | "offer" | "contact" };

type PortalDeps = {
  url: string | undefined;
  token: string | undefined;
  fetch: (url: string, init: RequestInit) => Promise<Response>;
};

const TIMEOUT_MS = 3000;
const PROPERTY_SUBJECT = new RegExp(
  `^(${ENQUIRY_SUBJECTS.viewing}|${ENQUIRY_SUBJECTS.offer}) — ([A-Za-z0-9-]{1,40})$`,
);

export function classifyContactSubject(subject: string): FormEvent {
  const match = PROPERTY_SUBJECT.exec(subject.trim());
  if (!match) return { kind: "contact" };
  return { kind: match[1] === ENQUIRY_SUBJECTS.viewing ? "viewing" : "offer", property: match[2]! };
}

export async function reportFormEvent(
  event: PortalEvent,
  deps: PortalDeps = { url: process.env.PORTAL_INGEST_URL, token: process.env.PORTAL_INGEST_TOKEN, fetch },
): Promise<boolean> {
  if (!deps.url || !deps.token) return false;
  try {
    const response = await deps.fetch(deps.url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${deps.token}` },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.ok) return true;
    console.error(`[Portal events] ${event.kind} count rejected by the portal: HTTP ${response.status}`);
    return false;
  } catch (error) {
    console.error(`[Portal events] ${event.kind} count not sent to the portal:`, error);
    return false;
  }
}

/** "bot" when the form's page was opened from a Banc Bot link (?from=bot), read from the request's Referer. */
export function viaFromReferer(referer: string | null): "bot" | undefined {
  if (!referer) return undefined;
  try {
    return new URL(referer).searchParams.get("from") === "bot" ? "bot" : undefined;
  } catch {
    return undefined;
  }
}

/** Keeps "this visitor came from Banc Bot" on a site link when the current page carries ?from=bot. */
export function withBotTag(href: string, currentSearch: string): string {
  if (!href.startsWith("/")) return href;
  return new URLSearchParams(currentSearch).get("from") === "bot" ? `${href}${href.includes("?") ? "&" : "?"}from=bot` : href;
}
