"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">No properties selected for comparison</p>
        <Link href="/search">
          <Button className="bg-[#4AC8E8] hover:bg-[#1A9BBF]">
            Browse Properties
          </Button>
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
            <th className="text-left p-4 font-medium text-gray-500 w-32">Feature</th>
            {comparedProperties.map((property) => (
              <th key={property.id} className="p-4 min-w-[200px]">
                <div className="relative">
                  <button
                    onClick={() => removeFromComparison(property.id)}
                    className="absolute -top-2 -right-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-left line-clamp-1">
                    {property.title}
                  </h3>
                  <p className="text-sm text-gray-500 text-left line-clamp-1">
                    {property.address}
                  </p>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Price Row */}
          <tr className="border-t">
            <td className="p-4 text-sm font-medium text-gray-500">Price</td>
            {comparedProperties.map((property) => (
              <td key={property.id} className="p-4">
                <span className="text-xl font-bold text-[#4AC8E8]">
                  {property.price}
                </span>
              </td>
            ))}
          </tr>

          {/* Price per sqft (calculated) */}
          <tr className="border-t bg-gray-50/50">
            <td className="p-4 text-sm font-medium text-gray-500">Price/sqft</td>
            {comparedProperties.map((property) => {
              const priceNum = parseInt(property.price.replace(/[^\d]/g, ""));
              const pricePerSqft = Math.round(priceNum / property.stats.sqft);
              return (
                <td key={property.id} className="p-4">
                  <span className="text-sm text-gray-600">
                    £{pricePerSqft.toLocaleString()}
                  </span>
                </td>
              );
            })}
          </tr>

          {/* Property Type */}
          <tr className="border-t">
            <td className="p-4 text-sm font-medium text-gray-500">
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
            <tr key={key} className="border-t">
              <td className="p-4 text-sm font-medium text-gray-500">
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
                      isBest && "text-[#4AC8E8] font-medium"
                    )}>
                      {property.stats[key]}
                      {isBest && <Check className="w-4 h-4" />}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Tenure */}
          <tr className="border-t">
            <td className="p-4 text-sm font-medium text-gray-500">
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
          <tr className="border-t">
            <td className="p-4 text-sm font-medium text-gray-500">
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
          <tr className="border-t">
            <td className="p-4 text-sm font-medium text-gray-500 align-top">Features</td>
            {comparedProperties.map((property) => (
              <td key={property.id} className="p-4">
                <div className="flex flex-wrap gap-1">
                  {property.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-gray-100 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
            ))}
          </tr>

          {/* Actions */}
          <tr className="border-t">
            <td className="p-4"></td>
            {comparedProperties.map((property) => (
              <td key={property.id} className="p-4">
                <Link href={`/sales/properties/${property.id}`}>
                  <Button className="w-full bg-[#4AC8E8] hover:bg-[#1A9BBF]">
                    View Property
                  </Button>
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Contact About All */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 mb-4">
          Interested in these properties? Contact us about all {comparedProperties.length} properties
        </p>
        <Link href="/contact">
          <Button
            variant="outline"
            className="border-[#4AC8E8] text-[#4AC8E8] hover:bg-[#4AC8E8] hover:text-white"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Contact About These
          </Button>
        </Link>
      </div>
    </div>
  );
}
