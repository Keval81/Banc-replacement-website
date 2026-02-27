"use client";

import { Suspense } from "react";
import SearchContent from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#2C2F33] via-[#1a1d21] to-[#0f1113] flex items-center justify-center">
        <div className="text-white/60">Loading search...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
