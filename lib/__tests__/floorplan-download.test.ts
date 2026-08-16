import assert from "node:assert/strict";
import { test } from "node:test";

import {
  collectFloorplanBody,
  FloorplanDownloadError,
  getFloorplanDownloadFilename,
  getSafeFloorplanDownloadUrl,
  InMemoryFloorplanRateLimiter,
  isPublicIpAddress,
  selectPublicFloorplanAddress,
  validateFloorplanResponse,
  withFloorplanTimeout,
} from "../floorplan-download.ts";

test("accepts only the exact Expert Agent hosts observed for floorplans", () => {
  assert.equal(
    getSafeFloorplanDownloadUrl("https://med05.expertagent.co.uk/HIPS/floorplan.jpg")?.hostname,
    "med05.expertagent.co.uk"
  );
  assert.equal(
    getSafeFloorplanDownloadUrl("http://www.expertagent.co.uk/HIPS/floorplan.pdf")?.hostname,
    "www.expertagent.co.uk"
  );
  assert.equal(getSafeFloorplanDownloadUrl("https://media.expertagent.co.uk/floorplan.pdf"), null);
  assert.equal(getSafeFloorplanDownloadUrl("https://med01.expertagent.co.uk/floorplan.pdf"), null);
  assert.equal(getSafeFloorplanDownloadUrl("https://expertagent.co.uk/floorplan.pdf"), null);
  assert.equal(getSafeFloorplanDownloadUrl("https://expertagent.co.uk.evil.test/floorplan.pdf"), null);
  assert.equal(getSafeFloorplanDownloadUrl("https://example.com/floorplan.pdf"), null);
  assert.equal(getSafeFloorplanDownloadUrl("ftp://med05.expertagent.co.uk/floorplan.pdf"), null);
  assert.equal(getSafeFloorplanDownloadUrl("https://user:secret@med05.expertagent.co.uk/floorplan.pdf"), null);
});

test("rejects explicitly supplied default ports without rejecting normal HTTP or HTTPS URLs", () => {
  assert.equal(getSafeFloorplanDownloadUrl("https://med05.expertagent.co.uk:443/HIPS/floorplan.pdf"), null);
  assert.equal(getSafeFloorplanDownloadUrl("http://www.expertagent.co.uk:80/HIPS/floorplan.pdf"), null);
  assert.equal(
    getSafeFloorplanDownloadUrl("https://med05.expertagent.co.uk:443\\evil.expertagent.co.uk/x"),
    null
  );
  assert.equal(
    getSafeFloorplanDownloadUrl("https://med05.expertagent.co.uk/HIPS/floorplan.pdf")?.protocol,
    "https:"
  );
  assert.equal(
    getSafeFloorplanDownloadUrl("http://www.expertagent.co.uk/HIPS/floorplan.pdf")?.protocol,
    "http:"
  );
});

test("sanitises floorplan filenames while preserving a supported source extension", () => {
  assert.equal(
    getFloorplanDownloadFilename(
      new URL("https://med05.expertagent.co.uk/HIPS/Floor%20plan%2001.JPEG"),
      "image/jpeg"
    ),
    "Floor-plan-01.jpeg"
  );
});

test("derives a supported extension from the verified content type when the source extension is unsafe", () => {
  assert.equal(
    getFloorplanDownloadFilename(new URL("https://med05.expertagent.co.uk/HIPS/floorplan.exe"), "application/pdf"),
    "floorplan.pdf"
  );
});

test("uses the verified MIME extension when a safe source extension disagrees", () => {
  assert.equal(
    getFloorplanDownloadFilename(
      new URL("https://med05.expertagent.co.uk/HIPS/floorplan.png"),
      "image/jpeg"
    ),
    "floorplan.jpeg"
  );
  assert.equal(
    getFloorplanDownloadFilename(
      new URL("https://med05.expertagent.co.uk/HIPS/floorplan.jpg"),
      "image/jpeg"
    ),
    "floorplan.jpg"
  );
});

test("classifies public and non-public IPv4 and IPv6 addresses", () => {
  for (const address of ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"]) {
    assert.equal(isPublicIpAddress(address), true, address);
  }

  for (const address of [
    "0.0.0.0",
    "10.0.0.1",
    "100.64.0.1",
    "127.0.0.1",
    "169.254.1.1",
    "172.16.0.1",
    "192.168.1.1",
    "192.0.2.1",
    "198.51.100.1",
    "203.0.113.1",
    "224.0.0.1",
    "::",
    "::1",
    "::ffff:127.0.0.1",
    "2001:db8::1",
    "fc00::1",
    "fe80::1",
  ]) {
    assert.equal(isPublicIpAddress(address), false, address);
  }
});

test("rejects mixed-safety DNS answers and prefers public IPv4 when both families exist", () => {
  assert.deepEqual(
    selectPublicFloorplanAddress([
      { address: "8.8.8.8", family: 4 },
      { address: "127.0.0.1", family: 4 },
    ]),
    null
  );
  assert.deepEqual(
    selectPublicFloorplanAddress([
      { address: "2606:4700:4700::1111", family: 6 },
      { address: "8.8.8.8", family: 4 },
    ]),
    { address: "8.8.8.8", family: 4 }
  );
});

test("rate limits each client within a fixed window", () => {
  const limiter = new InMemoryFloorplanRateLimiter(2, 1_000);

  assert.deepEqual(limiter.consume("client-a", 10_000), {
    allowed: true,
    remaining: 1,
    retryAfterSeconds: 0,
  });
  assert.deepEqual(limiter.consume("client-a", 10_100), {
    allowed: true,
    remaining: 0,
    retryAfterSeconds: 0,
  });
  assert.deepEqual(limiter.consume("client-a", 10_200), {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: 1,
  });
  assert.equal(limiter.consume("client-b", 10_200).allowed, true);
  assert.equal(limiter.consume("client-a", 11_001).allowed, true);
});

test("rejects an upstream operation after its timeout", async () => {
  await assert.rejects(
    withFloorplanTimeout(new Promise<never>(() => {}), 5),
    (error) => error instanceof FloorplanDownloadError && error.code === "timeout"
  );
});

test("rejects a floorplan body that exceeds the byte ceiling", async () => {
  async function* chunks(): AsyncGenerator<Buffer> {
    yield Buffer.alloc(5);
    yield Buffer.alloc(4);
  }

  await assert.rejects(
    collectFloorplanBody(chunks(), 8),
    (error) => error instanceof FloorplanDownloadError && error.code === "too_large"
  );
});

test("rejects redirect, unsupported MIME and oversized response headers", () => {
  assert.throws(
    () => validateFloorplanResponse(302, "image/jpeg", null, 1_024),
    (error) => error instanceof FloorplanDownloadError && error.code === "redirect"
  );
  assert.throws(
    () => validateFloorplanResponse(200, "text/html", null, 1_024),
    (error) =>
      error instanceof FloorplanDownloadError && error.code === "invalid_content_type"
  );
  assert.throws(
    () => validateFloorplanResponse(200, "application/pdf", "1025", 1_024),
    (error) => error instanceof FloorplanDownloadError && error.code === "too_large"
  );
});
