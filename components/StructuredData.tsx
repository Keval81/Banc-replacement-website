import React from "react";

// Organization Structured Data
export const OrganizationStructuredData = () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Banc Property Group",
    alternateName: "Banc",
    url: "https://bancproperty.com",
    logo: {
      "@type": "ImageObject",
      url: "https://bancproperty.com/banc-logo.png",
      width: 512,
      height: 512,
    },
    image: "https://bancproperty.com/banc-logo.png",
    description: "Independent estate agents in Cuffley and Mayfair. Property sales, lettings, and valuations across Hertfordshire and North London.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1 Station Road",
      addressLocality: "Cuffley",
      addressRegion: "Hertfordshire",
      postalCode: "EN6 4HU",
      addressCountry: "GB",
    },
    telephone: "+44 1707 877781",
    email: "info@bancproperty.com",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    sameAs: [
      "https://www.facebook.com/BANCpropertygroup",
      "https://www.youtube.com/channel/UCuNRAhFmoSsDzyL6sFpOGtQ",
      "https://www.instagram.com/bancproperty",
    ],
    areaServed: [
      {
        "@type": "City",
        name: "Cuffley",
      },
      {
        "@type": "City",
        name: "Mayfair",
      },
      {
        "@type": "AdministrativeArea",
        name: "Hertfordshire",
      },
    ],
    priceRange: "££££",
    paymentAccepted: ["Cash", "Credit Card", "Bank Transfer"],
    currenciesAccepted: "GBP",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

// Property Listing Structured Data
interface PropertyStructuredDataProps {
  property: {
    id: string;
    title: string;
    description: string;
    url: string;
    images: string[];
    address: {
      street: string;
      locality: string;
      region: string;
      postalCode: string;
    };
    price: number;
    priceCurrency?: string;
    bedrooms?: number;
    bathrooms?: number;
    floorSize?: {
      value: number;
      unit: string;
    };
    datePosted?: string;
  };
}

export const PropertyStructuredData = ({ property }: PropertyStructuredDataProps) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: property.url,
    image: property.images.map((img) =>
      img.startsWith("http") ? img : `https://bancproperty.com${img}`
    ),
    datePosted: property.datePosted || new Date().toISOString(),
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address.street,
      addressLocality: property.address.locality,
      addressRegion: property.address.region,
      postalCode: property.address.postalCode,
      addressCountry: "GB",
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.priceCurrency || "GBP",
      businessFunction: "http://purl.org/goodrelations/v1#Sell",
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: property.floorSize
      ? {
          "@type": "QuantitativeValue",
          value: property.floorSize.value,
          unitCode: property.floorSize.unit === "sqft" ? "FTK" : "MTK",
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

// Website Structured Data
export const WebsiteStructuredData = () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Banc Property Group",
    url: "https://bancproperty.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://bancproperty.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

// Local Business Structured Data
export const LocalBusinessStructuredData = () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Banc Property Group",
    image: "https://bancproperty.com/banc-logo.png",
    "@id": "https://bancproperty.com",
    url: "https://bancproperty.com",
    telephone: "+44 1707 877781",
    email: "info@bancproperty.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1 Station Road",
      addressLocality: "Cuffley",
      addressRegion: "Hertfordshire",
      postalCode: "EN6 4HU",
      addressCountry: "GB",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    priceRange: "££££",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

// FAQ Structured Data
interface FAQ {
  question: string;
  answer: string;
}

interface FAQStructuredDataProps {
  faqs: FAQ[];
}

export const FAQStructuredData = ({ faqs }: FAQStructuredDataProps) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

// Breadcrumb Structured Data
interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbStructuredData = ({ items }: BreadcrumbStructuredDataProps) => {
  const baseUrl = "https://bancproperty.com";
  
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.name,
        item: item.url ? `${baseUrl}${item.url}` : undefined,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

// Service Area Structured Data
export const ServiceAreaStructuredData = () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Estate Agency",
    provider: {
      "@type": "RealEstateAgent",
      name: "Banc Property Group",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Cuffley",
        containedIn: {
          "@type": "AdministrativeArea",
          name: "Hertfordshire",
        },
      },
      {
        "@type": "City",
        name: "Mayfair",
        containedIn: {
          "@type": "City",
          name: "London",
        },
      },
      {
        "@type": "AdministrativeArea",
        name: "Hertfordshire",
      },
      {
        "@type": "City",
        name: "Broxbourne",
      },
      {
        "@type": "City",
        name: "Cheshunt",
      },
      {
        "@type": "City",
        name: "Goffs Oak",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Property Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Property Sales",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Property Lettings",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Property Valuations",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Property Management",
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default {
  OrganizationStructuredData,
  PropertyStructuredData,
  WebsiteStructuredData,
  LocalBusinessStructuredData,
  FAQStructuredData,
  BreadcrumbStructuredData,
  ServiceAreaStructuredData,
};
