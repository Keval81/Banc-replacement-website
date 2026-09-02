// Lightweight auth configuration flags that are safe to import from the root
// layout, middleware and API routes without pulling in NextAuth/Prisma.

export const authSecret =
  process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? undefined;

/**
 * True when a signing secret is present. When false, NextAuth would throw
 * `MissingSecret` on every session lookup, so callers must short-circuit
 * instead of invoking it.
 */
export const isAuthConfigured = Boolean(authSecret);

/** Paths that require a signed-in user. */
export const AUTH_GATED_PATHS = [
  "/account",
  "/favorites",
  "/alerts",
  "/portal",
  "/progress",
] as const;

export function isAuthGatedPath(pathname: string): boolean {
  return AUTH_GATED_PATHS.some((path) => pathname.startsWith(path));
}
