import type { Metadata } from "next";
import TenantsGuideClient from "./TenantsGuideClient";

export const metadata: Metadata = {
  title: "Tenants Guide | Banc Property Group",
  description: "Banc Property Group is proud to be an approved Property Guild agent. Find helpful advice and transparency of charges for tenants renting with us.",
};

export default function TenantsGuidePage() {
  return <TenantsGuideClient />;
}
