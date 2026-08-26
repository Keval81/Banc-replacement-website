# Banc Local Repository Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the active Banc checkout to a fully local canonical path, preserve its unfinished `aker-restyle` work exactly, and finish that mobile polish pass only after migration verification succeeds.

**Architecture:** Materialize the source into a new empty `~/Projects/banc-replacement-website` checkout with a non-deleting `rsync`, excluding only rebuildable `node_modules/` and `.next/` caches. Gate cutover on byte-level Git and content checks, retain the iCloud checkout as a dated rollback directory, add a compatibility symlink, then rebuild and verify the app from the canonical path before committing the existing UI pass.

**Tech Stack:** macOS File Provider, Git, BSD `find`, `/usr/bin/rsync`, npm, Next.js, TypeScript, Node test runner

**Spec:** `docs/superpowers/specs/2026-08-26-banc-local-repo-migration-design.md`

## Global Constraints

- Source: `/Users/sandboxsansan/Documents/Banc-replacement-website`
- Destination: `/Users/sandboxsansan/Projects/banc-replacement-website`
- Rollback: `/Users/sandboxsansan/Documents/Banc-replacement-website.icloud-backup-20260826`
- Evidence: `/private/tmp/banc-repo-migration-2026-08-26`
- Never modify or overwrite `/Users/sandboxsansan/Projects/banc-website`.
- Never use `rsync --delete` during a writing copy; `--delete` is permitted only with `--dry-run` for verification.
- Never delete the source, rollback directory, or stale clone during this plan.
- Preserve `.git`, dirty tracked files, untracked files, `.env.local`, and `.vercel/project.json`.
- Exclude only `node_modules/` and `.next/` from source-to-destination equivalence; rebuild them from `package-lock.json`.
- Do not add, remove, or upgrade dependencies.
- Do not push, merge, preview-deploy, or production-deploy.
- Stop before cutover if any verification gate fails.

---

### Task 1: Capture immutable source evidence

**Files:**
- Read: `/Users/sandboxsansan/Documents/Banc-replacement-website/**`
- Create: `/private/tmp/banc-repo-migration-2026-08-26/source-*.txt`
- Create: `/private/tmp/banc-repo-migration-2026-08-26/source-status.bin`
- Create: `/private/tmp/banc-repo-migration-2026-08-26/source-stage.bin`

**Interfaces:**
- Consumes: approved migration spec and the current `aker-restyle` checkout
- Produces: immutable baseline files used by Tasks 3 and 4

- [ ] **Step 1: Reconfirm that both target paths are unused**

Run:

```bash
test ! -e '/Users/sandboxsansan/Projects/banc-replacement-website'
test ! -e '/Users/sandboxsansan/Documents/Banc-replacement-website.icloud-backup-20260826'
```

Expected: both commands exit `0` with no output. Stop if either exits non-zero.

- [ ] **Step 2: Create the external evidence directory**

Run:

```bash
mkdir -p '/private/tmp/banc-repo-migration-2026-08-26'
```

Expected: directory exists outside both repository trees.

- [ ] **Step 3: Capture HEAD, branch, worktree, and index state without optional Git writes**

Run:

```bash
env GIT_OPTIONAL_LOCKS=0 git -C '/Users/sandboxsansan/Documents/Banc-replacement-website' rev-parse HEAD > '/private/tmp/banc-repo-migration-2026-08-26/source-head.txt'
env GIT_OPTIONAL_LOCKS=0 git -C '/Users/sandboxsansan/Documents/Banc-replacement-website' branch --show-current > '/private/tmp/banc-repo-migration-2026-08-26/source-branch.txt'
env GIT_OPTIONAL_LOCKS=0 git -C '/Users/sandboxsansan/Documents/Banc-replacement-website' status --porcelain=v1 -z --untracked-files=all > '/private/tmp/banc-repo-migration-2026-08-26/source-status.bin'
env GIT_OPTIONAL_LOCKS=0 git -C '/Users/sandboxsansan/Documents/Banc-replacement-website' ls-files --stage -z > '/private/tmp/banc-repo-migration-2026-08-26/source-stage.bin'
```

Expected: `source-branch.txt` contains exactly `aker-restyle`; all four evidence files are non-empty except that a clean worktree would allow an empty status file. The current worktree is expected to remain dirty with the existing mobile-pass files.

