// Tells Banc Bot which home the visitor is looking at.
//
// The chat panel is mounted site-wide, so on a listing page (or that home's
// viewing/offer form) "is this one still available?" has an obvious subject.
// The server only answers questions about homes in the conversation's active
// results, so the page's home is placed there, first and in focus.

import type { PropertyConversationState } from "./banc-conversation/contracts.ts";

const PROPERTY_PAGE =
  /^\/(?:(?:sales|lettings)\/properties|book-viewing|make-offer)\/([A-Za-z0-9-]{1,64})\/?$/;

/** Mirrors the conversation state's cap on active results. */
const MAX_ACTIVE_RESULTS = 3;

export const PAGE_PROPERTY_WELCOME =
  "Hello! I'm Banc Bot. Ask me anything about this home, such as whether it is still available or what it offers, or tell me what you are looking for and I'll search our current homes.";

export const PAGE_PROPERTY_QUICK_REPLIES = [
  "Tell me about this home",
  "Schools nearby",
  "Is it available?",
  "Book a viewing",
] as const;

export function pagePropertyIdFromPath(pathname: string | null | undefined): string | null {
  return PROPERTY_PAGE.exec(pathname ?? "")?.[1] ?? null;
}

export function focusStateOnPageProperty(
  state: PropertyConversationState,
  propertyId: string,
): PropertyConversationState {
  if (state.focusedPropertyId === propertyId && state.resultPropertyIds[0] === propertyId) {
    return state;
  }
  return {
    ...state,
    resultPropertyIds: [
      propertyId,
      ...state.resultPropertyIds.filter((id) => id !== propertyId),
    ].slice(0, MAX_ACTIVE_RESULTS),
    focusedPropertyId: propertyId,
    topic: "property_detail",
  };
}

/** True while the conversation is about the home whose page the visitor opened. */
export function isAboutPageProperty(state: PropertyConversationState): boolean {
  return state.topic === "property_detail" &&
    state.focusedPropertyId !== undefined &&
    state.resultPropertyIds[0] === state.focusedPropertyId &&
    state.query === undefined;
}

const LISTING_LINK = /^\/(?:sales|lettings)\/properties\/([A-Za-z0-9-]{1,64})$/;

type ChatLink = { title: string; href: string };

/**
 * A reply's links are either homes it talked about or guidance it drew on.
 * The panel shows them under different headings, and leaves out the listing
 * the visitor is already looking at.
 */
export function splitChatLinks(
  links: readonly ChatLink[],
  pathname: string | null | undefined,
): { listings: ChatLink[]; sources: ChatLink[] } {
  const currentId = pagePropertyIdFromPath(pathname);
  const listings: ChatLink[] = [];
  const sources: ChatLink[] = [];
  for (const link of links) {
    const listingId = LISTING_LINK.exec(link.href)?.[1];
    if (listingId === undefined) sources.push(link);
    else if (listingId !== currentId) listings.push(link);
  }
  return { listings, sources };
}
