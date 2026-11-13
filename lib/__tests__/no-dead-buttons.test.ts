import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(import.meta.dirname, "..", "..");
const read = (file: string) => readFileSync(join(root, file), "utf8");

/** A <Button> that is neither a link (asChild), nor wired (onClick), nor a submit does nothing when pressed. */
function deadButtons(source: string): string[] {
  const dead: string[] = [];
  for (const match of source.matchAll(/<Button\b([^>]*)>([\s\S]*?)<\/Button>/g)) {
    if (/asChild|onClick|type="submit"|disabled/.test(match[1])) continue;
    dead.push(match[2].replace(/<[^>]+>|\{[^}]*\}/g, " ").replace(/\s+/g, " ").trim());
  }
  return dead;
}

const pages = [
  "app/premier-homes/page.tsx",
  "app/lettings/landlords-guide/page.tsx",
  "app/lettings/tenants-guide/TenantsGuideClient.tsx",
  "app/sales/buyers-guide/page.tsx",
  "app/sales/sellers-guide/page.tsx",
  "app/blog/[slug]/page.tsx",
];

for (const page of pages) {
  test(`every button on ${page} goes somewhere`, () => {
    assert.deepEqual(deadButtons(read(page)), []);
  });
}

test("valuation calls to action open the valuation page", () => {
  for (const [page, label] of [
    ["app/premier-homes/page.tsx", "Premier Valuation"],
    ["app/premier-homes/page.tsx", "Book Premier Valuation"],
    ["app/lettings/landlords-guide/page.tsx", "Book Free Valuation"],
    ["app/sales/sellers-guide/page.tsx", "Book Free Valuation"],
    ["app/sales/sellers-guide/page.tsx", "Book Your Free Valuation"],
  ] as const) {
    assert.match(read(page), new RegExp(`<Link href="/valuation">\\s*${label}\\b`), `${label} on ${page}`);
  }
});

test("Premier Homes links to listings from £1 million", () => {
  assert.match(read("app/premier-homes/page.tsx"), /<Link href="\/sales\/properties\?minPrice=1000000">\s*View Premier Properties/);
});

test("register prompts lead to the alerts sign-up", () => {
  assert.match(read("app/lettings/tenants-guide/TenantsGuideClient.tsx"), /<Link href="\/#alerts">\s*Register Your Requirements/);
  assert.match(read("app/sales/buyers-guide/page.tsx"), /<Link href="\/#alerts">\s*Register with Us/);
  assert.match(read("app/lettings/properties/LettingsPropertiesPageClient.tsx"), /<Link href="\/#alerts">\s*Register as a Tenant/);
});

test("blog share buttons open each network's share page for the article", () => {
  const blog = read("app/blog/[slug]/page.tsx");
  assert.match(blog, /facebook\.com\/sharer\/sharer\.php\?u=\$\{shareUrl\}/);
  assert.match(blog, /twitter\.com\/intent\/tweet\?url=\$\{shareUrl\}/);
  assert.match(blog, /linkedin\.com\/sharing\/share-offsite\/\?url=\$\{shareUrl\}/);
});

test("sold prices offers no map toggle while there is no map view", () => {
  assert.doesNotMatch(read("app/sold-prices/SoldPricesPageClient.tsx"), /setViewMode|viewMode/);
});

test("the unsubscribe help link uses Banc's real address", () => {
  const source = read("app/newsletter/unsubscribe/NewsletterUnsubscribePageClient.tsx");
  assert.doesNotMatch(source, /banc\.co\.uk/);
  assert.match(source, /mailto:info@bancproperty\.com/);
});
