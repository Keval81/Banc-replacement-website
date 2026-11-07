import { after } from "next/server";
import { clientKeyFromRequest, createInMemoryRateLimiter, parsePropertyOpen } from "@/lib/banc-conversation";
import { reportFormEvent } from "@/lib/portal-events";

export const runtime = "nodejs";

const limiter = createInMemoryRateLimiter();

/** Count-only: a property card opened from Banc Bot, for the DI portal's Banc Bot card. */
export async function POST(request: Request): Promise<Response> {
  if (!limiter.check(clientKeyFromRequest(request)).allowed) return new Response(null, { status: 429 });
  const body: unknown = await request.json().catch(() => null);
  const event = parsePropertyOpen(body);
  if (!event) return new Response(null, { status: 400 });
  after(() => reportFormEvent(event));
  return new Response(null, { status: 204 });
}
