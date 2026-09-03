#!/usr/bin/env node
/**
 * codemod-contrast-ink.mjs
 *
 * Site-wide fix for ink that fails WCAG AA on the light canvas.
 *
 * Three tokens were used as text colour on white/#F4F3F1 where none reaches
 * 4.5:1 — `banc-sky` (1.96:1), `banc-sky-dark` (3.24:1) and `banc-grey`
 * (3.55:1) — plus a stray hard-coded `#C5A880` (2.04:1). Each has an
 * accessible counterpart already in the token set.
 *
 * The one thing this must not do is repaint text sitting on a DARK surface,
 * where `banc-sky` is the correct accent and the light-canvas inks would
 * themselves fail. Ancestry is resolved through the TypeScript AST rather than
 * by scanning lines: an earlier sibling `<section className="bg-banc-dark">`
 * that has already closed is not an ancestor, and only a parser knows that.
 *
 * Usage: node scripts/codemod-contrast-ink.mjs [--dry-run] [--verbose]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const ts = createRequire(import.meta.url)("typescript");

const DRY = process.argv.includes("--dry-run");
const VERBOSE = process.argv.includes("--verbose");

// ink token -> accessible counterpart on the light canvas
const INK = [
  ["text-banc-sky-dark", "text-banc-focus"],
  ["text-banc-sky", "text-banc-focus"],
  ["text-banc-grey", "text-banc-muted-readable"],
  ["text-banc-gold", "text-banc-gold-dark"],
  ["text-[#C5A880]", "text-banc-gold-dark"],
  ["hover:text-[#D4B88F]", "hover:text-banc-gold"],
];

// The nearest ancestor that paints a ground decides the answer. Climbing past
// it gets modals wrong: a white panel inside a `bg-black/50` backdrop is a
// light surface, and its ink has to be readable against white.
const DARK_GROUND =
  /bg-banc-dark|bg-black|banc-dark-surface|bg-\[#[0-3][\da-fA-F]{5}\]|bg-(?:neutral|gray|slate|zinc|stone)-(?:8|9)00/;
// No alpha modifier allowed: `bg-white/5` is a 5% tint over whatever is
// behind it, not a light ground.
const LIGHT_GROUND =
  /bg-white(?![\w\-/])|bg-banc-grey-pale(?![\w\-/])|bg-banc-sky-light(?![\w\-/])|bg-banc-gold-light(?![\w\-/])|bg-\[#[E-Fe-f][\da-fA-F]{5}\](?!\/)|bg-(?:neutral|gray|slate|zinc|stone)-(?:50|100)(?![\d\/])/;

// White ink on a banc-sky fill is 1.96:1. The fill moves to banc-focus, which
// is what the shipped /tools pages and the shared Button already use. Only a
// solid fill counts: `bg-banc-sky/10` is a decorative tint and stays.
const FILL_SWAPS = [
  ["bg-banc-sky", "bg-banc-focus"],
  ["hover:bg-banc-sky-dark", "hover:bg-banc-focus-hover"],
  ["hover:bg-banc-sky", "hover:bg-banc-focus-hover"],
];
const SOLID_SKY_FILL = /(^|[\s"'`])bg-banc-sky(?![-\w/])/;
const WHITE_INK = /(^|[\s"'`])text-white(?![-\w/])/;

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const classPattern = (cls) =>
  new RegExp(`(^|[\\s"'\`])${escape(cls)}(?![-\\w/])`, "g");

// `git ls-files 'components/**/*.tsx'` silently skips components/Footer.tsx:
// a `**` pathspec needs at least one directory to match. List the trees whole
// and filter, or the codemod quietly misses every top-level file.
const files = execSync("git ls-files -- app components", { encoding: "utf8" })
  .split("\n")
  .filter((file) => file.endsWith(".tsx"));

/** Every class string reachable from a JSX element's className attribute. */
function classTextOf(node) {
  if (!node || !node.attributes) return "";
  let text = "";
  for (const attr of node.attributes.properties) {
    if (!ts.isJsxAttribute(attr) || attr.name.getText() !== "className") continue;
    text += attr.initializer ? attr.initializer.getText() : "";
  }
  return text;
}

