import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import test from "node:test";

const root = join(import.meta.dirname, "..", "..");
const config = readFileSync(join(root, "next.config.ts"), "utf8");

const inventory: string[] = JSON.parse(
  readFileSync(join(root, "docs", "audits", "2026-09-04-old-site-url-inventory.json"), "utf8"),
);

const redirects = [...config.matchAll(/source:\s*"([^"]+)",\s*\n\s*destination:\s*"([^"]+)"/g)]
  .map(([, source, destination]) => ({ source, destination }));

const legacyPaths = [
  ...new Set(inventory.map((url) => new URL(url).pathname.replace(/\/$/, "") || "/")),
].sort();

// Webdadi's own plumbing — a login form, a captcha endpoint, an error handler
// and the platform's favicons. These were never content, so 404 is the correct
// answer and redirecting them would be worse than not.
const PLATFORM_JUNK = /^\/(Webdadi|webdadi|captcha|session)\//;

// Not every route is a page.tsx. app/sitemap.ts, app/robots.ts and
// app/favicon.ico serve /sitemap.xml, /robots.txt and /favicon.ico, and a
// check that only looks for pages reports all three as missing.
const FILE_ROUTES: Record<string, string> = {
  "app/sitemap.ts": "/sitemap.xml",
  "app/robots.ts": "/robots.txt",
  "app/favicon.ico": "/favicon.ico",
};

function routeExists(pathname: string): boolean {
  const served = Object.entries(FILE_ROUTES)
    .filter(([file]) => {
      try {
        readFileSync(join(root, file));
        return true;
      } catch {
        return false;
      }
    })
    .map(([, route]) => route);
  if (served.includes(pathname)) return true;

  const pages = execSync("find app -name page.tsx", { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .map((file) =>
      file.replace(/^app/, "").replace(/\/page\.tsx$/, "").replace(/\/\([^)]*\)/g, "") || "/",
    );
  return pages.some((route) => {
    if (route === pathname) return true;
    if (!route.includes("[")) return false;
    return new RegExp(`^${route.replace(/\[[^\]]+\]/g, "[^/]+")}$`).test(pathname);
  });
}

function isRedirected(pathname: string): boolean {
  return redirects.some(({ source }) => {
    if (source === pathname) return true;
    if (!source.includes(":")) return false;
    const pattern = source
      .replace(/:[A-Za-z]+\*/g, ".*")
      .replace(/:[A-Za-z]+/g, "[^/]+");
    return new RegExp(`^${pattern}$`).test(pathname);
  });
}

test("every URL the old site published still resolves", () => {
  const orphaned = legacyPaths.filter(
    (pathname) =>
      !PLATFORM_JUNK.test(pathname) && !routeExists(pathname) && !isRedirected(pathname),
  );
  assert.deepEqual(
    orphaned,
    [],
    `these legacy URLs would 404 after the cut-over:\n  ${orphaned.join("\n  ")}`,
  );
});

test("no redirect points at another redirect", () => {
  // A chain still lands the visitor in the right place, so nothing looks
  // broken — it just spends the ranking signal these redirects exist to
  // preserve. /instant-valuation pointed at /tools/valuation, which pointed
  // at /valuation, and nobody noticed until every hop was counted.
  const sources = new Set(redirects.map((r) => r.source));
  const chained = redirects
    .map((r) => ({ ...r, target: r.destination.split("?")[0] }))
    .filter((r) => sources.has(r.target) && r.target !== r.source);

  assert.deepEqual(
    chained.map((r) => `${r.source} -> ${r.destination} -> (redirects again)`),
    [],
  );
});

test("the old site's URL inventory is kept, because it cannot be recaptured", () => {
  // Cloudflare 403s both curl and headless Chrome on the live site, so this
  // came out of the Wayback index. Once the old site is switched off there is
  // no way to enumerate what it published.
  assert.ok(legacyPaths.length > 300, "the inventory should hold the full capture");
  assert.ok(
    readdirSync(join(root, "docs", "audits")).some((file) =>
      file.includes("old-site-url-inventory"),
    ),
  );
});
