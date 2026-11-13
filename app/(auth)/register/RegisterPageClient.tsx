"use client";

import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-banc-grey-pale">
        <div className="text-banc-muted-readable">Loading...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
