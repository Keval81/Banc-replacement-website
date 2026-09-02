import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { toJsonLd } from "../json-ld.ts";
import { parseOpeningHours, toE164, propertyPostalAddress } from "../schema-org.ts";
import { absoluteUrl, SITE_URL, truncateDescription } from "../site.ts";
import { isPrivatePath, PRIVATE_PATHS, STATIC_ROUTES } from "../site-routes.ts";

const APP_DIR = path.join(process.cwd(), "app");

test("SITE_URL is an https origin without a trailing slash", () => {
  assert.match(SITE_URL, /^https?:\/\/[^/]+$/);
});

test("absoluteUrl resolves site-relative paths against the origin", () => {
  assert.equal(absoluteUrl("/"), `${SITE_URL}/`);
  assert.equal(absoluteUrl("/sales/properties"), `${SITE_URL}/sales/properties`);
  assert.equal(absoluteUrl("faq"), `${SITE_URL}/faq`);
  assert.equal(absoluteUrl("https://example.com/x"), "https://example.com/x");
});

test("truncateDescription keeps short text and trims long text on a word boundary", () => {
  assert.equal(truncateDescription("  a   b  "), "a b");
  const long = "word ".repeat(60).trim();
  const result = truncateDescription(long);
  assert.ok(result.length <= 160, `expected <=160, got ${result.length}`);
  assert.ok(result.endsWith("…"));
  assert.ok(!result.endsWith(" …"));
});

test("every static sitemap route maps to a page under app/", () => {
  for (const route of STATIC_ROUTES) {
    const segment = route.path === "/" ? "" : route.path;
    const pageFile = path.join(APP_DIR, segment, "page.tsx");
    assert.ok(fs.existsSync(pageFile), `missing page for ${route.path}`);
  }
});

test("static sitemap routes never include private paths", () => {
  for (const route of STATIC_ROUTES) {
    assert.ok(!isPrivatePath(route.path), `${route.path} is private`);
  }
  assert.ok(PRIVATE_PATHS.includes("/search"));
  assert.ok(isPrivatePath("/portal/vendor"));
  assert.ok(isPrivatePath("/make-offer/abc"));
  assert.ok(!isPrivatePath("/searching"));
});

test("toJsonLd escapes characters that could break out of a script element", () => {
  const out = toJsonLd({ name: "</script><b>&" });
  assert.ok(!out.includes("<"));
  assert.ok(!out.includes(">"));
  assert.ok(!out.includes("&"));
  assert.deepEqual(JSON.parse(out), { name: "</script><b>&" });
});

test("parseOpeningHours reads the approved copy format", () => {
  assert.deepEqual(parseOpeningHours(["Monday to Saturday: 9am to 6pm", "Sunday: Closed"]), [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
  ]);
  assert.deepEqual(parseOpeningHours([]), []);
});

test("toE164 converts UK display numbers", () => {
  assert.equal(toE164("01707 877781"), "+441707877781");
  assert.equal(toE164("0203 368 8972"), "+442033688972");
});

test("propertyPostalAddress splits a feed address", () => {
  assert.deepEqual(propertyPostalAddress("12 Station Road, Cuffley, Hertfordshire", "EN6 4HU"), {
    "@type": "PostalAddress",
    streetAddress: "12 Station Road",
    addressLocality: "Cuffley",
    addressRegion: "Hertfordshire",
    postalCode: "EN6 4HU",
    addressCountry: "GB",
  });
});