- [ ] **Step 4: Capture the source File Provider and path-count baseline outside rebuildable caches**

Run:

```bash
find '/Users/sandboxsansan/Documents/Banc-replacement-website' -path '*/node_modules' -prune -o -path '*/.next' -prune -o -flags +dataless -print > '/private/tmp/banc-repo-migration-2026-08-26/source-dataless.txt'
find '/Users/sandboxsansan/Documents/Banc-replacement-website' -path '*/node_modules' -prune -o -path '*/.next' -prune -o -print | LC_ALL=C sort > '/private/tmp/banc-repo-migration-2026-08-26/source-paths.txt'
wc -l '/private/tmp/banc-repo-migration-2026-08-26/source-dataless.txt' '/private/tmp/banc-repo-migration-2026-08-26/source-paths.txt'
```

Expected: counts are printed and retained as evidence. A non-zero source dataless count is expected and is the reason for migration.

- [ ] **Step 5: Capture relative checksums for required ignored metadata**

Run:

```bash
/bin/zsh -lc "cd '/Users/sandboxsansan/Documents/Banc-replacement-website' && shasum -a 256 .env.local .vercel/project.json" > '/private/tmp/banc-repo-migration-2026-08-26/source-required-checksums.txt'
```

Expected: two checksum lines, one for `.env.local` and one for `.vercel/project.json`. Do not print file contents.

### Task 2: Materialize the fully local checkout

**Files:**
- Read: `/Users/sandboxsansan/Documents/Banc-replacement-website/**`
- Create: `/Users/sandboxsansan/Projects/banc-replacement-website/**`
- Create: `/private/tmp/banc-repo-migration-2026-08-26/rsync-copy.txt`

**Interfaces:**
- Consumes: validated unused destination from Task 1
- Produces: a destination checkout containing every source path except `node_modules/` and `.next/`

- [ ] **Step 1: Create only the exact destination directory**

Run:

```bash
mkdir '/Users/sandboxsansan/Projects/banc-replacement-website'
```

Expected: the new empty directory exists; the stale `/Users/sandboxsansan/Projects/banc-website` path is unchanged.

- [ ] **Step 2: Copy the repository without deletion**

Run:

```bash
/usr/bin/rsync -a --itemize-changes --exclude='/node_modules/' --exclude='/.next/' '/Users/sandboxsansan/Documents/Banc-replacement-website/' '/Users/sandboxsansan/Projects/banc-replacement-website/' > '/private/tmp/banc-repo-migration-2026-08-26/rsync-copy.txt'
```

Expected: exit `0`. If File Provider hydration interrupts the copy, rerun this exact non-deleting command; do not cut over until it exits `0`.

- [ ] **Step 3: Require zero destination placeholders outside rebuildable caches**

Run:

```bash
find '/Users/sandboxsansan/Projects/banc-replacement-website' -path '*/node_modules' -prune -o -path '*/.next' -prune -o -flags +dataless -print > '/private/tmp/banc-repo-migration-2026-08-26/destination-dataless.txt'
test ! -s '/private/tmp/banc-repo-migration-2026-08-26/destination-dataless.txt'
```

Expected: both commands exit `0`; `destination-dataless.txt` is empty.

- [ ] **Step 4: Rebuild dependencies from the committed npm lockfile**

Run:

```bash
npm ci
```

Working directory: `/Users/sandboxsansan/Projects/banc-replacement-website`

Expected: exit `0`, `node_modules/` is created locally, and `package.json` plus `package-lock.json` remain unchanged.

### Task 3: Pass the pre-cutover equivalence gates

**Files:**
- Read: source and destination checkouts
- Create: `/private/tmp/banc-repo-migration-2026-08-26/destination-*.txt`
- Create: `/private/tmp/banc-repo-migration-2026-08-26/destination-status.bin`
- Create: `/private/tmp/banc-repo-migration-2026-08-26/destination-stage.bin`
- Create: `/private/tmp/banc-repo-migration-2026-08-26/rsync-content-diff.txt`

**Interfaces:**
- Consumes: Task 1 source baselines and Task 2 destination checkout
- Produces: a pass/fail cutover decision; Task 4 may run only on a complete pass

- [ ] **Step 1: Compare destination HEAD and branch to the source baseline**

Run:

```bash
env GIT_OPTIONAL_LOCKS=0 git -C '/Users/sandboxsansan/Projects/banc-replacement-website' rev-parse HEAD > '/private/tmp/banc-repo-migration-2026-08-26/destination-head.txt'
env GIT_OPTIONAL_LOCKS=0 git -C '/Users/sandboxsansan/Projects/banc-replacement-website' branch --show-current > '/private/tmp/banc-repo-migration-2026-08-26/destination-branch.txt'
cmp '/private/tmp/banc-repo-migration-2026-08-26/source-head.txt' '/private/tmp/banc-repo-migration-2026-08-26/destination-head.txt'
cmp '/private/tmp/banc-repo-migration-2026-08-26/source-branch.txt' '/private/tmp/banc-repo-migration-2026-08-26/destination-branch.txt'
```

Expected: both `cmp` commands exit `0` with no output.

- [ ] **Step 2: Compare NUL-delimited worktree and tracked-index state**

Run:

```bash
env GIT_OPTIONAL_LOCKS=0 git -C '/Users/sandboxsansan/Projects/banc-replacement-website' status --porcelain=v1 -z --untracked-files=all > '/private/tmp/banc-repo-migration-2026-08-26/destination-status.bin'
env GIT_OPTIONAL_LOCKS=0 git -C '/Users/sandboxsansan/Projects/banc-replacement-website' ls-files --stage -z > '/private/tmp/banc-repo-migration-2026-08-26/destination-stage.bin'
cmp '/private/tmp/banc-repo-migration-2026-08-26/source-status.bin' '/private/tmp/banc-repo-migration-2026-08-26/destination-status.bin'
cmp '/private/tmp/banc-repo-migration-2026-08-26/source-stage.bin' '/private/tmp/banc-repo-migration-2026-08-26/destination-stage.bin'
```

Expected: both `cmp` commands exit `0` with no output.

- [ ] **Step 3: Require a zero-byte checksum dry-run diff**

Run:

```bash
/usr/bin/rsync -anrc --delete --itemize-changes --exclude='/node_modules/' --exclude='/.next/' '/Users/sandboxsansan/Documents/Banc-replacement-website/' '/Users/sandboxsansan/Projects/banc-replacement-website/' > '/private/tmp/banc-repo-migration-2026-08-26/rsync-content-diff.txt'
test ! -s '/private/tmp/banc-repo-migration-2026-08-26/rsync-content-diff.txt'
```

Expected: dry run exits `0` and the diff file is empty. `--delete` is safe here because `-n` prevents writes and exposes destination-only paths.

- [ ] **Step 4: Compare required ignored metadata checksums**

Run:

```bash
/bin/zsh -lc "cd '/Users/sandboxsansan/Projects/banc-replacement-website' && shasum -a 256 .env.local .vercel/project.json" > '/private/tmp/banc-repo-migration-2026-08-26/destination-required-checksums.txt'
cmp '/private/tmp/banc-repo-migration-2026-08-26/source-required-checksums.txt' '/private/tmp/banc-repo-migration-2026-08-26/destination-required-checksums.txt'
```

Expected: `cmp` exits `0` with no output.

- [ ] **Step 5: Verify Git object integrity and cache-excluded path count**

Run:

```bash
git -C '/Users/sandboxsansan/Projects/banc-replacement-website' fsck --no-reflogs
find '/Users/sandboxsansan/Projects/banc-replacement-website' -path '*/node_modules' -prune -o -path '*/.next' -prune -o -print | LC_ALL=C sort > '/private/tmp/banc-repo-migration-2026-08-26/destination-paths.txt'
sed 's#^/Users/sandboxsansan/Documents/Banc-replacement-website#.#' '/private/tmp/banc-repo-migration-2026-08-26/source-paths.txt' > '/private/tmp/banc-repo-migration-2026-08-26/source-relative-paths.txt'
sed 's#^/Users/sandboxsansan/Projects/banc-replacement-website#.#' '/private/tmp/banc-repo-migration-2026-08-26/destination-paths.txt' > '/private/tmp/banc-repo-migration-2026-08-26/destination-relative-paths.txt'
cmp '/private/tmp/banc-repo-migration-2026-08-26/source-relative-paths.txt' '/private/tmp/banc-repo-migration-2026-08-26/destination-relative-paths.txt'
```