/** True when the nearest ancestor that paints a ground paints a dark one. */
function onDarkGround(node) {
  for (let n = node.parent; n; n = n.parent) {
    const opening = ts.isJsxElement(n)
      ? n.openingElement
      : ts.isJsxSelfClosingElement(n)
        ? n
        : null;
    if (!opening) continue;
    const classes = classTextOf(opening);
    // A light panel wins even when it sits on a dark backdrop.
    if (LIGHT_GROUND.test(classes)) return false;
    if (DARK_GROUND.test(classes)) return true;
  }
  return false;
}

const tally = new Map();
const skipped = [];
let changedFiles = 0;

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX
  );

  // Collect edits as absolute offsets first, then apply back-to-front so
  // earlier replacements cannot shift later offsets.
  const edits = [];

  // Template heads/middles/tails carry classes too: a className built as
  // `text-banc-grey ${active ? ... : ...}` hides them from a string-literal
  // only walk, which is how the first run missed a handful.
  const carriesClasses = (node) =>
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isTemplateHead(node) ||
    ts.isTemplateMiddle(node) ||
    ts.isTemplateTail(node);

  const visit = (node) => {
    // A <Button> given a solid sky fill inherits `text-white` from the default
    // variant, so the white ink is in a different string entirely and the
    // same-string rule below never sees it. Unless the call site also sets its
    // own text colour, this is white on banc-sky at 1.96:1.
    const opening = ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)
      ? node
      : null;
    if (opening && opening.tagName.getText() === "Button") {
      const classes = classTextOf(opening);
      if (SOLID_SKY_FILL.test(classes) && !/(?:^|[\s"'`])text-\S/.test(classes)) {
        for (const attr of opening.attributes.properties) {
          if (!ts.isJsxAttribute(attr) || attr.name.getText() !== "className") continue;
          const value = attr.initializer;
          if (!value) continue;
          for (const [from, to] of FILL_SWAPS) {
            if (classPattern(from).test(value.getText())) {
              edits.push({ start: value.getStart(), end: value.getEnd(), from, to });
            }
          }
        }
      }
    }

    if (carriesClasses(node)) {
      const text = node.getText();

      // A solid sky fill carrying white ink, in the same class string.
      if (SOLID_SKY_FILL.test(text) && WHITE_INK.test(text)) {
        for (const [from, to] of FILL_SWAPS) {
          if (classPattern(from).test(text)) {
            edits.push({ start: node.getStart(), end: node.getEnd(), from, to });
          }
        }
      }

      for (const [from, to] of INK) {
        const pattern = classPattern(from);
        if (!pattern.test(text)) continue;
        const line =
          sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        if (onDarkGround(node)) {
          skipped.push(`${file}:${line}  ${from}`);
          continue;
        }
        edits.push({ start: node.getStart(), end: node.getEnd(), from, to });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  if (!edits.length) continue;

  // Several swaps can land on the same className node. Apply them together,
  // once per node: replacing one at a time leaves the next edit holding an
  // offset that the first replacement has already shifted.
  const byRange = new Map();
  for (const edit of edits) {
    const key = `${edit.start}:${edit.end}`;
    if (!byRange.has(key)) {
      byRange.set(key, { start: edit.start, end: edit.end, swaps: [] });
    }
    byRange.get(key).swaps.push([edit.from, edit.to]);
  }

  let out = source;
  for (const range of [...byRange.values()].sort((a, b) => b.start - a.start)) {
    const slice = out.slice(range.start, range.end);
    let replaced = slice;
    for (const [from, to] of range.swaps) {
      const hits = replaced.match(classPattern(from))?.length ?? 0;
      if (!hits) continue;
      replaced = replaced.replace(classPattern(from), (_, lead) => `${lead}${to}`);
      tally.set(from, (tally.get(from) ?? 0) + hits);
    }
    if (replaced === slice) continue;
    out = out.slice(0, range.start) + replaced + out.slice(range.end);
  }

  if (out !== source) {
    changedFiles++;
    if (!DRY) writeFileSync(file, out);
  }
}

console.log(DRY ? "DRY RUN — nothing written\n" : "applied\n");
for (const [from, n] of [...tally].sort((a, b) => b[1] - a[1])) {
  const to = [...INK, ...FILL_SWAPS].find(([f]) => f === from)[1];
  console.log(`  ${String(n).padStart(4)}  ${from} -> ${to}`);
}
console.log(`\n  ${changedFiles} files changed`);
console.log(`  ${skipped.length} occurrences left alone on dark ground`);
if (VERBOSE) for (const s of skipped) console.log(`    ${s}`);
