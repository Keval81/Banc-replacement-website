import { timingSafeEqual } from "node:crypto";

/**
 * True when the request carries `Authorization: Bearer <ADMIN_API_TOKEN>`.
 * Always false when the env var is unset, so admin endpoints fail closed.
 */
export function isAdminRequest(request: Request): boolean {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (provided.length === 0) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
