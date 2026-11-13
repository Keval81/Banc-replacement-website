"use client";

import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-banc-grey-pale">
      <div className="text-banc-muted-readable">Loading...</div>
    </div>}>
      <LoginForm />
    </Suspense>
  );
}
