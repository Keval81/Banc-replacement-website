// schema.org JSON-LD builders shared by pages. Everything here is plain data
// so it can be unit-tested without React; render with <JsonLd data={...} />.

import { BANC_OFFICES, type BancOfficeContact } from "./banc-content/contact.ts";
import { absoluteUrl, SITE_NAME, SITE_URL } from "./site.ts";
import type { LivePropertyDetail } from "./property-view.ts";
import { buildPropertyHref } from "./property-view.ts";

export const SCHEMA_CONTEXT = "https://schema.org";

export const BANC_LOGO_PATH = "/banc-logo.svg";

export const BANC_SOCIAL_LINKS = [
  "https://www.facebook.com/BANCpropertygroup",
  "https://instagram.com/bancproperty",
  "https://www.youtube.com/channel/UCuNRAhFmoSsDzyL6sFpOGtQ",
] as const;

export const BANC_DESCRIPTION =
  "Independent estate agents in Cuffley and Mayfair. Property sales, lettings and valuations across Hertfordshire and North London.";

export interface OfficeGeo {
  latitude: number;
  longitude: number;
}

export interface PostalAddress {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode: string;
  addressCountry: "GB";
}

// Cuffley office coordinates — taken from the Google Maps embed used on the
// contact page (1 Station Road, Cuffley EN6 4HU).
export const CUFFLEY_GEO: OfficeGeo = { latitude: 51.70798, longitude: -0.113307 };

export const CUFFLEY_ADDRESS: PostalAddress = {
  "@type": "PostalAddress",
  streetAddress: "1 Station Road",
  addressLocality: "Cuffley",
  addressRegion: "Hertfordshire",
  postalCode: "EN6 4HU",
  addressCountry: "GB",
};

export const MAYFAIR_ADDRESS: PostalAddress = {
  "@type": "PostalAddress",
  streetAddress: "121 Park Lane",
  addressLocality: "Mayfair, London",
  postalCode: "W1K 7AG",
  addressCountry: "GB",
};

// "01707 877781" -> "+441707877781"
export function toE164(displayPhone: string): string {
  const digits = displayPhone.replace(/\D/g, "");
  return digits.startsWith("0") ? `+44${digits.slice(1)}` : `+${digits}`;
}

const DAY_NAMES: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};
const DAY_ORDER = Object.values(DAY_NAMES);

