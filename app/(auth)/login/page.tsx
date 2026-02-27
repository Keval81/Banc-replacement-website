"use client";

import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#2C2F33] via-[#1a1d21] to-[#0f1113] pt-24 pb-16 flex items-center justify-center">
      <div className="text-white/60">Loading...</div>
    </div>}>
      <LoginForm />
    </Suspense>
  );
}
