#!/usr/bin/env node
/**
 * codemod-tools-light.mjs
 *
 * One-shot restyle of the /tools section from its inherited dark surface onto
 * the site's light canvas, per DESIGN.md (canvas #F4F3F1, ink banc-dark-deep,
 * muted banc-muted-readable, hairline banc-line, no gradients, no shadows).
 *
 * Deliberately narrow: a fixed file list, a fixed class map, and a guard that
 * leaves `text-white` alone wherever it sits on a filled button, where white
 * is still the correct ink.
 *
 * Usage: node scripts/codemod-tools-light.mjs [--dry-run]
 */
import { readFileSync, writeFileSync } from "node:fs";

const DRY = process.argv.includes("--dry-run");

const FILES = [
  "app/tools/page.tsx",
  "app/tools/stamp-duty/page.tsx",
  "app/tools/yield-calculator/page.tsx",
  "app/tools/mortgage-calculator/page.tsx",
  "app/tools/affordability/page.tsx",
  "components/StampDutyCalculator.tsx",
  "components/YieldCalculator.tsx",
  "components/MortgageCalculator.tsx",
  "components/AffordabilityCalculator.tsx",
];

// White stays white on a filled button; everywhere else it becomes ink.
// Lookahead so `bg-banc-dark-deep` (a card surface) is not mistaken for
// `bg-banc-dark` (a filled button).
const FILLED = /bg-(banc-sky|banc-focus|banc-dark)(?![-\w])/;

// Order matters: longest and most specific first.
const MAP = [
  ["min-h-screen bg-banc-dark-deep", "min-h-screen bg-banc-grey-pale"],
  ["bg-banc-dark-deep", "bg-white"],
  ["placeholder:text-white/30", "placeholder:text-banc-muted-readable"],
  ["hover:bg-white/[0.07]", "hover:bg-banc-grey-pale"],
  ["hover:bg-white/10", "hover:bg-banc-grey-pale"],
  ["hover:border-white/20", "hover:border-banc-focus"],
  ["hover:text-white", "hover:text-banc-dark-deep"],
  ["bg-white/[0.02]", "bg-banc-grey-pale"],
  ["bg-white/30", "bg-banc-grey-pale"],
  ["bg-white/20", "bg-banc-grey-pale"],
  ["bg-white/10", "bg-banc-grey-pale"],
  ["bg-white/5", "bg-banc-grey-pale"],
  ["border-white/20", "border-banc-line"],
  ["border-white/10", "border-banc-line"],
  ["border-white/5", "border-banc-line"],
  ["text-white/70", "text-banc-muted-readable"],
  ["text-white/60", "text-banc-muted-readable"],
  ["text-white/50", "text-banc-muted-readable"],
  ["text-white/40", "text-banc-muted-readable"],
  ["text-white", "text-banc-dark-deep"],
];

const tally = new Map();
let changedFiles = 0;

for (const file of FILES) {
  const before = readFileSync(file, "utf8");
  // Rewrite quoted and template class strings, so JSX text and logic are
  // never touched. Class lists reach the DOM from className="...", from cn()
  // arguments and from ternary branches alike.
  const rewrite = (classes) => {
    if (FILLED.test(classes)) return classes;
    let next = classes;
    for (const [from, to] of MAP) {
      if (!next.includes(from)) continue;
      const hits = next.split(from).length - 1;
      next = next.split(from).join(to);
      tally.set(from, (tally.get(from) ?? 0) + hits);
    }
    return next;
  };
  const looksLikeClasses = (s) => /(^|\s)(bg|text|border|hover:|placeholder:|min-h-screen)/.test(s);
  const after = before
    .replace(/"([^"\n]*)"/g, (whole, body) =>
      looksLikeClasses(body) ? `"${rewrite(body)}"` : whole)
    .replace(/`([^`]*)`/g, (whole, body) =>
      looksLikeClasses(body) ? `\`${rewrite(body)}\`` : whole);
  if (after !== before) {
    changedFiles += 1;
    if (!DRY) writeFileSync(file, after);
  }
}

for (const [from, to] of MAP) {
  const n = tally.get(from);
  if (n) console.log(`  ${String(n).padStart(3)}  ${from}  ->  ${to}`);
}
console.log(`${DRY ? "would change" : "changed"} ${changedFiles}/${FILES.length} files`);
