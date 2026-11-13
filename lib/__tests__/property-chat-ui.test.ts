import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const chatbotSource = readFileSync(
  new URL("../../components/ai/PropertyChatbot.tsx", import.meta.url),
  "utf8",
);

test("renders trusted source links with Next Link and the validated relative href", () => {
  assert.match(chatbotSource, /splitChatLinks\(messageView\.sources, pathname\)/);
  assert.match(chatbotSource, /chatLinks\.sources\.map/);
  assert.match(chatbotSource, /chatLinks\.listings\.map/);
  assert.match(chatbotSource, /View \{listing\.title\}/);
});

test("a home opens inside the panel, with a way back to the chat and to the site", () => {
  assert.match(chatbotSource, /<ChatPropertyView/);
  assert.match(chatbotSource, /viewHome\(property, property\.title, property\)/);
  assert.match(chatbotSource, /viewHome\(target, listing\.title\)/);
  assert.match(chatbotSource, /Back to site/);
  assert.match(chatbotSource, /addEventListener\("popstate", stepBack\)/);
  const viewSource = readFileSync(
    new URL("../../components/ai/ChatPropertyView.tsx", import.meta.url),
    "utf8",
  );
  assert.match(viewSource, /Back to chat/);
  assert.match(viewSource, /Ask Banc Bot about this home/);
  assert.match(viewSource, /Full listing/);
  assert.match(viewSource, /snap-x snap-mandatory/);
  assert.match(
    chatbotSource,
    /<Link[\s\S]*?key=\{source\.href\}[\s\S]*?href=\{source\.href\}/,
  );
});

test("renders Call and WhatsApp controls only from a trusted handoff", () => {
  assert.match(chatbotSource, /messageView\.handoff &&/);
  assert.match(chatbotSource, /href=\{messageView\.handoff\.callHref\}/);
  assert.match(chatbotSource, /href=\{messageView\.handoff\.whatsappHref\}/);
  assert.match(chatbotSource, /target="_blank"/);
  assert.match(chatbotSource, /rel="noopener noreferrer"/);
  assert.match(chatbotSource, /Call Banc/);
  assert.match(chatbotSource, /WhatsApp Banc/);
  assert.doesNotMatch(chatbotSource, /showContactAction|href="\/contact"/);
});

test("does not derive links from model prose and preserves trusted property card navigation", () => {
  assert.doesNotMatch(chatbotSource, /match\([^\n]*https?|replace\([^\n]*https?|new URL\(/);
  assert.match(chatbotSource, /getPropertyChatMessageView/);
  assert.match(chatbotSource, /buildPropertyHref\([\s\S]*?property\.department,[\s\S]*?property\.id,/);
});

test("keeps accessible mobile action and conversation lifecycle controls", () => {
  assert.match(chatbotSource, /flex-col\s+gap-2\s+sm:flex-row/);
  assert.match(chatbotSource, /min-h-11/);
  assert.match(chatbotSource, /focus-visible:ring-2/);
  assert.match(chatbotSource, /disabled=\{isLoading \|\| !input\.trim\(\)\}/);
  assert.match(chatbotSource, /startModalFocusLifecycle/);
  assert.match(chatbotSource, /restoreFocus: \(\) => helpTriggerRef\.current\?\.focus\(\)/);
  assert.match(chatbotSource, /messagesEndRef\.current\?\.scrollIntoView/);
});

test("renders the trusted form link as the chat's call to action", () => {
  assert.match(chatbotSource, /messageView\.form &&/);
  assert.match(chatbotSource, /href=\{messageView\.form\.href\}/);
  assert.match(chatbotSource, /\{messageView\.form\.title\}/);
});
