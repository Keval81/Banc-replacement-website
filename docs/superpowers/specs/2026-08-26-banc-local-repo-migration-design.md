# Banc Local Repository Migration Design

**Date:** 2026-08-26
**Status:** Approved for planning

## Goal

Move the active Banc replacement website checkout out of iCloud-managed `Documents` and into `~/Projects/banc-replacement-website` without losing Git history, the dirty `aker-restyle` worktree, ignored environment files, or deployment metadata. The migrated checkout must be fully local before development resumes.

## Current State

- Active source: `/Users/sandboxsansan/Documents/Banc-replacement-website`
- Active branch: `aker-restyle`
- Destination: `/Users/sandboxsansan/Projects/banc-replacement-website`
- The destination does not currently exist.
- The older `/Users/sandboxsansan/Projects/banc-website` clone is stale and must not be modified or overwritten.
- The source contains tens of thousands of File Provider `dataless` placeholders, including the TypeScript compiler. This causes `tsc` to hang.
- The current dirty worktree is the unfinished Aker mobile polish pass: responsive hero film, Sales/Lettings CTA hierarchy, branded social icons, and the Google review surface.

## Chosen Approach

Use a reversible copy, verification, and cutover workflow:

1. Record immutable preflight evidence for the source HEAD, branch, worktree status, tracked-file index, and File Provider state.
2. Copy the repository to the new destination without deleting or overwriting another checkout.
3. Exclude only `node_modules/` and `.next/`, because both are rebuildable caches and account for most placeholders. Preserve every other path, including `.git`, `.env.local`, `.vercel/project.json`, untracked media, and migration documentation.
4. Rebuild dependencies from the committed lockfile with the existing package manager; do not add or upgrade dependencies.
5. Verify source and destination content by checksum with the same cache exclusions, verify matching Git HEAD and worktree status with optional Git index writes disabled, run `git fsck`, and require zero destination `dataless` paths outside excluded caches.
6. Rename the original iCloud checkout to a dated rollback directory. Do not delete it.
7. Create a compatibility symlink at the original `Documents` path pointing to the new canonical checkout, then update the Banc workspace and project registry pointers to the new `Projects` path.
8. Verify the canonical path, compatibility path, Git state, focused test, TypeScript check, and production build.
9. Resume only the existing Aker mobile polish pass, perform visual QA, and commit it as one focused change. Deployment is out of scope unless separately approved.

## Safety Constraints

- Never use `rsync --delete` during the materializing copy.
- Never write into or replace `/Users/sandboxsansan/Projects/banc-website`.
- Never delete the original checkout or its rollback copy during this task.
- Stop before cutover if HEAD, status, tracked-file state, checksums, Git integrity, secrets, or deployment metadata do not verify.
- Stop if the destination contains File Provider placeholders outside rebuildable caches.
- Do not push, merge, or deploy as part of the migration.
- Do not rewrite or discard the existing dirty worktree.

## Verification Gates

The migration may cut over only when all of these gates pass:

- Source and destination resolve to the same Git HEAD and branch.
- NUL-delimited `git status --porcelain=v1 --untracked-files=all` snapshots match exactly.
- `git ls-files --stage -z` snapshots match exactly.
- A checksum dry run reports no content differences outside `node_modules/` and `.next/`.
- Required ignored files, including `.env.local` when present and `.vercel/project.json`, exist at the destination with matching checksums.
- `git fsck --no-reflogs` succeeds at the destination.
- No destination path outside excluded caches has the `dataless` flag.
- The original checkout has been retained under a dated rollback name.

After cutover, development may resume only when the focused landing UI test, TypeScript check, and production build complete successfully from the new canonical path.

## Rollback

If a pre-cutover gate fails, leave the source in place and remove no data. If a post-cutover gate fails, remove only the compatibility symlink, rename the dated rollback directory back to its original path, and restore workspace pointers. The new destination remains available for diagnosis; neither checkout is deleted.

## Out of Scope

- Cleaning or deleting the stale `~/Projects/banc-website` clone
- Refactoring the Banc application
- Adding or upgrading dependencies
- Pushing, merging, preview deployment, or production deployment
- Starting a broader visual redesign beyond the unfinished Aker mobile polish pass
