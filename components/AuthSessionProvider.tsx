"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";

interface AuthSessionProviderProps {
  children: ReactNode;
  /**
   * Initial session. Pass `null` to render without any /api/auth/session
   * request (used when accounts are not configured); leave `undefined` to
   * let the provider fetch the session once on mount.
   */
  session?: Session | null;
}

export function AuthSessionProvider({ children, session }: AuthSessionProviderProps) {
  return (
    <SessionProvider
      session={session}
      basePath="/api/auth"
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  );
}
