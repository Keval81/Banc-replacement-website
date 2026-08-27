// Expert Agent FTP feed → Supabase sync.
//
// The feed (spec v1.3) is XML zipped with property images, dropped in an
// agent-specific FTP directory. Runs as a script (launchd / GitHub Action),
// NOT as a Vercel function — serverless has no shell for curl/unzip.
//
// Usage:  node scripts/sync-expert-agent.ts [--dry-run]
// Env (in .env.local):
//   EXPERT_AGENT_FTP_URL    ftp://ftp.example.com/path/   (trailing slash)
//   EXPERT_AGENT_FTP_USER
//   EXPERT_AGENT_FTP_PASS

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expertAgentAdapter } from "../lib/crm/expert-agent-adapter.ts";
import {
  createFtpCurlInvocation,
  sanitizeSyncError,
} from "../lib/crm/ftp-credentials.ts";
import { reconcileCompleteFeed } from "../lib/crm/property-sync.ts";
import { SupabaseSyncRepository } from "../lib/crm/supabase-sync-repository.ts";
import type { CanonicalPropertyWriteRow } from "../lib/crm/property-source.ts";
import { parseExpertAgentFeed } from "../lib/expert-agent-feed.ts";

const FTP_URL = process.env.EXPERT_AGENT_FTP_URL ?? "";
const FTP_USER = process.env.EXPERT_AGENT_FTP_USER ?? "";
const FTP_PASS = process.env.EXPERT_AGENT_FTP_PASS ?? "";
const DRY_RUN = process.argv.includes("--dry-run");

function fail(msg: string): never {
  throw new Error(msg);
}

function safeErrorMessage(error: unknown): string {
  return sanitizeSyncError(error, [FTP_URL, FTP_USER, FTP_PASS]);
}

function runFtpCurl(url: string, args: string[]): string {
  const invocation = createFtpCurlInvocation(url, FTP_USER, FTP_PASS);
  return execFileSync("curl", [...invocation.args, ...args], {
    encoding: "utf8",
    input: invocation.input,
  });
}

function printDryRun(rows: CanonicalPropertyWriteRow[]): void {
  for (const row of rows) {
    console.log(
      `  ${row.expert_agent_id}  ${row.status.padEnd(11)} £${row.price}  ${row.bedrooms}bed  ${row.address}`,
    );
  }
  console.log("dry run — nothing written");
}

async function main(): Promise<void> {
  const startedAt = new Date().toISOString();
  const { supabaseAdmin } = DRY_RUN
    ? { supabaseAdmin: null }
    : await import("../lib/supabase.ts");
  if (!DRY_RUN && !supabaseAdmin) {
    fail("supabaseAdmin not configured (SUPABASE_SERVICE_ROLE_KEY)");
  }
  const repository = supabaseAdmin
    ? new SupabaseSyncRepository(supabaseAdmin)
    : null;
  const work = mkdtempSync(join(tmpdir(), "ea-sync-"));
  let recordsRead = 0;

  try {
    if (!FTP_URL || !FTP_USER || !FTP_PASS) {
      fail(
        "missing credentials — set EXPERT_AGENT_FTP_URL, EXPERT_AGENT_FTP_USER, EXPERT_AGENT_FTP_PASS in .env.local",
      );
    }

    // 1. List the FTP directory, find the newest zip (or xml).
    const listing = runFtpCurl(FTP_URL, ["-l"])
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const candidates = listing.filter((f) => /\.(zip|xml)$/i.test(f));
    if (candidates.length === 0) fail(`no .zip/.xml in FTP listing (${listing.length} entries)`);
    // Names sort by date when timestamped; otherwise take the last listed.
    const file = candidates.sort().at(-1)!;
    console.log(`fetching ${file}`);

    // 2. Download.
    const local = join(work, file);
    runFtpCurl(FTP_URL + file, ["-o", local]);

    // 3. Unzip if needed, locate the XML.
    let xmlPath = local;
    if (/\.zip$/i.test(file)) {
      execFileSync("unzip", ["-o", "-q", local, "-d", work]);
      const xml = readdirSync(work).find((f) => /\.xml$/i.test(f));
      if (!xml) fail("zip contained no .xml");
      xmlPath = join(work, xml);
    }

    // 4. Parse.
    const feed = parseExpertAgentFeed(readFileSync(xmlPath, "utf8"));
    recordsRead = feed.properties.length;
    console.log(`${feed.agencyName || "feed"}: ${feed.properties.length} properties`);

    const rows = feed.properties.map((record) => {
      const row = expertAgentAdapter.map(record, { syncedAt: startedAt });
      // Bare image filenames are relative to the zip — leave a marker so the
      // storage-upload step (added once we see a real feed) can resolve them.
      row.images = row.images.map((img) =>
        /^https?:\/\//i.test(img) ? img : `zip://${img}`
      );
      return row;
    });

    // Geocode at postcode level via postcodes.io (free, no key, UK-only).
    // House-level coords aren't in the feed; postcode centroid is honest for
    // an area map. Failures leave lat/lng null.
    const postcodes = [...new Set(rows.map((r) => r.postcode.trim()).filter(Boolean))];
    const coords = new Map<string, { latitude: number; longitude: number }>();
    for (let i = 0; i < postcodes.length; i += 100) {
      const batch = postcodes.slice(i, i + 100);
      try {
        const res = await fetch("https://api.postcodes.io/postcodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postcodes: batch }),
        });
        const body = await res.json();
        for (const item of body.result ?? []) {
          if (item.result) {
            coords.set(item.query.toUpperCase(), {
              latitude: item.result.latitude,
              longitude: item.result.longitude,
            });
          }
        }
      } catch {
        console.warn(`geocode batch ${i / 100} failed — leaving those coords null`);
      }
    }
    let geocoded = 0;
    for (const r of rows) {
      const c = coords.get(r.postcode.trim().toUpperCase());
      if (c) {
        r.latitude = c.latitude;
        r.longitude = c.longitude;
        geocoded++;
      }
    }
    console.log(`geocoded ${geocoded}/${rows.length} at postcode level`);

    if (DRY_RUN) {
      printDryRun(rows);
      return;
    }

    if (!repository) throw new Error("Sync repository is unavailable");
    const summary = await reconcileCompleteFeed(repository, {
      sourceSystem: "expert_agent",
      rows,
      startedAt,
    });
    console.log(`upserted ${summary.recordsWritten} properties at ${summary.finishedAt}`);
  } catch (error) {
    if (repository) {
      try {
        await repository.recordFailure({
          sourceSystem: "expert_agent",
          startedAt,
          finishedAt: new Date().toISOString(),
          status: "failure",
          recordsRead,
          recordsWritten: 0,
          recordsDeactivated: 0,
          errorSummary: safeErrorMessage(error).slice(0, 500),
        });
      } catch (auditError) {
        console.error(`sync-expert-agent: failed to audit failure: ${safeErrorMessage(auditError)}`);
      }
    }
    throw error;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  console.error(
    `sync-expert-agent: ${safeErrorMessage(error)}`,
  );
  process.exitCode = 1;
}
