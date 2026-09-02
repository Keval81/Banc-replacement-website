import { auth } from "@/lib/auth";
import { isAuthConfigured, isAuthGatedPath } from "@/lib/auth-config";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

const withAuth = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  if (isAuthGatedPath(nextUrl.pathname) && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  return NextResponse.next();
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // Without AUTH_SECRET, NextAuth throws MissingSecret on every request.
  // Quarantine gated routes instead of invoking it.
  if (!isAuthConfigured) {
    if (isAuthGatedPath(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/login?reason=unavailable", req.nextUrl));
    }
    return NextResponse.next();
  }

  // NextAuth's wrapper is typed as a route handler; the middleware
  // signature is call-compatible at runtime.
  return (withAuth as unknown as (
    request: NextRequest,
    context: NextFetchEvent,
  ) => ReturnType<typeof withAuth>)(req, event);
}

export const config = {
  matcher: [
    "/account/:path*",
    "/favorites/:path*",
    "/alerts/:path*",
    "/portal/:path*",
    "/progress/:path*",
  ],
};
