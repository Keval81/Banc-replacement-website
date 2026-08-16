import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP, type LookupFunction } from "node:net";

const ALLOWED_FLOORPLAN_HOSTS = new Set([
  "med05.expertagent.co.uk",
  "www.expertagent.co.uk",
]);

const MEDIA_TYPE_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/gif": "gif",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

const EQUIVALENT_MEDIA_EXTENSIONS: Record<string, ReadonlySet<string>> = {
  "application/pdf": new Set(["pdf"]),
  "image/gif": new Set(["gif"]),
  "image/jpeg": new Set(["jpg", "jpeg"]),
  "image/png": new Set(["png"]),
  "image/webp": new Set(["webp"]),
};

const NON_PUBLIC_IPV4_RANGES: ReadonlyArray<readonly [string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.31.196.0", 24],
  ["192.52.193.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["192.175.48.0", 24],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

const NON_PUBLIC_IPV6_RANGES: ReadonlyArray<readonly [string, number]> = [
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["3fff::", 20],
];

export const FLOORPLAN_DOWNLOAD_TIMEOUT_MS = 10_000;
export const FLOORPLAN_DOWNLOAD_MAX_BYTES = 12 * 1024 * 1024;

export interface ResolvedFloorplanAddress {
  address: string;
  family: 4 | 6;
}

export type FloorplanDownloadErrorCode =
  | "invalid_content_type"
  | "network"
  | "redirect"
  | "timeout"
  | "too_large"
  | "unsafe_address"
  | "upstream";

export class FloorplanDownloadError extends Error {
  public readonly code: FloorplanDownloadErrorCode;

  constructor(
    code: FloorplanDownloadErrorCode,
    message: string
  ) {
    super(message);
    this.code = code;
    this.name = "FloorplanDownloadError";
  }
}

export interface FloorplanDownloadPayload {
  body: Buffer;
  contentType: string;
}

export interface FloorplanDownloadLimits {
  timeoutMs: number;
  maxBytes: number;
}

export interface FloorplanRateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class InMemoryFloorplanRateLimiter {
  private readonly entries = new Map<string, RateLimitEntry>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  consume(key: string, now = Date.now()): FloorplanRateLimitDecision {
    for (const [entryKey, entry] of this.entries) {
      if (entry.resetAt <= now) this.entries.delete(entryKey);
    }

    const current = this.entries.get(key);
    if (!current) {
      this.entries.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: Math.max(0, this.limit - 1), retryAfterSeconds: 0 };
    }

    if (current.count >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
      };
    }

    current.count += 1;
    return {
      allowed: true,
      remaining: Math.max(0, this.limit - current.count),
      retryAfterSeconds: 0,
    };
  }
}

