import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routeSource = readFileSync(
  new URL("../../app/api/chat/route.ts", import.meta.url),
  "utf8",
);

test("cuts the existing POST chat route over to the Banc conversation package", () => {
  assert.match(routeSource, /createBancConversationHandler/);
  assert.match(routeSource, /createOpenAIConversationModel/);
  assert.match(routeSource, /createConversationTools/);
  assert.match(routeSource, /createPropertyPortfolio/);
  assert.match(routeSource, /createBancKnowledgeSearch/);
  assert.doesNotMatch(routeSource, /property-conversation/);
});

test("keeps dependencies at module scope and uses a random request correlation id", () => {
  assert.match(routeSource, /const handleConversation\s*=\s*createBancConversationHandler/);
  assert.match(routeSource, /randomUUID\(\)/);
});

test("rejects malformed and invalid bodies and validates every public response", () => {
  assert.match(routeSource, /request\.json\(\)/);
  assert.match(routeSource, /parseConversationRequest\(body\)/);
  assert.match(routeSource, /status:\s*400/g);
  assert.match(routeSource, /parseConversationResponse/);
});
