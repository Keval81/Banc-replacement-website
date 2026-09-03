import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import test from "node:test";

const root = join(import.meta.dirname, "..", "..");

// The outline variant fills itself with `bg-white`, because on the light canvas
// an outline button IS a white pill. Over a dark band or the cyan CTA strip the
// call sites keep the border and the ink white and never override that fill —
// so twMerge leaves `bg-white` standing and the button renders as white ink on
// a white pill: a CTA that is completely invisible, not merely low contrast.
// `bg-transparent` is what lets the band show through.
test("no outline button paints white ink on the variant's own white fill", () => {
  // Whole trees, then filter: a `**` pathspec skips top-level files.
  const files = execSync("git ls-files -- app components", {
    cwd: root,
    encoding: "utf8",
  })
    .split("\n")
    .filter((file) => file.endsWith(".tsx"));

  const offenders: string[] = [];

  for (const file of files) {
    const source = readFileSync(join(root, file), "utf8");
    // Each <Button ...> opening tag, so one button's classes cannot be read
    // together with the next one's.
    for (const [tag] of source.matchAll(/<Button\b[^>]*>/g)) {
      if (!/variant="outline"/.test(tag)) continue;
      if (!/(?:^|["'\s])text-white(?![-\w/])/.test(tag)) continue;
      if (/bg-transparent/.test(tag)) continue;
      const line = source.slice(0, source.indexOf(tag)).split("\n").length;
      offenders.push(`${file}:${line}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `outline buttons with white ink and no transparent fill render invisible:\n  ${offenders.join("\n  ")}`,
  );
});
