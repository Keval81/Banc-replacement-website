import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { BANC_OFFICES } from "../banc-content/contact.ts";

const root = join(import.meta.dirname, "..", "..");

// Nitesh confirmed 9am–5:30pm on the 7 Sep call. The emails were updated;
// the office pages and FAQ still said 6pm, so the site contradicted itself.
const PUBLIC_MENTIONS = [
  "app/offices/cuffley/page.tsx",
  "app/offices/mayfair/page.tsx",
  "lib/faq-content.ts",
  "app/why-us/page.tsx",
  "lib/email.ts",
];

test("the approved opening hours name a 5:30pm close", () => {
  assert.match(BANC_OFFICES.cuffley.openingHours[0], /5:30pm/);
});

test("every public mention of office hours closes at the approved time", () => {
  const wrong = PUBLIC_MENTIONS.filter((file) =>
    /\b6:00 ?PM\b|\b9am ?(to|-|–) ?6pm\b|\b6pm\b/i.test(readFileSync(join(root, file), "utf8")),
  );
  assert.deepEqual(wrong, [], `still say 6pm: ${wrong.join(", ")}`);
  const missing = PUBLIC_MENTIONS.filter(
    (file) => !/5:30 ?PM|5:30pm/i.test(readFileSync(join(root, file), "utf8")),
  );
  assert.deepEqual(missing, [], `never mention 5:30: ${missing.join(", ")}`);
});
