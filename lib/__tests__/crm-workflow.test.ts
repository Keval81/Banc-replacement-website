import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const workflow = readFileSync(
  join(process.cwd(), ".github/workflows/sync-expert-agent.yml"),
  "utf8",
);

test("runs the real Expert Agent sync hourly and manually", () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /cron: ['"]17 \* \* \* \*['"]/);
  assert.match(
    workflow,
    /node --experimental-strip-types scripts\/sync-expert-agent\.ts/,
  );
});

test("reads every credential from GitHub secrets", () => {
  for (const name of [
    "EXPERT_AGENT_FTP_URL",
    "EXPERT_AGENT_FTP_USER",
    "EXPERT_AGENT_FTP_PASS",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]) {
    assert.match(workflow, new RegExp(`secrets\\.${name}`));
  }
});
