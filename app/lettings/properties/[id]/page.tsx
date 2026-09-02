import type { Metadata } from "next";

import {
  buildPropertyMetadata,
  renderPropertyPage,
} from "@/app/sales/properties/[id]/property-page";

export const revalidate = 300;

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { id } = await params;
  return buildPropertyMetadata(id, "lettings");
}

export default async function LettingsPropertyPage({ params }: RouteProps) {
  const { id } = await params;
  return renderPropertyPage(id, "lettings");
}
