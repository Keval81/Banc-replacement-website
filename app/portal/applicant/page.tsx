import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import ApplicantPortalPageClient from "./ApplicantPortalPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Applicant Portal | Banc Property Group",
  description: "Manage your property search, viewings and offers in the Banc Property Group applicant portal.",
  path: "/portal/applicant",
  noindex: true,
});

export default function ApplicantPortalPage() {
  return <ApplicantPortalPageClient />;
}
