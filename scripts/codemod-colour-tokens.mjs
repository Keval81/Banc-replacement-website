#!/usr/bin/env node
/**
 * codemod-colour-tokens.mjs
 *
 * Replaces Tailwind arbitrary colour utilities such as `bg-[#4AC8E8]` with the
 * equivalent design-token utility (`bg-banc-sky`) across app/ and components/.
 *
 * Scope is deliberately narrow so that the resulting diff is a set of
 * single-token substitutions:
 *   - only *.tsx files under app/ and components/
 *   - only inside string literals / template-literal text segments (found via
 *     the TypeScript parser), so inline `style={{ }}` objects, SVG attributes,
 *     comments, JSX text and CSS gradient strings that do not use the
 *     `<utility>-[#hex]` shape are never touched
 *   - only exact hex matches from the TOKEN map below (case-insensitive; the
 *     3-digit form `#fff` is expanded before matching)
 *   - variant prefixes (`hover:`, `sm:`, `data-[state=open]:` ...) and opacity
 *     suffixes (`/20`) are left in place
 *
 * Usage:
 *   node scripts/codemod-colour-tokens.mjs            # rewrite files + report
 *   node scripts/codemod-colour-tokens.mjs --dry-run  # report only
 */

import { createRequire } from "node:module";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const DIRS = ["app", "components"];
const EXCLUDE = [/[\\/]lib[\\/]banc-conversation[\\/]/];
const DRY_RUN = process.argv.includes("--dry-run");

// hex (lower-case, 6 digits) -> token suffix after `banc-`
const TOKEN = {
  "4ac8e8": "sky",
  e8f8fc: "sky-light",
  "9adff2": "sky-mid",
  "1a9bbf": "sky-dark",
  "2c2a27": "dark",
  "1a1917": "dark-deep",
  "3d3b37": "dark-mid",
  "8a8880": "grey",
  "5f5d57": "muted-readable",
  f4f3f1: "grey-pale",
  "0b6f89": "focus",
  "0b657a": "focus",
  "075e75": "focus-hover",
  d4af37: "gold",
  fbf5dc: "gold-light",
  "7a5c00": "gold-dark",
  e0dfdc: "line",
  "1a4d5c": "teal",
  f6f2ea: "cream",
  ffffff: "white",
};

const UTILITIES =
  "ring-offset|bg|text|border|ring|from|to|via|fill|stroke|outline|decoration|placeholder|divide|shadow|accent|caret";

// `<utility>-[#hex]` optionally followed by `/<opacity>`. The look-behind keeps
// us from matching inside a longer utility name (e.g. `border-t-[#...]`, which
// is intentionally left alone because `t` is not a colour utility).
const UTILITY_RE = new RegExp(
  `(?<![A-Za-z0-9_-])(${UTILITIES})-\\[#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\](/[0-9]{1,3})?(?![A-Za-z0-9_-])`,
  "g"
);

function normaliseHex(hex) {
  const h = hex.toLowerCase();
  return h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
}

function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith(".tsx") && !EXCLUDE.some((re) => re.test(full))) out.push(full);
  }
  return out;
}

/** Return [start, end) ranges (in source offsets) of string-like token text. */
function stringRanges(source, fileName) {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const ranges = [];
  const visit = (node) => {
    switch (node.kind) {
      case ts.SyntaxKind.StringLiteral:
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      case ts.SyntaxKind.TemplateHead:
      case ts.SyntaxKind.TemplateMiddle:
      case ts.SyntaxKind.TemplateTail:
        ranges.push([node.getStart(sf), node.getEnd()]);
        return;
      default:
        ts.forEachChild(node, visit);
    }
  };
  visit(sf);
  return ranges;
}

const counts = new Map(); // "bg-[#4AC8E8]/20 -> bg-banc-sky/20" : n
const remaining = new Map(); // literal utility left untouched : n
const changedFiles = [];
let totalReplacements = 0;

function rewriteSegment(text) {
  return text.replace(UTILITY_RE, (match, utility, hex, opacity = "") => {
    const token = TOKEN[normaliseHex(hex)];
    if (!token) {
      remaining.set(match, (remaining.get(match) ?? 0) + 1);
      return match;
    }
    const replacement = `${utility}-banc-${token}${opacity}`;
    const key = `${match} -> ${replacement}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    totalReplacements += 1;
    return replacement;
  });
}

for (const dir of DIRS) {
  const files = walk(join(ROOT, dir), []);
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    let out = "";
    let cursor = 0;
    for (const [start, end] of stringRanges(source, file)) {
      out += source.slice(cursor, start);
      out += rewriteSegment(source.slice(start, end));
      cursor = end;
    }
    out += source.slice(cursor);
    if (out !== source) {
      changedFiles.push(relative(ROOT, file));
      if (!DRY_RUN) writeFileSync(file, out);
    }
  }
}

const sortedCounts = [...counts.entries()].sort((a, b) => b[1] - a[1]);
const sortedRemaining = [...remaining.entries()].sort((a, b) => b[1] - a[1]);

console.log(`${DRY_RUN ? "[dry-run] " : ""}Replacements: ${totalReplacements} in ${changedFiles.length} files\n`);
console.log("Per-replacement counts:");
for (const [k, n] of sortedCounts) console.log(`  ${String(n).padStart(5)}  ${k}`);

const remainingTotal = sortedRemaining.reduce((s, [, n]) => s + n, 0);
console.log(`\nRemaining arbitrary colour utilities (not in token map): ${remainingTotal}`);
console.log("Top 10:");
for (const [k, n] of sortedRemaining.slice(0, 10)) console.log(`  ${String(n).padStart(5)}  ${k}`);