Expected: `git fsck` exits `0` (dangling-object notices are informational), and `cmp` exits `0` with no output.

### Task 4: Cut over reversibly and update canonical pointers

**Files:**
- Move: `/Users/sandboxsansan/Documents/Banc-replacement-website` to `/Users/sandboxsansan/Documents/Banc-replacement-website.icloud-backup-20260826`
- Create symlink: `/Users/sandboxsansan/Documents/Banc-replacement-website`
- Modify: `/Users/sandboxsansan/brain/Kevals OS.code-workspace:16-17`
- Modify: `/Users/sandboxsansan/brain/PROJECTS.md:212-213`

**Interfaces:**
- Consumes: complete Task 3 verification pass
- Produces: canonical local checkout, reversible compatibility path, and accurate workspace registry

- [ ] **Step 1: Reconfirm targets immediately before the reversible move**

Run:

```bash
test -d '/Users/sandboxsansan/Documents/Banc-replacement-website'
test ! -L '/Users/sandboxsansan/Documents/Banc-replacement-website'
test -d '/Users/sandboxsansan/Projects/banc-replacement-website'
test ! -e '/Users/sandboxsansan/Documents/Banc-replacement-website.icloud-backup-20260826'
```

Expected: all commands exit `0`. Stop on any mismatch.

- [ ] **Step 2: Retain the source under the exact rollback name**

Run:

```bash
mv '/Users/sandboxsansan/Documents/Banc-replacement-website' '/Users/sandboxsansan/Documents/Banc-replacement-website.icloud-backup-20260826'
```

Expected: the rollback directory exists and the original path is absent. Nothing is deleted.

- [ ] **Step 3: Create and verify the compatibility symlink**

Run:

```bash
ln -s '/Users/sandboxsansan/Projects/banc-replacement-website' '/Users/sandboxsansan/Documents/Banc-replacement-website'
readlink '/Users/sandboxsansan/Documents/Banc-replacement-website'
```

Expected: `readlink` prints `/Users/sandboxsansan/Projects/banc-replacement-website` exactly.

- [ ] **Step 4: Update the IDE workspace entry**

Use `apply_patch` on `/Users/sandboxsansan/brain/Kevals OS.code-workspace`:

```diff
-    { "name": "⏸ Banc website repo (parked)", "path": "/Users/sandboxsansan/Projects/banc-website" },
+    { "name": "🏠 Banc replacement website (active)", "path": "/Users/sandboxsansan/Projects/banc-replacement-website" },
```

Keep the separate parked Banc assets entry unchanged.

- [ ] **Step 5: Update the project registry without rewriting historical notes**

Use `apply_patch` on `/Users/sandboxsansan/brain/PROJECTS.md`:

```diff
-- **Code (CANONICAL):** `~/Documents/Banc-replacement-website/` @ branch **`claude-build`** (HEAD `401e46d`, 2026-06-13; clean, synced to origin) — the real advanced build: known bugs already fixed, full Banc-token theme sweep, multi-step valuation, hero images across 36 pages, Phase 4 integration scaffolding (Supabase/Expert-Agent/Rightmove/Resend). **Deployed to Vercel as a PREVIEW** (`banc-website-git-claude-build-digital-inroads.vercel.app`, READY) — not promoted to production.
-- **Stale 2nd clone — do NOT work here:** `~/Projects/banc-website/` @ `codex/mobile-audit-...` (older parallel line; a 2026-06-13 audit + placeholder fix there were redundant — claude-build already had those). GitHub repo (both clones): `Keval81/Banc-replacement-website` (private). Docs/brand: `~/Desktop/Banc Property/`.
+- **Code (CANONICAL, migrated 2026-08-26):** `~/Projects/banc-replacement-website/` @ branch **`aker-restyle`**. The fully local checkout preserves the unfinished Aker mobile polish pass; the former iCloud checkout is retained at `~/Documents/Banc-replacement-website.icloud-backup-20260826/`, with a compatibility symlink at the old path.
+- **Stale 2nd clone — do NOT work here:** `~/Projects/banc-website/` @ `codex/mobile-audit-...`. GitHub repo: `Keval81/Banc-replacement-website` (private). Docs/brand: `~/Desktop/Banc Property/`.
```

