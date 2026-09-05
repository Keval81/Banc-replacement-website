import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
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

test("leaves no h1 claiming a serif class the cascade ignores", () => {
  // These base rules are unlayered, and unlayered CSS beats Tailwind's
  // utilities layer whatever the specificity — so `font-serif` on a heading is
  // decoration that never applies. Keeping it would mislead the next reader.
  // git grep exits 1 when it matches nothing, which is the passing case here.
  let hits = "";
  try {
    hits = execFileSync(
      "git",
      ["grep", "-nE", "<h1[^>]*font-serif", "--", "app", "components"],
      { cwd: ROOT, encoding: "utf8" },
    ).trim();
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status !== 1) throw error;
  }

  assert.equal(hits, "", `h1 elements still carry an inert font-serif class:\n${hits}`);
});
