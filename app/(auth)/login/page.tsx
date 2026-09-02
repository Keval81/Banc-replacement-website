import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Sign In | Banc Property Group",
  description: "Sign in to your Banc Property Group account to manage saved properties, alerts and viewing requests.",
  path: "/login",
  noindex: true,
});

export default function LoginPage() {
  return <LoginPageClient />;
}
