import { NextResponse } from "next/server";
import {
  clientKeyFromRequest,
  createInMemoryRateLimiter,
  type RateLimiter,
} from "./banc-conversation/rate-limit";

/** 5 requests per minute per IP — enough for a human, not a script. */
export const PUBLIC_FORM_RATE_LIMIT = [{ limit: 5, windowMs: 60_000 }] as const;

export function createPublicFormRateLimiter(): RateLimiter {
  return createInMemoryRateLimiter(PUBLIC_FORM_RATE_LIMIT);
}

/**
 * Returns a 429 response when the caller has exceeded the limiter, else null.
 */
export function rateLimitResponse(
  limiter: RateLimiter,
  request: Request
): NextResponse | null {
  const decision = limiter.check(clientKeyFromRequest(request));
  if (decision.allowed) return null;
  return NextResponse.json(
    { success: false, error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: { "Retry-After": String(decision.retryAfterSeconds) },
    }
  );
}

/**
 * Honeypot: the hidden `website` field must be empty. Bots that fill every
 * input get a fake success so they do not learn they were filtered.
 */
export function isHoneypotTripped(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const value = (body as Record<string, unknown>).website;
  return typeof value === "string" && value.trim().length > 0;
}
