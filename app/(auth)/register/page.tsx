import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import RegisterPageClient from "./RegisterPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Create an Account | Banc Property Group",
  description: "Create a free Banc Property Group account to save properties, set up alerts and track your property journey.",
  path: "/register",
  noindex: true,
});

export default function RegisterPage() {
  return <RegisterPageClient />;
}
