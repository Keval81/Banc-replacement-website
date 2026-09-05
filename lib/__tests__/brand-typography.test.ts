import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const ROOT = join(import.meta.dirname, "..", "..");
const globals = readFileSync(join(ROOT, "app", "globals.css"), "utf8");
const layout = readFileSync(join(ROOT, "app", "layout.tsx"), "utf8");

test("loads Playfair Display as the display face the brand guide specifies", () => {
  assert.match(
    layout,
    /Playfair_Display/,
    "layout.tsx does not load Playfair Display",
  );
  assert.match(
    layout,
    /variable:\s*"--font-display"/,
    "Playfair Display is not bound to the --font-display token",
  );
});

test("defines the display token everywhere Tailwind and plain CSS read it", () => {
  const declarations = globals.match(/--font-display:[^;]+;/g) ?? [];
  assert.equal(
    declarations.length,
    2,
    "--font-display must be declared in :root for plain CSS and in @theme inline for the font-display utility",
  );
  for (const declaration of declarations) {
    assert.match(
      declaration,
      /'Playfair Display'/,
      `${declaration} does not name Playfair Display first`,
    );
  }
});

test("puts the display face on h1 and nothing smaller", () => {
  assert.match(
    globals,
    /h1\s*\{[^}]*font-family:\s*var\(--font-display\)/,
    "the h1 base rule does not use the display token",
  );
  // Playfair's thick/thin contrast goes spindly at the 19-20px sizes the
  // testimonial titles and journey selector use, so those keep Source Serif.
  assert.match(
    globals,
    /--font-serif:\s*'Source Serif 4'/,
    "Source Serif 4 must remain the body serif for small-size usages",
  );
});

test("lets the display utility win on headings despite the unlayered base rules", () => {
  assert.match(
    globals,
    /h2\.font-display[^{]*\{[^}]*font-family:\s*var\(--font-display\)/,
    "no unlayered rule exists to let font-display apply to a heading",
  );
});

test("keeps heading weight pinned, so no heading silently lightens", () => {
  // Every serif heading on the site authors `font-light` and renders 500,
  // because this rule outranks the utility. Moving these rules into a layer
  // would drop the whole site's headings from 500 to 300 in one go — so the
  // weight declaration stays exactly where it is.
  assert.match(
    globals,
    /h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{[^}]*font-weight:\s*500/,
    "the heading weight rule has moved or changed; check every heading before accepting this",
  );
});

test("leaves no heading claiming a serif class the cascade ignores", () => {
  // These base rules are unlayered, and unlayered CSS beats Tailwind's
  // utilities layer whatever the specificity — so `font-serif` on a heading is
  // decoration that never applies. Keeping it would mislead the next reader.
  // The scan spans newlines on purpose: JSX routinely puts the tag and its
  // className on separate lines, and a line-based grep walks straight past them.
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && !entry.name.startsWith(".")) walk(full);
      } else if (entry.name.endsWith(".tsx")) {
        const source = readFileSync(full, "utf8");
        for (const match of source.matchAll(/<h[1-6]([\s][^>]*)?>/g)) {
          if (match[0].includes("font-serif")) {
            const line = source.slice(0, match.index).split("\n").length;
            offenders.push(`${full.replace(ROOT + "/", "")}:${line}`);
          }
        }
      }
    }
  };
  for (const dir of ["app", "components"]) walk(join(ROOT, dir));

  assert.deepEqual(
    offenders,
    [],
    `heading elements still carry an inert font-serif class:\n${offenders.join("\n")}`,
  );
});
