/**
 * Best-effort request throttling for the public chat route.
 *
 * Each chat turn costs up to three paid provider calls, so an unauthenticated
 * route needs a ceiling per visitor. The in-memory limiter below is scoped to
 * one server instance, which is enough to stop a single client from burning
 * budget in a loop; swap in a shared store through the same interface when
 * the site runs across many instances.
 */

export interface RateLimitDecision {
  allowed: boolean;
  /** Seconds until the visitor may retry when not allowed. */
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitDecision;
}

export interface RateLimitWindow {
  /** Maximum requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export const DEFAULT_CHAT_RATE_LIMIT_WINDOWS: readonly RateLimitWindow[] = [
  { limit: 12, windowMs: 60_000 },
  { limit: 120, windowMs: 60 * 60_000 },
];

const MAX_TRACKED_KEYS = 10_000;

export function createInMemoryRateLimiter(
  windows: readonly RateLimitWindow[] = DEFAULT_CHAT_RATE_LIMIT_WINDOWS,
): RateLimiter {
  const longestWindow = Math.max(...windows.map((window) => window.windowMs));
  const hits = new Map<string, number[]>();

  function prune(now: number): void {
    if (hits.size <= MAX_TRACKED_KEYS) return;
    for (const [key, timestamps] of hits) {
      const last = timestamps.at(-1);
      if (last === undefined || now - last > longestWindow) hits.delete(key);
    }
  }

  return {
    check(key, now = Date.now()) {
      prune(now);
      const timestamps = (hits.get(key) ?? []).filter(
        (timestamp) => now - timestamp < longestWindow,
      );

      let retryAfterSeconds = 0;
      for (const window of windows) {
        const inWindow = timestamps.filter(
          (timestamp) => now - timestamp < window.windowMs,
        );
        if (inWindow.length >= window.limit) {
          const oldest = inWindow[0] ?? now;
          retryAfterSeconds = Math.max(
            retryAfterSeconds,
            Math.ceil((oldest + window.windowMs - now) / 1_000),
          );
        }
      }

      if (retryAfterSeconds > 0) {
        hits.set(key, timestamps);
        return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
      }

      timestamps.push(now);
      hits.set(key, timestamps);
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

/**
 * Derives a stable per-visitor key from proxy headers. Falls back to a shared
 * bucket when no address is available so the route still has a ceiling.
 */
export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first && first.length <= 64) return `ip:${first}`;
  const real = request.headers.get("x-real-ip")?.trim();
  if (real && real.length <= 64) return `ip:${real}`;
  return "ip:unknown";
}
