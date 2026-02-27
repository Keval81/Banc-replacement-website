import { redirect } from "next/navigation";

export default function PortalPage() {
  // TODO: Implement auth check and redirect to appropriate portal
  // For now, redirect to vendor portal as default
  redirect("/portal/vendor");
}