- [ ] **Step 6: Validate the pointers and rollback location**

Run:

```bash
node -e "JSON.parse(require('node:fs').readFileSync('/Users/sandboxsansan/brain/Kevals OS.code-workspace','utf8')); console.log('workspace JSON valid')"
test -d '/Users/sandboxsansan/Documents/Banc-replacement-website.icloud-backup-20260826/.git'
test "$(git -C '/Users/sandboxsansan/Documents/Banc-replacement-website' rev-parse --show-toplevel)" = '/Users/sandboxsansan/Projects/banc-replacement-website'
env GIT_OPTIONAL_LOCKS=0 git -C '/Users/sandboxsansan/Projects/banc-replacement-website' status --short --branch
```

Expected: JSON is valid, the rollback Git directory exists, the compatibility path resolves to the canonical checkout, and Git shows `aker-restyle` plus the same unfinished mobile-pass files.

#### Conditional rollback procedure

Run this procedure only if a post-cutover infrastructure check shows that the canonical path, compatibility symlink, Git state, or local-file guarantee is invalid. Do not roll back merely because Task 5 exposes a reproducible application defect.

1. Validate both rollback operands:

```bash
test -L '/Users/sandboxsansan/Documents/Banc-replacement-website'
test -d '/Users/sandboxsansan/Documents/Banc-replacement-website.icloud-backup-20260826/.git'
```

2. Remove only the compatibility symlink and restore the retained source directory:

```bash
unlink '/Users/sandboxsansan/Documents/Banc-replacement-website'
mv '/Users/sandboxsansan/Documents/Banc-replacement-website.icloud-backup-20260826' '/Users/sandboxsansan/Documents/Banc-replacement-website'
```

3. Use `apply_patch` to restore the workspace entry:

```diff
-    { "name": "🏠 Banc replacement website (active)", "path": "/Users/sandboxsansan/Projects/banc-replacement-website" },
+    { "name": "🏠 Banc replacement website (active)", "path": "/Users/sandboxsansan/Documents/Banc-replacement-website" },
```

4. Use `apply_patch` to restore the two original `PROJECTS.md` registry lines:

```diff
-- **Code (CANONICAL, migrated 2026-08-26):** `~/Projects/banc-replacement-website/` @ branch **`aker-restyle`**. The fully local checkout preserves the unfinished Aker mobile polish pass; the former iCloud checkout is retained at `~/Documents/Banc-replacement-website.icloud-backup-20260826/`, with a compatibility symlink at the old path.
-- **Stale 2nd clone — do NOT work here:** `~/Projects/banc-website/` @ `codex/mobile-audit-...`. GitHub repo: `Keval81/Banc-replacement-website` (private). Docs/brand: `~/Desktop/Banc Property/`.
+- **Code (CANONICAL, migration rolled back 2026-08-26):** `~/Documents/Banc-replacement-website/` @ branch **`aker-restyle`**. The iCloud checkout is active again; the fully local `~/Projects/banc-replacement-website/` copy is retained for diagnosis.
+- **Stale 2nd clone — do NOT work here:** `~/Projects/banc-website/` @ `codex/mobile-audit-...`. GitHub repo: `Keval81/Banc-replacement-website` (private). Docs/brand: `~/Desktop/Banc Property/`.
```

Retain `/Users/sandboxsansan/Projects/banc-replacement-website` for diagnosis; do not delete it.

### Task 5: Verify the application from the canonical checkout

**Files:**
- Read: `/Users/sandboxsansan/Projects/banc-replacement-website/package.json`
- Read: `/Users/sandboxsansan/Projects/banc-replacement-website/lib/__tests__/landing-ui.test.ts`
- Create: local `.next/` build cache

**Interfaces:**
- Consumes: canonical checkout and local dependencies from Tasks 2-4
- Produces: test, typecheck, lint, and build evidence proving File Provider no longer blocks development

- [ ] **Step 1: Run the focused landing UI contract test**

Run:

```bash
node --test lib/__tests__/landing-ui.test.ts
```

Working directory: `/Users/sandboxsansan/Projects/banc-replacement-website`

Expected: all six tests pass.

- [ ] **Step 2: Run TypeScript directly from the local dependency tree**

Run:

```bash
./node_modules/.bin/tsc --noEmit
```

