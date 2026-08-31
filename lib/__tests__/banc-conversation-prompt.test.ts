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

test("keeps response writing grounded and free of provider-authored contact links", () => {
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /sanitized trusted\s+result/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /Ask at most one useful question/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /Do not include\s+URLs, phone numbers, markdown links/i);
  assert.match(BANC_RESPONSE_INSTRUCTIONS, /without silently changing the search/i);
});
