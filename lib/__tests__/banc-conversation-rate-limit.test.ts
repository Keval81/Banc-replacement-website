import assert from "node:assert/strict";
import test from "node:test";

import {
  clientKeyFromRequest,
  createInMemoryRateLimiter,
} from "../banc-conversation/rate-limit.ts";

test("allows requests up to the per-window limit and then reports a retry delay", () => {
  const limiter = createInMemoryRateLimiter([{ limit: 3, windowMs: 60_000 }]);
  const start = 1_000_000;

  assert.deepEqual(limiter.check("a", start), { allowed: true, retryAfterSeconds: 0 });
  assert.deepEqual(limiter.check("a", start + 1_000), { allowed: true, retryAfterSeconds: 0 });
  assert.deepEqual(limiter.check("a", start + 2_000), { allowed: true, retryAfterSeconds: 0 });
  assert.deepEqual(limiter.check("a", start + 3_000), { allowed: false, retryAfterSeconds: 57 });
  // Another visitor is unaffected.
  assert.deepEqual(limiter.check("b", start + 3_000), { allowed: true, retryAfterSeconds: 0 });
  // The window slides: once the oldest hit expires the visitor may continue.
  assert.deepEqual(limiter.check("a", start + 60_001), { allowed: true, retryAfterSeconds: 0 });
});

test("enforces the slower window as well as the burst window", () => {
  const limiter = createInMemoryRateLimiter([
    { limit: 2, windowMs: 1_000 },
    { limit: 3, windowMs: 60_000 },
  ]);
  const start = 5_000_000;
  assert.equal(limiter.check("a", start).allowed, true);
  assert.equal(limiter.check("a", start + 100).allowed, true);
  assert.equal(limiter.check("a", start + 200).allowed, false);
  assert.equal(limiter.check("a", start + 2_000).allowed, true);
  const blocked = limiter.check("a", start + 4_000);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds >= 50);
});

test("derives the visitor key from proxy headers with a shared fallback", () => {
  const forwarded = new Request("https://banc.test/api/chat", {
    headers: { "x-forwarded-for": " 198.51.100.4 ,10.0.0.2" },
  });
  const real = new Request("https://banc.test/api/chat", {
    headers: { "x-real-ip": "198.51.100.5" },
  });
  const bare = new Request("https://banc.test/api/chat");

  assert.equal(clientKeyFromRequest(forwarded), "ip:198.51.100.4");
  assert.equal(clientKeyFromRequest(real), "ip:198.51.100.5");
  assert.equal(clientKeyFromRequest(bare), "ip:unknown");
});
