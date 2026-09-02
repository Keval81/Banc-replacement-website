import type { Metadata } from "next";

import { buildPropertyMetadata, renderPropertyPage } from "./property-page";

export const revalidate = 300;

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { id } = await params;
  return buildPropertyMetadata(id, "sales");
}

export default async function SalesPropertyPage({ params }: RouteProps) {
  const { id } = await params;
  return renderPropertyPage(id, "sales");
}
