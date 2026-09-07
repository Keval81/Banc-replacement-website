import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { getTeamPortrait, type TeamMemberName } from "../team-media.ts";

/**
 * The claymation pass reached /the-team and stopped there. Both office pages
 * carried on rendering hotlinked Unsplash stock photos — four strangers with
 * Nitesh's, Andrew's, Vicki's and Kay's names printed underneath, on public
 * pages a client could land on.
 *
 * These scan the source rather than the render because the member lists are
 * inline consts, which is also how the defect survived: nothing imported them,
 * so nothing could check them.
 */

const root = join(import.meta.dirname, "..", "..");
const OFFICE_PAGES = [
  "app/offices/cuffley/page.tsx",
  "app/offices/mayfair/page.tsx",
] as const;

const source = (path: string) => readFileSync(join(root, path), "utf8");

/** Team entries carry `image:`; the page hero uses `src=`, and is left alone. */
const PORTRAIT_FIELD = /image:\s*"([^"]+)"/g;

test("no office page shows a stock photograph as a named colleague", () => {
  for (const page of OFFICE_PAGES) {
    for (const [, url] of source(page).matchAll(PORTRAIT_FIELD)) {
      assert.doesNotMatch(
        url,
        /^https?:\/\//,
        `${page}: a team portrait points at an external host — ${url}`,
      );
    }
  }
});

test("every name an office page publishes has a real portrait behind it", () => {
  for (const page of OFFICE_PAGES) {
    const text = source(page);
    const names = [...text.matchAll(/name:\s*"([A-Z][a-z]+ [A-Z][a-z]+)"/g)].map((m) => m[1]);
    assert.ok(names.length > 0, `${page}: found no team members at all`);
    for (const name of names) {
      const portrait = getTeamPortrait(name as TeamMemberName);
      assert.ok(portrait?.src, `${page}: no portrait exists for ${name}`);
      assert.ok(
        text.includes(portrait.src),
        `${page}: ${name} is published without their own portrait`,
      );
    }
  }
});