Working directory: `/Users/sandboxsansan/Projects/banc-replacement-website`

Expected: exit `0` in normal compiler time instead of hanging on a dataless compiler file.

- [ ] **Step 3: Run the existing lint script**

Run:

```bash
npm run lint
```

Working directory: `/Users/sandboxsansan/Projects/banc-replacement-website`

Expected: exit `0` with no lint errors.

- [ ] **Step 4: Build the production application**

Run:

```bash
npm run build
```

Working directory: `/Users/sandboxsansan/Projects/banc-replacement-website`

Expected: Next.js production build exits `0`. If it reports an application defect, diagnose that defect before changing code; do not attribute a reproducible code error to the migration.

### Task 6: Visually verify and commit the existing Aker mobile pass

**Files:**
- Modify only if visual QA exposes an in-scope defect: `app/sections/Hero.tsx`
- Modify only if visual QA exposes an in-scope defect: `components/Header.tsx`
- Modify only if a behavioral contract changes: `lib/__tests__/landing-ui.test.ts`
- Modify only if a behavioral contract changes: `lib/landing-ui.ts`
- Add: `components/ui/social-icon.tsx`
- Add: `public/icons/social/facebook.svg`
- Add: `public/icons/social/instagram.svg`
- Add: `public/videos/hero-first-day-mobile-safe.mp4`

**Interfaces:**
- Consumes: passing application gates from Task 5 and the already-written UI worktree
- Produces: one reviewed, focused commit for the mobile landing polish; no deployment

- [ ] **Step 1: Start the local review server on the fixed review port**

Run:

```bash
npm run dev -- --port 3102
```

Working directory: `/Users/sandboxsansan/Projects/banc-replacement-website`

Expected: Next.js reports a ready server at `http://localhost:3102` and remains running during visual QA.

- [ ] **Step 2: Inspect the landing page at desktop and mobile widths**

Open `http://localhost:3102/` with the in-app browser and verify:

- Desktop retains the landscape hero film and has no horizontal overflow.
- Mobile uses `/videos/hero-first-day-mobile-safe.mp4`, fills the hero without unsafe subject cropping, and has no horizontal overflow.
- Sales is visually primary and Lettings is visually secondary while both remain readable and keyboard-focusable.
- Facebook and Instagram controls use the new brand SVGs and retain accessible labels and links.
- The Google review wordmark uses the transparent surface without a white tile.
- Header, hero copy, CTAs, reviews, and the next content section remain legible at 390×844 and 1440×900.

Expected: all checks pass. If an in-scope defect is found, add or update the relevant behavior test before the minimal fix, then rerun Task 5.

- [ ] **Step 3: Review the exact change set and whitespace**

Run:

```bash
git diff --check
git status --short
git diff -- app/sections/Hero.tsx components/Header.tsx lib/__tests__/landing-ui.test.ts lib/landing-ui.ts components/ui/social-icon.tsx
```

Working directory: `/Users/sandboxsansan/Projects/banc-replacement-website`

Expected: no whitespace errors and no unrelated files. The three new media assets appear in status even though binary content is not printed by the final command.

- [ ] **Step 4: Stage only the approved mobile-pass files**

Run:

```bash
git add app/sections/Hero.tsx components/Header.tsx lib/__tests__/landing-ui.test.ts lib/landing-ui.ts components/ui/social-icon.tsx public/icons/social/facebook.svg public/icons/social/instagram.svg public/videos/hero-first-day-mobile-safe.mp4
git diff --cached --check
git diff --cached --stat
```

Expected: only the eight mobile-pass paths are staged and the cached whitespace check exits `0`.

- [ ] **Step 5: Commit the focused mobile polish**

Run:

```bash
git commit -m "feat: polish Banc mobile landing experience"
```

Expected: commit succeeds. Migration documentation remains in its earlier documentation commits; no deployment or push occurs.

- [ ] **Step 6: Run the final post-commit verification**

Run:

```bash
node --test lib/__tests__/landing-ui.test.ts
./node_modules/.bin/tsc --noEmit
npm run lint
npm run build
env GIT_OPTIONAL_LOCKS=0 git status --short --branch
```

Expected: tests, typecheck, lint, and build pass; Git is on `aker-restyle` with no mobile-pass changes left uncommitted. Any unrelated pre-existing work remains visible and must not be discarded.
