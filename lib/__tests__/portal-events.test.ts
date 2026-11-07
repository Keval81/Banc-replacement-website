import assert from "node:assert/strict";
import { test } from "node:test";

import { classifyContactSubject, reportFormEvent, viaFromReferer } from "../portal-events.ts";

test("a viewing request names its listing", () => {
  assert.deepEqual(classifyContactSubject("Viewing request — BPGC1986"), { kind: "viewing", property: "BPGC1986" });
});

test("an offer names its listing", () => {
  assert.deepEqual(classifyContactSubject("Offer submission — BPGC357"), { kind: "offer", property: "BPGC357" });
});

test("every other subject counts as a message with no listing", () => {
  assert.deepEqual(classifyContactSubject("General Enquiry"), { kind: "contact" });
  assert.deepEqual(classifyContactSubject("Property alert sign-up"), { kind: "contact" });
});

test("sends the count to the portal with the bearer key", async () => {
  const sent: { url: string; init: RequestInit }[] = [];
  const ok = await reportFormEvent(
    { kind: "viewing", property: "BPGC1" },
    {
      url: "https://portal.example/api/banc/enquiry-events",
      token: "k".repeat(43),
      fetch: async (url, init) => {
        sent.push({ url: String(url), init: init ?? {} });
        return new Response(null, { status: 204 });
      },
    },
  );
  assert.equal(ok, true);
  assert.equal(sent[0]!.url, "https://portal.example/api/banc/enquiry-events");
  assert.equal((sent[0]!.init.headers as Record<string, string>).authorization, `Bearer ${"k".repeat(43)}`);
  assert.deepEqual(JSON.parse(String(sent[0]!.init.body)), { kind: "viewing", property: "BPGC1" });
});

test("a portal failure is logged, never thrown, so the visitor's enquiry still succeeds", async (t) => {
  const logged = t.mock.method(console, "error", () => {});
  const ok = await reportFormEvent(
    { kind: "contact" },
    {
      url: "https://portal.example/x",
      token: "k".repeat(43),
      fetch: async () => {
        throw new TypeError("fetch failed");
      },
    },
  );
  assert.equal(ok, false);
  assert.equal(logged.mock.callCount(), 1);
});

test("does nothing when the portal isn't configured", async () => {
  let called = false;
  const ok = await reportFormEvent(
    { kind: "contact" },
    { url: undefined, token: undefined, fetch: async () => ((called = true), new Response(null)) },
  );
  assert.equal(ok, false);
  assert.equal(called, false);
});

test("a form sent from a page the chatbot linked to is marked as reached via the bot", () => {
  assert.equal(viaFromReferer("https://bancproperty.com/valuation?from=bot"), "bot");
  assert.equal(viaFromReferer("https://bancproperty.com/book-viewing/BPGC1986?from=bot"), "bot");
  assert.equal(viaFromReferer("https://bancproperty.com/valuation"), undefined);
  assert.equal(viaFromReferer("https://bancproperty.com/valuation?from=bot-ish"), undefined);
  assert.equal(viaFromReferer(null), undefined);
  assert.equal(viaFromReferer("not a url"), undefined);
});
