import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(import.meta.dirname, "..", "..");
const footer = readFileSync(join(root, "components", "Footer.tsx"), "utf8");

test("the footer credits Digital Inroads with a link that opens in a new tab", () => {
  const link = footer.match(/<a[^>]*href="https:\/\/digitalinroads\.com"[^>]*>/);
  assert.ok(link, "footer links to https://digitalinroads.com");
  assert.match(link[0], /target="_blank"/);
  assert.match(link[0], /rel="noopener noreferrer"/);
  assert.match(link[0], /aria-label="Made in partnership with Digital Inroads"/);
  assert.match(footer, /Made in partnership with/);
});

test("the Digital Inroads logo the credit uses is served from public", () => {
  assert.match(footer, /src="\/digital-inroads-logo\.svg"/);
  assert.ok(existsSync(join(root, "public", "digital-inroads-logo.svg")), "public/digital-inroads-logo.svg exists");
});
