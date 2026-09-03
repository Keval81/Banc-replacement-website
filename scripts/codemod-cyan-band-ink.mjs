#!/usr/bin/env node
/**
 * codemod-cyan-band-ink.mjs
 *
 * Six pages close with a full-bleed CTA band filled in banc-sky and set in
 * white: heading, supporting line, phone number. White on #4AC8E8 is 1.96:1,
 * so the loudest call to action on each of those pages is also the least
 * readable thing on it.
 *
 * The band keeps its colour — it is what the client has reviewed, and the
 * white pill buttons sitting on it already read well — but the ink goes dark.
 * banc-dark-deep on banc-sky is 8.9:1.
 *
 * Scope is the JSX subtree of an element whose own className carries a solid
 * `bg-banc-sky`, so ink elsewhere on the page is untouched.
 *
 * Usage: node scripts/codemod-cyan-band-ink.mjs [--dry-run]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const ts = createRequire(import.meta.url)("typescript");
const DRY = process.argv.includes("--dry-run");

const SOLID_SKY_FILL = /(^|[\s"'`])bg-banc-sky(?![-\w/])/;

// White ink and its transparencies -> the dark equivalents.
const SWAPS = [
  [/(^|[\s"'`])text-white\/90(?![\w/])/g, "text-banc-dark-deep/90"],
  [/(^|[\s"'`])text-white\/80(?![\w/])/g, "text-banc-dark-deep/80"],
  [/(^|[\s"'`])text-white\/70(?![\w/])/g, "text-banc-dark-deep/70"],
  [/(^|[\s"'`])text-white\/60(?![\w/])/g, "text-banc-dark-deep/70"],
  [/(^|[\s"'`])text-white(?![-\w/])/g, "text-banc-dark-deep"],
];

const files = execSync("git ls-files -- app components", { encoding: "utf8" })
  .split("\n")
  .filter((file) => file.endsWith(".tsx"));

let swaps = 0;
let changedFiles = 0;
const bands = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  if (!SOLID_SKY_FILL.test(source)) continue;

  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const classTextOf = (opening) => {
    let text = "";
    for (const attr of opening.attributes.properties) {
      if (!ts.isJsxAttribute(attr) || attr.name.getText() !== "className") continue;
      text += attr.initializer ? attr.initializer.getText() : "";
    }
    return text;
  };

  // Outermost cyan-filled elements only, so a nested one is not rewritten twice.
  const regions = [];
  const findBands = (node) => {
    if (ts.isJsxElement(node) && SOLID_SKY_FILL.test(classTextOf(node.openingElement))) {
      if (!regions.some((r) => node.getStart() >= r.start && node.getEnd() <= r.end)) {
        regions.push({ start: node.getStart(), end: node.getEnd() });
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        bands.push(`${file}:${line}`);
      }
      return;
    }
    ts.forEachChild(node, findBands);
  };
  findBands(sourceFile);
  if (!regions.length) continue;

  let out = source;
  for (const region of regions.sort((a, b) => b.start - a.start)) {
    let slice = out.slice(region.start, region.end);
    const before = slice;
    for (const [pattern, replacement] of SWAPS) {
      slice = slice.replace(pattern, (_, lead) => {
        swaps++;
        return `${lead}${replacement}`;
      });
    }
    if (slice !== before) out = out.slice(0, region.start) + slice + out.slice(region.end);
  }

  if (out !== source) {
    changedFiles++;
    if (!DRY) writeFileSync(file, out);
  }
}

console.log(DRY ? "DRY RUN — nothing written" : "applied");
console.log(`  ${swaps} white inks darkened inside ${bands.length} cyan bands`);
console.log(`  ${changedFiles} files changed`);
for (const band of bands) console.log(`    ${band}`);
