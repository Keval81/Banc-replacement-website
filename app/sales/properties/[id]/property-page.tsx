// Shared server-side loader, metadata and JSON-LD for the sales and lettings
// property detail routes. Kept outside page.tsx because Next only permits
// route-specific exports from page files.
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { JsonLd } from "@/components/JsonLd";
import { loadPropertyDetail, type PropertyDetailPayload } from "@/lib/property-detail-server";
import { getSafePropertyImageUrl } from "@/lib/property-detail-view";
import {
  buildPropertyHref,
  getCanonicalPropertyHref,
  type LivePropertyDetail,
} from "@/lib/property-view";
import {
  breadcrumbJsonLd,
  isMarketableStatus,
  realEstateListingJsonLd,
} from "@/lib/schema-org";
import { absoluteUrl, SITE_NAME, truncateDescription } from "@/lib/site";

import PropertyDetailPage from "./PropertyDetailPage";

type Department = LivePropertyDetail["department"];

async function loadForDepartment(
  id: string,
  requestedDepartment: Department,
): Promise<PropertyDetailPayload | null> {
  const result = await loadPropertyDetail(id);
  if (result.status === "error") console.error("property page:", result.message);
  if (result.status !== "ok") return null;

  const { property } = result.data;
  const canonicalHref = getCanonicalPropertyHref(
    requestedDepartment,
    property.department,
    property.id,
  );
  if (canonicalHref) redirect(canonicalHref);
  return result.data;
}

function resultsLabel(department: Department): string {
  return department === "lettings" ? "To Let" : "For Sale";
}

export async function buildPropertyMetadata(
  id: string,
  requestedDepartment: Department,
): Promise<Metadata> {
  const data = await loadForDepartment(id, requestedDepartment);
  if (!data) {
    return {
      title: `Property not found | ${SITE_NAME}`,
      robots: { index: false, follow: true },
    };
  }

  const { property } = data;
  const canonical = absoluteUrl(buildPropertyHref(property.department, property.id));
  const title = `${property.title} — ${property.price} | ${SITE_NAME}`;
  const description = truncateDescription(
    property.summary ||
      `${property.stats.beds} bedroom ${property.propertyType} ${
        property.department === "lettings" ? "to let" : "for sale"
      } at ${property.address}.`,
  );
  const ogImage = property.images
    .map(getSafePropertyImageUrl)
    .find((url): url is string => url !== null);

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: isMarketableStatus(property.status), follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_GB",
      ...(ogImage ? { images: [{ url: ogImage, alt: `${property.title} — main photo` }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export async function renderPropertyPage(id: string, requestedDepartment: Department) {
  const data = await loadForDepartment(id, requestedDepartment);
  if (!data) notFound();

  const { property } = data;
  const propertyPath = buildPropertyHref(property.department, property.id);

  return (
    <>
      <JsonLd
        data={[
          realEstateListingJsonLd(property),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            {
              name: resultsLabel(property.department),
              path: `/${property.department}/properties`,
            },
            { name: property.title, path: propertyPath },
          ]),
        ]}
      />
      <PropertyDetailPage
        id={property.id}
        requestedDepartment={requestedDepartment}
        initial={data}
      />
    </>
  );
}

