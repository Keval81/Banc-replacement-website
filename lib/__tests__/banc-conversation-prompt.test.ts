import assert from "node:assert/strict";
import test from "node:test";

import {
  BANC_INTENT_INSTRUCTIONS,
  BANC_RESPONSE_INSTRUCTIONS,
} from "../banc-conversation/prompt.ts";

test("keeps intent selection limited to approved operations and safe fallback", () => {
  assert.match(BANC_INTENT_INSTRUCTIONS, /one primary approved intent/i);
  assert.match(BANC_INTENT_INSTRUCTIONS, /at most one allowed supporting intent/i);
  assert.match(BANC_INTENT_INSTRUCTIONS, /search_banc_knowledge/);
  assert.match(BANC_INTENT_INSTRUCTIONS, /Use clarify/);
  assert.match(BANC_INTENT_INSTRUCTIONS, /bedroom language is authoritative/i);
});

test("selects a conversational option without giving the provider factual authorship", () => {
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /server-authored response option/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /visitor's current/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /recent conversation/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /acknowledges/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /Avoid repeating the same/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /Return only its responseId/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /server owns all factual wording/i);
});
