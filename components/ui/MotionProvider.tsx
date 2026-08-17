"use client";

import { MotionConfig } from "framer-motion";

export function MotionProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
