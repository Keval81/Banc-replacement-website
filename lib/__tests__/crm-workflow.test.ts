import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const workflow = readFileSync(
  join(process.cwd(), ".github/workflows/sync-expert-agent.yml"),
  "utf8",
);
const envExample = readFileSync(join(process.cwd(), ".env.example"), "utf8");

test("runs the real Expert Agent sync hourly and manually", () => {
  assert.match(workflow, /workflow_dispatch:/);
  // Hourly, not twice a day: GitHub fires scheduled workflows best-effort and
  // on 7 Sep dropped both 11:30Z and 17:30Z slots, so two listings sat in the
  // export until a manual run. Hourly at :17 actually delivers every 2-5 h,
  // which is what keeps the "lunchtime / end of day" promise to Nitesh.
  assert.match(workflow, /cron: ['"]17 \* \* \* \*['"]/);
  assert.doesNotMatch(workflow, /cron: ['"]30 11 \* \* \*['"]/);
  assert.doesNotMatch(workflow, /cron: ['"]30 17 \* \* \*['"]/);
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

test("documents every Expert Agent FTP credential in the environment example", () => {
  for (const name of [
    "EXPERT_AGENT_FTP_URL",
    "EXPERT_AGENT_FTP_USER",
    "EXPERT_AGENT_FTP_PASS",
  ]) {
    assert.match(envExample, new RegExp(`^${name}=$`, "m"));
  }
});
