import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import TenantsGuideClient from "./TenantsGuideClient";

export const metadata: Metadata = withPageDefaults("/lettings/tenants-guide", {
  title: "Tenants Guide | Banc Property Group",
  description: "Banc Property Group is proud to be an approved Property Guild agent. Find helpful advice and transparency of charges for tenants renting with us.",
});

export const revalidate = 3600;

export default function TenantsGuidePage() {
  return <TenantsGuideClient />;
}
