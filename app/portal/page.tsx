import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Portal | Banc Property Group",
  description: "Access your vendor, applicant or landlord portal with Banc Property Group.",
  path: "/portal",
  noindex: true,
});

import { redirect } from "next/navigation";

export default function PortalPage() {
  // TODO: Implement auth check and redirect to appropriate portal
  // For now, redirect to vendor portal as default
  redirect("/portal/vendor");
}
