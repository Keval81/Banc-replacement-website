"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { actionPrimary, actionSecondary } from "@/components/ui/form-styles";
import { 
  Bed, 
  Bath, 
  Square, 
  Sparkles,
  Home,
  Calendar,
  Tag,
  X,
  Check,
  MapPin
} from "lucide-react";
import { useComparison } from "@/app/hooks/usePropertyComparison";

interface CompareTableProps {
  className?: string;
}

export default function CompareTable({ className }: CompareTableProps) {
  const { comparedProperties, removeFromComparison } = useComparison();

  if (comparedProperties.length === 0) {
    return (
      <div className="p-5 sm:p-6">
        <p className="mb-4 text-banc-muted-readable">No properties selected for comparison</p>
        <Link href="/search" className={actionPrimary}>
          Browse Properties
        </Link>
      </div>
    );
  }

  const features = [
    { icon: Bed, label: "Bedrooms", key: "beds" as const },
    { icon: Bath, label: "Bathrooms", key: "baths" as const },
    { icon: Square, label: "Square Feet", key: "sqft" as const },
    { icon: Sparkles, label: "EPC Rating", key: "epc" as const },
  ];

  const getBestValue = (key: "beds" | "baths" | "sqft") => {
    const values = comparedProperties.map((p) => p.stats[key]);
    return Math.max(...values);
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="text-left p-4 font-medium text-banc-muted-readable w-32">Feature</th>
            {comparedProperties.map((property) => (
              <th key={property.id} className="p-4 min-w-[200px]">
                <div className="relative">
                  <button
                    onClick={() => removeFromComparison(property.id)}
                    className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-white text-banc-dark-deep transition-colors duration-200 hover:bg-banc-grey-pale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] mb-3">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-left font-semibold text-banc-dark-deep line-clamp-1">
                    {property.title}
                  </h3>
                  <p className="text-sm text-banc-muted-readable text-left line-clamp-1">
                    {property.address}
                  </p>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Price Row */}
          <tr className="border-t border-banc-dark/15">
            <td className="p-4 text-sm font-medium text-banc-muted-readable">Price</td>
            {comparedProperties.map((property) => (
              <td key={property.id} className="p-4">
                <span className="font-display text-2xl font-light tracking-[-0.02em] text-banc-dark-deep">
                  {property.price}
                </span>
              </td>
            ))}
          </tr>

          {/* Price per sqft (calculated) */}
          <tr className="border-t border-banc-dark/15">
            <td className="p-4 text-sm font-medium text-banc-muted-readable">Price/sqft</td>
            {comparedProperties.map((property) => {
              const priceNum = parseInt(property.price.replace(/[^\d]/g, ""));
              const pricePerSqft = Math.round(priceNum / property.stats.sqft);
              return (
                <td key={property.id} className="p-4">
                  <span className="text-sm text-banc-muted-readable">
                    £{pricePerSqft.toLocaleString()}
                  </span>
                </td>
              );
            })}
          </tr>

          {/* Property Type */}
          <tr className="border-t border-banc-dark/15">
            <td className="p-4 text-sm font-medium text-banc-muted-readable">
              <span className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Type
              </span>
            </td>
            {comparedProperties.map((property) => (
              <td key={property.id} className="p-4">
                <span className="capitalize">{property.type}</span>
              </td>
            ))}
          </tr>

          {/* Stats */}
          {features.map(({ icon: Icon, label, key }) => (
            <tr key={key} className="border-t border-banc-dark/15">
              <td className="p-4 text-sm font-medium text-banc-muted-readable">
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
              </td>
              {comparedProperties.map((property) => {
                const isBest = key !== "epc" && property.stats[key] === getBestValue(key);
                return (
                  <td key={property.id} className="p-4">
                    <span className={cn(
                      "flex items-center gap-1",
                      isBest && "font-semibold text-banc-dark-deep"
                    )}>
                      {property.stats[key]}
                      {isBest && <Check className="h-4 w-4 text-green-700" />}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Tenure */}
          <tr className="border-t border-banc-dark/15">
            <td className="p-4 text-sm font-medium text-banc-muted-readable">
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tenure
              </span>
            </td>
            {comparedProperties.map((property) => (
              <td key={property.id} className="p-4 capitalize">
                {property.tenure}
              </td>
            ))}
          </tr>

          {/* Date Added */}
          <tr className="border-t border-banc-dark/15">
            <td className="p-4 text-sm font-medium text-banc-muted-readable">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Listed
              </span>
            </td>
            {comparedProperties.map((property) => (
              <td key={property.id} className="p-4">
                {new Date(property.dateAdded).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            ))}
          </tr>

          {/* Tags */}
          <tr className="border-t border-banc-dark/15">
            <td className="p-4 text-sm font-medium text-banc-muted-readable align-top">Features</td>
            {comparedProperties.map((property) => (
              <td key={property.id} className="p-4">
                <div className="flex flex-wrap gap-1">
                  {property.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[var(--radius-sm)] border border-banc-line px-2 py-0.5 text-xs text-banc-dark-deep"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
            ))}
          </tr>

          {/* Actions */}
          <tr className="border-t border-banc-dark/15">
            <td className="p-4"></td>
            {comparedProperties.map((property) => (
              <td key={property.id} className="p-4">
                <Link href={`/sales/properties/${property.id}`} className={cn(actionSecondary, "sm:w-full")}>
                  View Property
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Contact About All */}
      <div className="sticky left-0 border-t border-banc-dark/15 p-4 sm:p-6">
        <p className="mb-4 text-banc-muted-readable">
          Interested in these properties? Contact us about all {comparedProperties.length} properties
        </p>
        <Link href="/contact" className={actionSecondary}>
          <MapPin className="h-4 w-4" />
          Contact About These
        </Link>
      </div>
    </div>
  );
}
