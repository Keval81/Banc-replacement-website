import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { isAuthConfigured } from "@/lib/auth-config";
import { AuthSessionProvider } from "./AuthSessionProvider";

interface AuthProviderProps {
  children: ReactNode;
  /** Optional pre-fetched session (e.g. from `auth()` in a server component). */
  session?: Session | null;
}

/**
 * Server wrapper around next-auth's SessionProvider. When no auth secret is
 * configured we seed the provider with `session={null}` so public pages never
 * hit /api/auth/session (which would 500 with MissingSecret).
 */
export function AuthProvider({ children, session }: AuthProviderProps) {
  const initialSession = isAuthConfigured ? session : null;
  return <AuthSessionProvider session={initialSession}>{children}</AuthSessionProvider>;
}
