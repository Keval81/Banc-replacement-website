import { NextResponse, type NextRequest } from "next/server";
import { GET as authGet, POST as authPost } from "@/lib/auth";
import { isAuthConfigured } from "@/lib/auth-config";

// Add runtime config for Next.js App Router
export const runtime = "nodejs";

const UNAVAILABLE_HEADERS = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  if (!isAuthConfigured) {
    // Accounts are not enabled yet: answer session/csrf/providers probes with
    // an empty session instead of letting NextAuth throw MissingSecret.
    return NextResponse.json({ user: null }, { status: 200, headers: UNAVAILABLE_HEADERS });
  }
  return authGet(request);
}

export async function POST(request: NextRequest) {
  if (!isAuthConfigured) {
    return NextResponse.json(
      { error: "Accounts are not available yet" },
      { status: 503, headers: UNAVAILABLE_HEADERS }
    );
  }
  return authPost(request);
}
