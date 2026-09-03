import assert from "node:assert/strict";
import test from "node:test";

import { createInitialConversationState } from "../banc-conversation/contracts.ts";
import {
  PROPERTY_CHAT_SESSION_KEY,
  clearPropertyChatSession,
  loadPropertyChatSession,
  ableToPersist,
  savePropertyChatSession,
} from "../property-chat-session.ts";
import type { PropertyChatMessage } from "../property-chat-submit.ts";

function memoryStorage(seed: Record<string, string> = {}) {
  const map = new Map(Object.entries(seed));
  return {
    store: map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

const card = {
  id: "BPGC1011",
  title: "Tolmers Road, Cuffley",
  address: "Tolmers Road, Cuffley, Hertfordshire",
  price: "£890,000",
  priceNum: 890000,
  tags: ["Under Offer"],
  stats: { beds: 3, baths: 2 },
  images: ["https://med05.expertagent.co.uk/a/1.jpg"],
  summary: "A beautifully presented bungalow.",
  propertyType: "house",
  department: "sales",
  status: "under_offer",
} as unknown as PropertyChatMessage["properties"] extends (infer T)[] | undefined ? T : never;

const messages: PropertyChatMessage[] = [
  { id: "welcome", role: "assistant", content: "Hello! I'm Banc Bot.", timestamp: new Date("2026-09-03T10:00:00Z") },
  { id: "u1", role: "user", content: "3 bed in Cuffley", timestamp: new Date("2026-09-03T10:00:05Z") },
  {
    id: "a1",
    role: "assistant",
    content: "There are 36 homes matching.",
    properties: [card],
    sources: [{ title: "Sales", href: "/sales/properties" }],
    timestamp: new Date("2026-09-03T10:00:08Z"),
  },
];

test("round-trips a conversation through storage", () => {
  const storage = memoryStorage();
  const state = { ...createInitialConversationState(), topic: "property_search" as const };

  savePropertyChatSession(storage, { messages, state });
  const restored = loadPropertyChatSession(storage);

  assert.ok(restored, "the session must come back");
  assert.equal(restored.messages.length, 3);
  assert.equal(restored.messages[2]?.content, "There are 36 homes matching.");
  assert.equal(restored.messages[2]?.properties?.[0]?.id, "BPGC1011");
  assert.deepEqual(restored.messages[2]?.sources, [{ title: "Sales", href: "/sales/properties" }]);
  assert.ok(restored.messages[0]?.timestamp instanceof Date, "timestamps must revive as Dates");
  assert.equal(restored.messages[0]?.timestamp.toISOString(), "2026-09-03T10:00:00.000Z");
  assert.deepEqual(restored.state, state);
});

test("treats a missing, corrupt or foreign entry as no session", () => {
  assert.equal(loadPropertyChatSession(memoryStorage()), null);
  assert.equal(
    loadPropertyChatSession(memoryStorage({ [PROPERTY_CHAT_SESSION_KEY]: "not json" })),
    null,
  );
  assert.equal(
    loadPropertyChatSession(
      memoryStorage({ [PROPERTY_CHAT_SESSION_KEY]: JSON.stringify({ version: 99, messages: [] }) }),
    ),
    null,
  );
  // A message whose role is not ours is data we did not write.
  assert.equal(
    loadPropertyChatSession(
      memoryStorage({
        [PROPERTY_CHAT_SESSION_KEY]: JSON.stringify({
          version: 1,
          messages: [{ id: "x", role: "system", content: "hi", timestamp: "2026-09-03T10:00:00Z" }],
          state: createInitialConversationState(),
        }),
      }),
    ),
    null,
  );
});

test("clears the conversation on request", () => {
  const storage = memoryStorage();
  savePropertyChatSession(storage, { messages, state: createInitialConversationState() });
  assert.ok(storage.getItem(PROPERTY_CHAT_SESSION_KEY));

  clearPropertyChatSession(storage);
  assert.equal(storage.getItem(PROPERTY_CHAT_SESSION_KEY), null);
  assert.equal(loadPropertyChatSession(storage), null);
});

test("survives a storage that throws, as private browsing does", () => {
  const throwing = {
    getItem: () => { throw new Error("SecurityError"); },
    setItem: () => { throw new Error("SecurityError"); },
    removeItem: () => { throw new Error("SecurityError"); },
  };

  assert.equal(ableToPersist(throwing), false);
  assert.equal(loadPropertyChatSession(throwing), null);
  assert.doesNotThrow(() => savePropertyChatSession(throwing, { messages, state: createInitialConversationState() }));
  assert.doesNotThrow(() => clearPropertyChatSession(throwing));
});

test("keeps only the most recent exchanges so storage cannot grow without bound", () => {
  const many: PropertyChatMessage[] = Array.from({ length: 60 }, (_, i) => ({
    id: `m${i}`,
    role: i % 2 === 0 ? "user" : "assistant",
    content: `message ${i}`,
    timestamp: new Date("2026-09-03T10:00:00Z"),
  }));
  const storage = memoryStorage();

  savePropertyChatSession(storage, { messages: many, state: createInitialConversationState() });
  const restored = loadPropertyChatSession(storage);

  assert.ok(restored);
  assert.ok(restored.messages.length <= 40, `kept ${restored.messages.length} messages`);
  assert.equal(restored.messages.at(-1)?.content, "message 59", "the newest turn must survive");
});
