"use client";

import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  enableSystem?: boolean;
  attribute?: string;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}
