import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import vm from "node:vm";

type WorkerEvent = { waitUntil(promise: Promise<unknown>): void };
type WorkerHandler = (event: WorkerEvent) => void;

test("retires Banc page caches without touching unrelated caches or notification support", async () => {
  const source = readFileSync(
    join(import.meta.dirname, "..", "..", "public", "sw.js"),
    "utf8",
  );
  const handlers = new Map<string, WorkerHandler>();
  const deletedCaches: string[] = [];
  const navigations: string[] = [];
  let skipWaitingCalls = 0;
  let claimCalls = 0;

  const clients = [
    {
      url: "https://preview.example/",
      navigate: async (url: string) => {
        navigations.push(url);
      },
    },
    {
      url: "https://preview.example/sales/properties",
      navigate: async (url: string) => {
        navigations.push(url);
      },
    },
  ];

  vm.runInNewContext(source, {
    caches: {
      keys: async () => ["banc-pwa-v1", "image-cache-v2", "banc-pwa-v3"],
      delete: async (name: string) => {
        deletedCaches.push(name);
        return true;
      },
    },
    self: {
      addEventListener: (name: string, handler: WorkerHandler) => {
        handlers.set(name, handler);
      },
      skipWaiting: async () => {
        skipWaitingCalls += 1;
      },
      clients: {
        claim: async () => {
          claimCalls += 1;
        },
        matchAll: async () => clients,
      },
    },
  });

  const runLifecycleEvent = async (name: "install" | "activate") => {
    const pending: Promise<unknown>[] = [];
    const handler = handlers.get(name);
    assert.ok(handler, `expected ${name} handler`);
    handler({ waitUntil: (promise) => pending.push(promise) });
    await Promise.all(pending);
  };

  await runLifecycleEvent("install");
  await runLifecycleEvent("activate");

  assert.equal(skipWaitingCalls, 1);
  assert.deepEqual(deletedCaches, ["banc-pwa-v1", "banc-pwa-v3"]);
  assert.equal(claimCalls, 1);
  assert.deepEqual(navigations, clients.map((client) => client.url));
  assert.equal(handlers.has("fetch"), false);
  assert.equal(handlers.has("push"), true);
  assert.equal(handlers.has("notificationclick"), true);
});