export function getSafeFloorplanDownloadUrl(value: string): URL | null {
  try {
    const trimmedValue = value.trim();
    if (hasExplicitNumericPort(trimmedValue)) return null;

    const url = new URL(trimmedValue);
    const hostname = url.hostname.toLowerCase();
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !ALLOWED_FLOORPLAN_HOSTS.has(hostname) ||
      url.username ||
      url.password ||
      url.port
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function hasExplicitNumericPort(value: string): boolean {
  const authority = value.match(/^[a-z][a-z\d+.-]*:\/\/([^/?#\\]*)/i)?.[1];
  if (!authority) return false;

  const host = authority.slice(authority.lastIndexOf("@") + 1);
  return /:\d+$/.test(host);
}

export function isAllowedFloorplanContentType(value: string | null): value is string {
  if (!value) return false;
  return Object.hasOwn(MEDIA_TYPE_EXTENSIONS, value.split(";", 1)[0].trim().toLowerCase());
}

export function getFloorplanDownloadFilename(url: URL, contentType: string): string {
  const contentTypeKey = contentType.split(";", 1)[0].trim().toLowerCase();
  const mimeExtension = MEDIA_TYPE_EXTENSIONS[contentTypeKey] ?? "pdf";
  const decodedFilename = decodeURIComponent(url.pathname.split("/").pop() ?? "");
  const sourceExtension = decodedFilename.split(".").pop()?.toLowerCase();
  const extension =
    sourceExtension && EQUIVALENT_MEDIA_EXTENSIONS[contentTypeKey]?.has(sourceExtension)
      ? sourceExtension
      : mimeExtension;
  const sourceBasename = sourceExtension ? decodedFilename.slice(0, -(sourceExtension.length + 1)) : decodedFilename;
  const basename = sourceBasename
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${basename || "floorplan"}.${extension}`;
}

export function isPublicIpAddress(address: string): boolean {
  const family = isIP(address);

  if (family === 4) {
    const numericAddress = parseIpv4(address);
    if (numericAddress === null) return false;

    return !NON_PUBLIC_IPV4_RANGES.some(([base, prefix]) =>
      matchesIpv4Cidr(numericAddress, parseIpv4(base) ?? 0, prefix)
    );
  }

  if (family === 6) {
    const addressSegments = parseIpv6(address);
    if (addressSegments === null) return false;

    const isGlobalUnicast = (addressSegments[0] & 0xe000) === 0x2000;
    if (!isGlobalUnicast) return false;

    return !NON_PUBLIC_IPV6_RANGES.some(([base, prefix]) => {
      const baseSegments = parseIpv6(base);
      return (
        baseSegments !== null &&
        matchesIpv6Cidr(addressSegments, baseSegments, prefix)
      );
    });
  }

  return false;
}

export function selectPublicFloorplanAddress(
  addresses: ReadonlyArray<ResolvedFloorplanAddress>
): ResolvedFloorplanAddress | null {
  if (
    addresses.length === 0 ||
    addresses.some(
      ({ address, family }) => isIP(address) !== family || !isPublicIpAddress(address)
    )
  ) {
    return null;
  }

  return addresses.find(({ family }) => family === 4) ?? addresses[0];
}

export async function resolvePublicFloorplanAddress(
  hostname: string,
  timeoutMs = FLOORPLAN_DOWNLOAD_TIMEOUT_MS
): Promise<ResolvedFloorplanAddress> {
  const addresses = await withFloorplanTimeout(
    lookup(hostname, { all: true, verbatim: true }),
    timeoutMs
  );
  const candidates: ResolvedFloorplanAddress[] = [];
  for (const { address, family } of addresses) {
    if (family !== 4 && family !== 6) {
      throw new FloorplanDownloadError(
        "unsafe_address",
        "The floorplan host returned an unsupported address family."
      );
    }
    candidates.push({ address, family });
  }
  const selected = selectPublicFloorplanAddress(candidates);

  if (!selected) {
    throw new FloorplanDownloadError(
      "unsafe_address",
      "The floorplan host did not resolve exclusively to public addresses."
    );
  }

  return selected;
}

export function validateFloorplanResponse(
  status: number,
  contentType: string | null,
  contentLength: string | null,
  maxBytes: number
): string {
  if (status >= 300 && status < 400) {
    throw new FloorplanDownloadError("redirect", "Floorplan redirects are not permitted.");
  }
  if (status < 200 || status >= 300) {
    throw new FloorplanDownloadError("upstream", "The floorplan host returned an error.");
  }
  if (!isAllowedFloorplanContentType(contentType)) {
    throw new FloorplanDownloadError(
      "invalid_content_type",
      "Floorplan media must be an image or PDF."
    );
  }

  const parsedContentLength = Number(contentLength ?? 0);
  if (Number.isFinite(parsedContentLength) && parsedContentLength > maxBytes) {
    throw new FloorplanDownloadError("too_large", "Floorplan media is too large.");
  }

  return contentType;
}

export async function collectFloorplanBody(
  chunks: AsyncIterable<Uint8Array>,
  maxBytes: number
): Promise<Buffer> {
  const body: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of chunks) {
    totalBytes += chunk.byteLength;
    if (totalBytes > maxBytes) {
      throw new FloorplanDownloadError("too_large", "Floorplan media is too large.");
    }
    body.push(Buffer.from(chunk));
  }

  return Buffer.concat(body);
}

export function downloadFloorplanFromPinnedAddress(
  url: URL,
  resolvedAddress: ResolvedFloorplanAddress,
  limits: FloorplanDownloadLimits = {
    timeoutMs: FLOORPLAN_DOWNLOAD_TIMEOUT_MS,
    maxBytes: FLOORPLAN_DOWNLOAD_MAX_BYTES,
  }
): Promise<FloorplanDownloadPayload> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const finishReject = (error: FloorplanDownloadError): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error);
    };

    const pinnedLookup: LookupFunction = (_hostname, options, callback) => {
      if (options.all) {
        callback(null, [resolvedAddress]);
        return;
      }

      callback(null, resolvedAddress.address, resolvedAddress.family);
    };

    const requester = url.protocol === "https:" ? httpsRequest : httpRequest;
    const request = requester(
      url,
      {
        family: resolvedAddress.family,
        headers: { Accept: "application/pdf,image/*" },
        lookup: pinnedLookup,
        ...(url.protocol === "https:" ? { servername: url.hostname } : {}),
      },
      (response) => {
        const status = response.statusCode ?? 0;
        let contentType: string;
        try {
          contentType = validateFloorplanResponse(
            status,
            response.headers["content-type"] ?? null,
            response.headers["content-length"] ?? null,
            limits.maxBytes
          );
        } catch (error) {
          const failure =
            error instanceof FloorplanDownloadError
              ? error
              : new FloorplanDownloadError("network", "The floorplan response failed.");
          finishReject(failure);
          response.destroy();
          request.destroy();
          return;
        }

        void collectFloorplanBody(response, limits.maxBytes)
          .then((body) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            resolve({ body, contentType });
          })
          .catch((error: unknown) => {
            response.destroy();
            request.destroy();
            finishReject(
              error instanceof FloorplanDownloadError
                ? error
                : new FloorplanDownloadError("network", "The floorplan response failed.")
            );
          });
      }
    );

    const timeout = setTimeout(() => {
      request.destroy(
        new FloorplanDownloadError("timeout", "The floorplan request timed out.")
      );
    }, limits.timeoutMs);

    request.on("error", (error) => {
      finishReject(
        error instanceof FloorplanDownloadError
          ? error
          : new FloorplanDownloadError("network", "The floorplan request failed.")
      );
    });
    request.end();
  });
}

export async function withFloorplanTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeout = setTimeout(
          () =>
            reject(
              new FloorplanDownloadError("timeout", "The floorplan lookup timed out.")
            ),
          timeoutMs
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function parseIpv4(value: string): number | null {
  const parts = value.split(".");
  if (parts.length !== 4) return null;

  const octets = parts.map(Number);
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return null;
  }

  return (
    octets[0] * 2 ** 24 +
    octets[1] * 2 ** 16 +
    octets[2] * 2 ** 8 +
    octets[3]
  ) >>> 0;
}

function matchesIpv4Cidr(address: number, base: number, prefix: number): boolean {
  const shift = 32 - prefix;
  return Math.floor(address / 2 ** shift) === Math.floor(base / 2 ** shift);
}

function parseIpv6(value: string): number[] | null {
  if (value.includes("%")) return null;

  let input = value.toLowerCase();
  if (input.includes(".")) {
    const separator = input.lastIndexOf(":");
    if (separator < 0) return null;
    const ipv4 = parseIpv4(input.slice(separator + 1));
    if (ipv4 === null) return null;
    input = `${input.slice(0, separator)}:${(ipv4 >>> 16).toString(16)}:${(
      ipv4 & 0xffff
    ).toString(16)}`;
  }

  const halves = input.split("::");
  if (halves.length > 2) return null;

  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || (halves.length === 2 && missing < 1)) {
    return null;
  }

  const segments = [...left, ...Array.from({ length: missing }, () => "0"), ...right];
  if (
    segments.length !== 8 ||
    segments.some((segment) => !/^[0-9a-f]{1,4}$/.test(segment))
  ) {
    return null;
  }

  return segments.map((segment) => Number.parseInt(segment, 16));
}

function matchesIpv6Cidr(address: number[], base: number[], prefix: number): boolean {
  const wholeSegments = Math.floor(prefix / 16);
  for (let index = 0; index < wholeSegments; index += 1) {
    if (address[index] !== base[index]) return false;
  }

  const remainingBits = prefix % 16;
  if (remainingBits === 0) return true;

  const mask = (0xffff << (16 - remainingBits)) & 0xffff;
  return (address[wholeSegments] & mask) === (base[wholeSegments] & mask);
}
