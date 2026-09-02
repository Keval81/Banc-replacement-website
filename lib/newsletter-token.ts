import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed unsubscribe tokens: HMAC-SHA256 of the normalised email keyed by
 * NEWSLETTER_UNSUBSCRIBE_SECRET. Embed `?email=…&token=…` in newsletter
 * footers so only the recipient can unsubscribe an address.
 */
export function normaliseNewsletterEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createUnsubscribeToken(email: string): string | null {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret)
    .update(normaliseNewsletterEmail(email))
    .digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = createUnsubscribeToken(email);
  if (!expected || !/^[0-9a-f]{64}$/i.test(token)) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(token, "hex"));
}
