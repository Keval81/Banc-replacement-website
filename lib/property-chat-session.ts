// Keeps a Banc Bot conversation alive across navigation.
//
// The chat panel lives in an overlay that unmounts whenever the route
// changes, so following a property link from the chat used to destroy the
// thread. The conversation is held in sessionStorage: it survives navigation
// and a reload within the tab, and goes when the tab does — a visitor's
// property search is not something to leave on a shared machine.

import { z } from "zod";

import {
  propertyConversationStateSchema,
  publicHandoffSchema,
  safePropertyCardSchema,
  trustedSourceSchema,
  type PropertyConversationState,
} from "./banc-conversation/contracts.ts";
import type { PropertyChatMessage } from "./property-chat-submit.ts";

export const PROPERTY_CHAT_SESSION_KEY = "banc-bot-conversation";

// Enough to keep the thread readable without letting a long session grow
// past the storage quota.
const MAX_STORED_MESSAGES = 40;
const SESSION_VERSION = 1;

export interface PropertyChatSession {
  messages: PropertyChatMessage[];
  state: PropertyConversationState;
}

/** The slice of Storage this module needs — so it is testable without a DOM. */
export interface ChatSessionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const storedMessageSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    role: z.enum(["user", "assistant"]),
    content: z.string().max(8_000),
    properties: z.array(safePropertyCardSchema).optional(),
    sources: z.array(trustedSourceSchema).optional(),
    handoff: publicHandoffSchema.optional(),
    action: z.string().trim().min(1).max(64).optional(),
    timestamp: z.string().datetime(),
  })
  .strict();

const storedSessionSchema = z
  .object({
    version: z.literal(SESSION_VERSION),
    messages: z.array(storedMessageSchema).max(MAX_STORED_MESSAGES),
    state: propertyConversationStateSchema,
  })
  .strict();

/** False when the browser refuses storage, as private mode can. */
export function ableToPersist(storage: ChatSessionStorage): boolean {
  try {
    storage.getItem(PROPERTY_CHAT_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

export function loadPropertyChatSession(
  storage: ChatSessionStorage,
): PropertyChatSession | null {
  let raw: string | null;
  try {
    raw = storage.getItem(PROPERTY_CHAT_SESSION_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = storedSessionSchema.safeParse(parsed);
  if (!result.success) return null;

  return {
    state: result.data.state,
    messages: result.data.messages.map((message) => {
      const { timestamp, ...rest } = message;
      return { ...rest, timestamp: new Date(timestamp) } as PropertyChatMessage;
    }),
  };
}

export function savePropertyChatSession(
  storage: ChatSessionStorage,
  session: PropertyChatSession,
): void {
  const messages = session.messages.slice(-MAX_STORED_MESSAGES).map((message) => ({
    ...message,
    timestamp: message.timestamp.toISOString(),
  }));

  try {
    storage.setItem(
      PROPERTY_CHAT_SESSION_KEY,
      JSON.stringify({ version: SESSION_VERSION, messages, state: session.state }),
    );
  } catch {
    // A full or disabled store must never break the chat.
  }
}

export function clearPropertyChatSession(storage: ChatSessionStorage): void {
  try {
    storage.removeItem(PROPERTY_CHAT_SESSION_KEY);
  } catch {
    // As above.
  }
}
