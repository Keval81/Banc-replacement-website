import assert from "node:assert/strict";
import test from "node:test";

import { subscribeToNewsletter } from "../newsletter-subscribe.ts";

function fakeFetch(status: number, body: unknown) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher = async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
  };
  return { fetcher, calls };
}

test("posts the address to the newsletter API and reports success", async () => {
  const { fetcher, calls } = fakeFetch(200, { success: true });

  const result = await subscribeToNewsletter("someone@example.com", fetcher);

  assert.equal(result.ok, true);
  assert.equal(calls[0].url, "/api/newsletter");
  assert.equal(calls[0].init?.method, "POST");
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { email: "someone@example.com" });
});

test("an address that is already subscribed still counts as success", async () => {
  const { fetcher } = fakeFetch(409, { error: "This email is already subscribed" });

  const result = await subscribeToNewsletter("someone@example.com", fetcher);

  assert.equal(result.ok, true);
});

test("a failed send is reported honestly with the server's message", async () => {
  const { fetcher } = fakeFetch(502, { error: "We could not save your sign-up just now." });

  const result = await subscribeToNewsletter("someone@example.com", fetcher);

  assert.equal(result.ok, false);
  assert.equal(result.message, "We could not save your sign-up just now.");
});

test("a network failure is reported honestly too", async () => {
  const fetcher = async () => { throw new Error("offline"); };

  const result = await subscribeToNewsletter("someone@example.com", fetcher);

  assert.equal(result.ok, false);
  assert.match(result.message, /try again|email the office/i);
});
