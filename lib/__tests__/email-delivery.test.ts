import assert from "node:assert/strict";
import test from "node:test";

import { isMailConfigured, sendEmail } from "../email.ts";

/**
 * These guard the defect that would have shipped on launch day: the provider
 * defaulted to a "mock" that logged to a serverless console nobody reads and
 * returned success, so every viewing request, valuation and enquiry the site
 * captured was discarded while the visitor was told it had been sent.
 *
 * The rule these encode: a message that did not leave the building is never
 * reported as sent.
 */

function withEnv<T>(vars: Record<string, string | undefined>, run: () => T): T {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(vars)) {
    previous.set(key, process.env[key]);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

/** A fetch stand-in that records the Resend call instead of making it. */
function captureFetch(status = 200, body: unknown = { id: "re_123" }) {
  const calls: { url: string; payload: Record<string, unknown>; auth: string }[] = [];
  const fetcher = async (url: string, init: RequestInit) => {
    calls.push({
      url,
      payload: JSON.parse(String(init.body)),
      auth: String((init.headers as Record<string, string>).Authorization ?? ""),
    });
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
      json: async () => body,
    } as Response;
  };
  return { calls, fetcher };
}

const message = {
  to: "sales@bancproperty.com",
  subject: "Viewing request — BPGC1479",
  html: "<p>Tuesday 16 September, 2:00pm</p>",
  replyTo: "sarah.whitfield@gmail.com",
};

test("reports failure when no mail provider is configured", async () => {
  const { calls, fetcher } = captureFetch();
  const result = await withEnv({ RESEND_API_KEY: undefined }, () =>
    sendEmail(message, fetcher),
  );

  assert.equal(
    result.ok,
    false,
    "an unconfigured mailer must not claim the message was sent",
  );
  assert.equal(result.reason, "mail-not-configured");
  assert.equal(calls.length, 0, "nothing should be sent without credentials");
});

test("isMailConfigured tells the route whether sending is even possible", () => {
  assert.equal(withEnv({ RESEND_API_KEY: undefined }, isMailConfigured), false);
  assert.equal(withEnv({ RESEND_API_KEY: "re_live_key" }, isMailConfigured), true);
});

test("sends through Resend with the sender, recipient and reply-to set", async () => {
  const { calls, fetcher } = captureFetch();
  const result = await withEnv(
    {
      RESEND_API_KEY: "re_live_key",
      CONTACT_FROM: "Banc Property Group <banc@digitalinroads.com>",
    },
    () => sendEmail(message, fetcher),
  );

  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
  const [call] = calls;
  assert.equal(call.url, "https://api.resend.com/emails");
  assert.equal(call.auth, "Bearer re_live_key");
  assert.equal(call.payload.from, "Banc Property Group <banc@digitalinroads.com>");
  assert.deepEqual(call.payload.to, ["sales@bancproperty.com"]);
  assert.equal(
    call.payload.reply_to,
    "sarah.whitfield@gmail.com",
    "pressing reply on the Banc notification has to reach the customer",
  );
});

test("reports failure when the provider rejects the message", async () => {
  const { fetcher } = captureFetch(422, { message: "domain is not verified" });
  const result = await withEnv({ RESEND_API_KEY: "re_live_key" }, () =>
    sendEmail(message, fetcher),
  );

  assert.equal(result.ok, false, "a rejected message must not be reported as sent");
  assert.equal(result.reason, "mail-send-failed");
});

test("reports failure when the provider cannot be reached at all", async () => {
  const fetcher = async () => {
    throw new Error("ECONNRESET");
  };
  const result = await withEnv({ RESEND_API_KEY: "re_live_key" }, () =>
    sendEmail(message, fetcher),
  );

  assert.equal(result.ok, false);
  assert.equal(result.reason, "mail-send-failed");
});

test("the sender falls back to a verified Digital Inroads address", async () => {
  // Until bancproperty.com carries its own authentication records, mail goes
  // out on the Digital Inroads verified domain with Banc's name on the front —
  // the same arrangement Your Panacea has been running on since July.
  const { calls, fetcher } = captureFetch();
  await withEnv({ RESEND_API_KEY: "re_live_key", CONTACT_FROM: undefined }, () =>
    sendEmail(message, fetcher),
  );

  const from = String(calls[0].payload.from);
  assert.match(from, /^Banc Property Group </, "the display name must read as Banc");
  assert.match(from, /@digitalinroads\.com>$/, "and the address must be on a verified domain");
});
