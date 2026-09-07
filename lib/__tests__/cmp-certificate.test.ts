import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { CMP_CERTIFICATE_URL } from "../banc-contact.ts";

test("the Client Money Protection certificate the footer links to is a real file", () => {
  assert.match(CMP_CERTIFICATE_URL, /^\/documents\/.*\.pdf$/);
  assert.ok(existsSync(join(import.meta.dirname, "..", "..", "public", CMP_CERTIFICATE_URL)), `missing ${CMP_CERTIFICATE_URL}`);
});
