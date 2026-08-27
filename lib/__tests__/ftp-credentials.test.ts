import assert from "node:assert/strict";
import test from "node:test";

import {
  createFtpCurlInvocation,
  sanitizeSyncError,
} from "../crm/ftp-credentials.ts";

test("keeps FTP credentials out of curl argv while escaping stdin configuration", () => {
  const username = "agent\"name\nnext";
  const password = "pa\\ss\rword";
  const invocation = createFtpCurlInvocation(
    "ftp://feed.example.test/drop/",
    username,
    password,
  );

  assert.deepEqual(invocation.args, ["-s", "--config", "-"]);
  assert.doesNotMatch(invocation.args.join(" "), /agent|pa\\ss/);
  assert.equal(
    invocation.input,
    'url = "ftp://feed.example.test/drop/"\nuser = "agent\\"name\\nnext:pa\\\\ss\\rword"\n',
  );
});

test("redacts FTP credentials from errors persisted or printed by the sync", () => {
  const username = "sync-user";
  const password = "super-secret";
  const message = sanitizeSyncError(
    new Error(`Command failed: curl --user ${username}:${password}`),
    [username, password],
  );

  assert.doesNotMatch(message, /sync-user|super-secret/);
  assert.match(message, /\[redacted\]/);
});
