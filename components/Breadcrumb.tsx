"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  // Add home as first item
  const allItems = [{ label: "Home", href: "/" }, ...items];

  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-sm text-[#8A8880] ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-[#9CA3AF]" aria-hidden="true" />
              )}
              
              {isLast ? (
                <span
                  className="font-medium text-[#2C2A27]"
                  aria-current="page"
                >
                  {isFirst && <Home className="mr-1 inline h-4 w-4" />}
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-[#4AC8E8]"
                >
                  {isFirst && <Home className="mr-1 inline h-4 w-4" />}
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Structured data for breadcrumbs
export function generateBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  const baseUrl = "https://bancproperty.com";
  
  return {
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
        name: item.label,
        item: item.href ? `${baseUrl}${item.href}` : undefined,
      })),
    ],
  };
}