function to24h(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = match[2] ?? "00";
  const period = match[3].toLowerCase();
  if (period === "pm" && hours < 12) hours += 12;
  if (period === "am" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

export interface OpeningHoursSpecification {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

// Parses the approved copy format ("Monday to Saturday: 9am to 6pm",
// "Sunday: Closed") into schema.org OpeningHoursSpecification entries.
export function parseOpeningHours(lines: readonly string[]): OpeningHoursSpecification[] {
  const specs: OpeningHoursSpecification[] = [];
  for (const line of lines) {
    const [daysPart, hoursPart] = line.split(":").map((part) => part?.trim() ?? "");
    if (!daysPart || !hoursPart || /closed/i.test(hoursPart)) continue;
    const range = hoursPart.match(/^(.+?)\s+to\s+(.+)$/i);
    if (!range) continue;
    const opens = to24h(range[1]);
    const closes = to24h(range[2]);
    if (!opens || !closes) continue;

    const dayMatch = daysPart.match(/^(\w+)(?:\s+to\s+(\w+))?$/i);
    if (!dayMatch) continue;
    const start = DAY_NAMES[dayMatch[1].toLowerCase()];
    const end = dayMatch[2] ? DAY_NAMES[dayMatch[2].toLowerCase()] : start;
    if (!start || !end) continue;
    const startIndex = DAY_ORDER.indexOf(start);
    const endIndex = DAY_ORDER.indexOf(end);
    const dayOfWeek =
      endIndex >= startIndex ? DAY_ORDER.slice(startIndex, endIndex + 1) : [start];
    specs.push({ "@type": "OpeningHoursSpecification", dayOfWeek, opens, closes });
  }
  return specs;
}

export function organizationJsonLd() {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": ["RealEstateAgent", "LocalBusiness", "Organization"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "Banc",
    url: SITE_URL,
    logo: absoluteUrl(BANC_LOGO_PATH),
    image: absoluteUrl(BANC_LOGO_PATH),
    description: BANC_DESCRIPTION,
    address: CUFFLEY_ADDRESS,
    geo: { "@type": "GeoCoordinates", ...CUFFLEY_GEO },
    telephone: toE164(BANC_OFFICES.cuffley.phone.displayPhone),
    email: BANC_OFFICES.cuffley.email.displayEmail,
    openingHoursSpecification: parseOpeningHours(BANC_OFFICES.cuffley.openingHours),
    sameAs: [...BANC_SOCIAL_LINKS],
    areaServed: [
      { "@type": "AdministrativeArea", name: "Hertfordshire" },
      { "@type": "City", name: "Cuffley" },
      { "@type": "City", name: "London" },
    ],
  };
}

export interface OfficeJsonLdInput {
  office: BancOfficeContact;
  path: string;
  address: PostalAddress;
  geo?: OfficeGeo;
  name?: string;
  description?: string;
}

export function officeJsonLd({ office, path, address, geo, name, description }: OfficeJsonLdInput) {
  const url = absoluteUrl(path);
  const openingHoursSpecification = parseOpeningHours(office.openingHours);
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": ["RealEstateAgent", "LocalBusiness"],
    "@id": `${url}#office`,
    name: name ?? `${SITE_NAME} — ${office.title}`,
    ...(description ? { description } : {}),
    url,
    image: absoluteUrl(BANC_LOGO_PATH),
    logo: absoluteUrl(BANC_LOGO_PATH),
    telephone: toE164(office.phone.displayPhone),
    email: office.email.displayEmail,
    address,
    ...(geo ? { geo: { "@type": "GeoCoordinates", ...geo } } : {}),
    ...(openingHoursSpecification.length > 0 ? { openingHoursSpecification } : {}),
    sameAs: [...BANC_SOCIAL_LINKS],
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqPageJsonLd(items: readonly FaqItem[]) {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export interface ArticleJsonLdInput {
  headline: string;
  description: string;
  path: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorPath?: string;
  keywords?: readonly string[];
  section?: string;
}

export function articleJsonLd(input: ArticleJsonLdInput) {
  const url = absoluteUrl(input.path);
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(input.image ? { image: [absoluteUrl(input.image)] } : {}),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: {
      "@type": "Organization",
      name: input.authorName,
      ...(input.authorPath ? { url: absoluteUrl(input.authorPath) } : {}),
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl(BANC_LOGO_PATH) },
    },
    ...(input.keywords && input.keywords.length > 0
      ? { keywords: input.keywords.join(", ") }
      : {}),
    ...(input.section ? { articleSection: input.section } : {}),
  };
}

// ---- Property listings ------------------------------------------------------

const MARKETABLE_STATUSES: ReadonlySet<LivePropertyDetail["status"]> = new Set([
  "for_sale",
  "under_offer",
  "to_let",
  "let_agreed",
]);

export function isMarketableStatus(status: LivePropertyDetail["status"]): boolean {
  return MARKETABLE_STATUSES.has(status);
}

function offerAvailability(status: LivePropertyDetail["status"]): string {
  switch (status) {
    case "for_sale":
    case "to_let":
      return "https://schema.org/InStock";
    case "under_offer":
    case "let_agreed":
      return "https://schema.org/LimitedAvailability";
    default:
      return "https://schema.org/SoldOut";
  }
}

function toIsoDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

// Splits "12 Example Road, Cuffley, Hertfordshire" into PostalAddress parts.
// The feed does not give structured address fields, so this is best-effort.
export function propertyPostalAddress(
  address: string,
  postcode: string,
): PostalAddress {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "" && part.toUpperCase() !== postcode.toUpperCase());
  const streetAddress = parts[0] ?? address;
  const addressLocality = parts.length > 1 ? parts[1] : "";
  const addressRegion = parts.length > 2 ? parts[parts.length - 1] : undefined;
  return {
    "@type": "PostalAddress",
    streetAddress,
    addressLocality,
    ...(addressRegion ? { addressRegion } : {}),
    postalCode: postcode,
    addressCountry: "GB",
  };
}

export function realEstateListingJsonLd(property: LivePropertyDetail) {
  const url = absoluteUrl(buildPropertyHref(property.department, property.id));
  const address = propertyPostalAddress(property.address, property.postcode);
  const hasGeo =
    typeof property.latitude === "number" &&
    typeof property.longitude === "number" &&
    Number.isFinite(property.latitude) &&
    Number.isFinite(property.longitude);
  const rooms = property.stats.beds + property.stats.baths + property.receptions;
  const datePosted = toIsoDate(property.addedDate);
  const isLetting = property.department === "lettings";

  const residence = {
    "@type": ["Residence", "Accommodation"],
    name: property.title,
    description: property.summary,
    address,
    ...(hasGeo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: property.latitude,
            longitude: property.longitude,
          },
        }
      : {}),
    numberOfRooms: rooms > 0 ? rooms : undefined,
    numberOfBedrooms: property.stats.beds,
    numberOfBathroomsTotal: property.stats.baths,
    ...(property.stats.sqft
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: property.stats.sqft,
            unitCode: "FTK",
            unitText: "sq ft",
          },
        }
      : {}),
    ...(property.images.length > 0 ? { image: property.images } : {}),
    url,
  };

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "RealEstateListing",
    "@id": url,
    url,
    name: property.title,
    description: property.summary,
    ...(datePosted ? { datePosted } : {}),
    ...(property.images.length > 0 ? { image: property.images } : {}),
    mainEntity: residence,
    offers: {
      "@type": "Offer",
      price: property.priceNum,
      priceCurrency: "GBP",
      ...(isLetting
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: property.priceNum,
              priceCurrency: "GBP",
              unitCode: "MON",
              unitText: "per calendar month",
            },
          }
        : {}),
      availability: offerAvailability(property.status),
      businessFunction: isLetting
        ? "http://purl.org/goodrelations/v1#LeaseOut"
        : "http://purl.org/goodrelations/v1#Sell",
      itemOffered: residence,
      url,
      seller: { "@id": `${SITE_URL}/#organization` },
    },
    provider: { "@id": `${SITE_URL}/#organization` },
  };
}
