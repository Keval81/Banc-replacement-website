import assert from "node:assert/strict";
import test from "node:test";

import {
  BANC_INTENT_INSTRUCTIONS as INTENT_SOURCE,
  BANC_RESPONSE_INSTRUCTIONS as RESPONSE_SOURCE,
} from "../banc-conversation/prompt.ts";

const BANC_INTENT_INSTRUCTIONS = INTENT_SOURCE.replaceAll(/\s+/g, " ");
const BANC_RESPONSE_INSTRUCTIONS = RESPONSE_SOURCE.replaceAll(/\s+/g, " ");

test("keeps intent selection limited to approved operations and safe fallback", () => {
  assert.match(BANC_INTENT_INSTRUCTIONS, /one primary approved intent/i);
  assert.match(BANC_INTENT_INSTRUCTIONS, /at most one allowed supporting intent/i);
  for (const intent of [
    "update_property_search",
    "get_property_facts",
    "search_banc_knowledge",
    "reset_conversation_search",
    "contact_banc",
    "clarify",
  ]) {
    assert.match(BANC_INTENT_INSTRUCTIONS, new RegExp(intent));
  }
  assert.match(BANC_INTENT_INSTRUCTIONS, /Use clarify/);
  assert.match(BANC_INTENT_INSTRUCTIONS, /preserve/);
  assert.match(BANC_INTENT_INSTRUCTIONS, /activeProperties/);
  assert.match(BANC_INTENT_INSTRUCTIONS, /Never invent a property, id, fact, URL, policy/);
  assert.match(BANC_INTENT_INSTRUCTIONS, /bedroom language is authoritative/i);
});

test("grounds response writing in trusted results without factual authorship", () => {
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /only the trustedResults/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /visitor's current/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /recent\s+conversation/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /Acknowledge/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /Avoid repeating the same/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /Never claim an action was completed/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /No lists, markdown, emojis, links/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /never add local, market, legal, financial or Banc policy facts/i);
});
