import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getFloorplanDownloadFilename,
  getSafeFloorplanDownloadUrl,
} from "../floorplan-download.ts";

test("accepts only direct Expert Agent floorplan media URLs", () => {
  assert.equal(
    getSafeFloorplanDownloadUrl("https://media.expertagent.co.uk/HIPS/floorplan.jpg")?.hostname,
    "media.expertagent.co.uk"
  );
  assert.equal(
    getSafeFloorplanDownloadUrl("http://expertagent.co.uk/HIPS/floorplan.pdf")?.hostname,
    "expertagent.co.uk"
  );
  assert.equal(getSafeFloorplanDownloadUrl("https://expertagent.co.uk.evil.test/floorplan.pdf"), null);
  assert.equal(getSafeFloorplanDownloadUrl("https://example.com/floorplan.pdf"), null);
  assert.equal(getSafeFloorplanDownloadUrl("ftp://expertagent.co.uk/floorplan.pdf"), null);
  assert.equal(getSafeFloorplanDownloadUrl("https://user:secret@expertagent.co.uk/floorplan.pdf"), null);
});

test("rejects explicitly supplied default ports without rejecting normal HTTP or HTTPS URLs", () => {
  assert.equal(getSafeFloorplanDownloadUrl("https://expertagent.co.uk:443/HIPS/floorplan.pdf"), null);
  assert.equal(getSafeFloorplanDownloadUrl("http://expertagent.co.uk:80/HIPS/floorplan.pdf"), null);
  assert.equal(
    getSafeFloorplanDownloadUrl("https://expertagent.co.uk/HIPS/floorplan.pdf")?.protocol,
    "https:"
  );
  assert.equal(
    getSafeFloorplanDownloadUrl("http://expertagent.co.uk/HIPS/floorplan.pdf")?.protocol,
    "http:"
  );
});

test("sanitises floorplan filenames while preserving a supported source extension", () => {
  assert.equal(
    getFloorplanDownloadFilename(
      new URL("https://media.expertagent.co.uk/HIPS/Floor%20plan%2001.JPEG"),
      "image/jpeg"
    ),
    "Floor-plan-01.jpeg"
  );
});

test("derives a supported extension from the verified content type when the source extension is unsafe", () => {
  assert.equal(
    getFloorplanDownloadFilename(new URL("https://expertagent.co.uk/HIPS/floorplan.exe"), "application/pdf"),
    "floorplan.pdf"
  );
});
