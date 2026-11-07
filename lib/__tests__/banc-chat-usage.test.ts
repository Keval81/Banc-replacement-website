import assert from "node:assert/strict";
import test from "node:test";

import { chatUsageEvents } from "../banc-conversation/usage.ts";

const context = { resultPropertyIds: [], topic: "property_search" as const };

test("the first message of a conversation counts as a conversation started", () => {
  assert.deepEqual(chatUsageEvents({ message: "hi", history: [] }, { response: "Hello", action: "clarify", context }), [{ kind: "chat_started" }]);
});

test("a later message counts nothing unless the bot sends them to a form", () => {
  const history = [{ role: "user" as const, content: "hi" }, { role: "assistant" as const, content: "Hello" }];
  assert.deepEqual(chatUsageEvents({ message: "ok", history }, { response: "Sure", action: "answer", context }), []);
});

test("a reply carrying a form link counts which form it pointed to", () => {
  const history = [{ role: "user" as const, content: "hi" }];
  const reply = (href: string) => ({ response: "Use the form", action: "contact_team" as const, context, form: { title: "x", href } });
  assert.deepEqual(chatUsageEvents({ message: "m", history }, reply("/valuation?from=bot")), [{ kind: "chat_handoff", detail: "valuation" }]);
  assert.deepEqual(chatUsageEvents({ message: "m", history }, reply("/book-viewing/BPGC1?from=bot")), [{ kind: "chat_handoff", detail: "viewing" }]);
  assert.deepEqual(chatUsageEvents({ message: "m", history }, reply("/make-offer/BPGC1?from=bot")), [{ kind: "chat_handoff", detail: "offer" }]);
  assert.deepEqual(chatUsageEvents({ message: "m", history }, reply("/contact?from=bot")), [{ kind: "chat_handoff", detail: "contact" }]);
});
