import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { dispatchPropertySync, SYNC_WORKFLOW_FILE } from "../sync-dispatch.ts";

const vercelConfig = JSON.parse(
  readFileSync(join(process.cwd(), "vercel.json"), "utf8"),
);
const envExample = readFileSync(join(process.cwd(), ".env.example"), "utf8");

function stubFetch(
  response: { status: number; body?: string },
  calls: { url: string; init: RequestInit }[],
) {
  return async (url: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    // 204 is what a real dispatch returns, and Response forbids a body with it.
    return new Response(response.body ?? null, { status: response.status });
  };
}

test("schedules the trigger every half hour so a dropped slot costs 30 minutes", () => {
  // GitHub's own scheduler is best-effort: the workflow asks for hourly and
  // delivered 6.1 runs a day over the week to 17 Sep, median gap 4h. Vercel
  // Pro crons fire on time, so this is what actually keeps the feed fresh.
  const cron = vercelConfig.crons.find(
    (entry: { path: string }) => entry.path === "/api/cron/trigger-sync",
  );
  assert.ok(cron, "vercel.json must schedule /api/cron/trigger-sync");
  assert.equal(cron.schedule, "0,30 * * * *");
});

test("documents the dispatch token in the environment example", () => {
  assert.match(envExample, /^GITHUB_DISPATCH_TOKEN=$/m);
  assert.match(envExample, /^CRON_SECRET=$/m);
});

test("dispatches the real sync workflow against main", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const result = await dispatchPropertySync({
    token: "ghp_test",
    fetchImpl: stubFetch({ status: 204 }, calls),
  });

  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].url,
    `https://api.github.com/repos/Keval81/Banc-replacement-website/actions/workflows/${SYNC_WORKFLOW_FILE}/dispatches`,
  );
  assert.equal(calls[0].init.method, "POST");
  assert.equal(JSON.parse(String(calls[0].init.body)).ref, "main");

  const headers = new Headers(calls[0].init.headers);
  assert.equal(headers.get("authorization"), "Bearer ghp_test");
  assert.equal(headers.get("accept"), "application/vnd.github+json");
});

test("reports a refused dispatch instead of claiming success", async () => {
  const result = await dispatchPropertySync({
    token: "ghp_expired",
    fetchImpl: stubFetch(
      { status: 401, body: '{"message":"Bad credentials"}' },
      [],
    ),
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
  assert.match(result.error, /401/);
});

test("never puts the dispatch token in the error it returns", async () => {
  const result = await dispatchPropertySync({
    token: "ghp_supersecret",
    fetchImpl: stubFetch(
      { status: 403, body: '{"message":"token ghp_supersecret is bad"}' },
      [],
    ),
  });

  assert.equal(result.ok, false);
  assert.doesNotMatch(result.error, /ghp_supersecret/);
});

test("fails loudly when no token is configured", async () => {
  const result = await dispatchPropertySync({
    token: "",
    fetchImpl: async () => {
      throw new Error("must not call GitHub without a token");
    },
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /GITHUB_DISPATCH_TOKEN/);
});
