"use client";

import { useState, useMemo, FormEvent } from "react";
import {
  Search,
  MapPin,
  Home,
  Bed,
  Bath,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Calculator,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { z } from "zod";

// Validation schema for manual valuation form
const manualValuationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter the property address"),
  postcode: z.string().min(5, "Please enter a valid postcode"),
  propertyType: z.string().optional(),
  bedrooms: z.string().optional(),
  timeframe: z.string().optional(),
  message: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to be contacted",
  }),
});

type ManualValuationFormData = z.infer<typeof manualValuationSchema>;

interface ValuationToolProps {
  className?: string;
  compact?: boolean;
}

type PropertyType = "detached" | "semi-detached" | "terrace" | "flat" | "bungalow";

// Mock address data for demo
const mockAddresses: Record<string, string[]> = {
  "EN6 4HU": ["1 Station Road", "2 Station Road", "3 Station Road", "4 Station Road"],
  "EN6 4HX": ["10 Maynard Place", "12 Maynard Place", "14 Maynard Place"],
  "EN6 4HY": ["1 The Ridgeway", "3 The Ridgeway", "5 The Ridgeway"],
};

// Mock valuation data
const generateMockValuation = (postcode: string, propertyType: PropertyType, beds: number) => {
  const baseValues: Record<PropertyType, number> = {
    detached: 800000,
    "semi-detached": 600000,
    terrace: 450000,
    flat: 300000,
    bungalow: 550000,
  };

  const bedMultiplier = 1 + (beds - 3) * 0.15;
  const postcodeMultiplier = postcode.startsWith("EN6") ? 1.2 : 1.0;
  
  const baseValue = baseValues[propertyType] * bedMultiplier * postcodeMultiplier;
  const variance = baseValue * 0.1;

  return {
    low: Math.round(baseValue - variance),
    estimate: Math.round(baseValue),
    high: Math.round(baseValue + variance),
    confidence: Math.random() > 0.5 ? "high" : "medium",
    trend: Math.random() > 0.3 ? "up" : "down",
    trendPercent: Math.round(Math.random() * 5 * 10) / 10,
    lastSold: {
      price: Math.round(baseValue * (0.85 + Math.random() * 0.1)),
      date: `${Math.floor(Math.random() * 5) + 2018}`,
    },
  };
};

// Mock comparable sales
const generateMockComparables = (postcode: string, propertyType: PropertyType, beds: number) => {
  const comparables = [
    {
      address: `${Math.floor(Math.random() * 50) + 1} ${postcode === "EN6 4HU" ? "The Broadway" : "Station Road"}`,
      price: Math.round(500000 + Math.random() * 300000),
      date: `${Math.floor(Math.random() * 12) + 1}/${2023 + Math.floor(Math.random() * 2)}`,
      beds,
      type: propertyType,
      distance: "0.2 miles",
    },
    {
      address: `${Math.floor(Math.random() * 50) + 1} ${postcode === "EN6 4HU" ? "Maynard Place" : "The Ridgeway"}`,
      price: Math.round(480000 + Math.random() * 320000),
      date: `${Math.floor(Math.random() * 12) + 1}/${2023 + Math.floor(Math.random() * 2)}`,
      beds: beds + (Math.random() > 0.5 ? 1 : -1),
      type: propertyType,
      distance: "0.4 miles",
    },
    {
      address: `${Math.floor(Math.random() * 50) + 1} ${postcode === "EN6 4HU" ? "The Walk" : "Cuffley Hill"}`,
      price: Math.round(520000 + Math.random() * 280000),
      date: `${Math.floor(Math.random() * 12) + 1}/${2023 + Math.floor(Math.random() * 2)}`,
      beds,
      type: propertyType,
      distance: "0.6 miles",
    },
  ];
  return comparables.sort(() => Math.random() - 0.5);
};

export function ValuationTool({ className, compact = false }: ValuationToolProps) {
  const { success, error } = useToast();
  const [postcode, setPostcode] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("semi-detached");
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Manual valuation form state
  const [formData, setFormData] = useState<ManualValuationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postcode: "",
    propertyType: "",
    bedrooms: "",
    timeframe: "",
    message: "",
    consent: false,
  });

  const valuation = useMemo(() => {
    if (!showResults) return null;
    return generateMockValuation(postcode, propertyType, beds);
  }, [showResults, postcode, propertyType, beds]);

  const comparables = useMemo(() => {
    if (!showResults) return [];
    return generateMockComparables(postcode, propertyType, beds);
  }, [showResults, postcode, propertyType, beds]);

  // Handle manual form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle manual valuation form submission
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Validate form data
      const result = manualValuationSchema.safeParse(formData);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
        setIsSubmitting(false);
        return;
      }

      // Submit to API
      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
        success("Thank you! Your valuation request has been submitted successfully.");
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          postcode: "",
          propertyType: "",
          bedrooms: "",
          timeframe: "",
          message: "",
          consent: false,
        });
      } else {
        error(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      error("Failed to submit request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostcodeSearch = async () => {
    if (!postcode) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Use mock addresses or generate random ones
    const mockAddrs = mockAddresses[postcode.toUpperCase()] || [
      "1 Example Street",
      "2 Example Street",
      "3 Example Street",
    ];
    setAddresses(mockAddrs);
    setIsLoading(false);
  };

  const handleValuation = async () => {
    if (!selectedAddress) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setShowResults(true);
    setIsLoading(false);
  };

  if (compact) {
    return (
      <div className={cn("rounded-xl border border-white/10 bg-banc-dark-deep p-4", className)}>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/60">Postcode</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="e.g. EN6 4HU"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm uppercase text-white placeholder:text-white/30 focus:border-banc-sky focus:outline-none"
              />
              <button
                type="button"
                onClick={handlePostcodeSearch}
                disabled={isLoading || !postcode}
                aria-label="Search postcode"
                className="rounded-lg bg-banc-sky px-3 py-2 text-white hover:bg-banc-sky-dark disabled:opacity-50"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {addresses.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs text-white/60">Select Address</label>
              <select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-banc-sky focus:outline-none"
              >
                <option value="">Choose address...</option>
                {addresses.map((addr) => (
                  <option key={addr} value={addr}>
                    {addr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showResults && valuation && (
            <div className="rounded-lg bg-banc-sky/10 p-3 text-center">
              <p className="text-xs text-white/60">Estimated Value</p>
              <p className="text-lg font-semibold text-banc-sky">
                {formatCurrency(valuation.estimate)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Input Section */}
      <div className="rounded-2xl border border-white/10 bg-banc-dark-deep p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Calculator className="h-5 w-5 text-banc-sky" />
          Property Details
        </h3>

        <div className="grid gap-6">
          {/* Postcode Search */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
              <MapPin className="h-4 w-4" />
              Postcode
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                placeholder="e.g. EN6 4HU"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg uppercase text-white placeholder:text-white/30 focus:border-banc-sky focus:outline-none"
              />
              <button
                onClick={handlePostcodeSearch}
                disabled={isLoading || !postcode}
                className="flex items-center gap-2 rounded-xl bg-banc-sky px-6 py-3 font-medium text-white transition-colors hover:bg-banc-sky-dark disabled:opacity-50"
              >
                <Search className="h-5 w-5" />
                Find
              </button>
            </div>
          </div>

          {/* Address Selection */}
          {addresses.length > 0 && (
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
                <Home className="h-4 w-4" />
                Select Address
              </label>
              <select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-banc-sky focus:outline-none"
              >
                <option value="">Choose an address...</option>
                {addresses.map((addr) => (
                  <option key={addr} value={addr}>
                    {addr}, {postcode}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Property Type */}
          <div>
            <label className="mb-2 block text-sm text-white/70">Property Type</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                { value: "detached", label: "Detached" },
                { value: "semi-detached", label: "Semi-Detached" },
                { value: "terrace", label: "Terrace" },
                { value: "flat", label: "Flat" },
                { value: "bungalow", label: "Bungalow" },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setPropertyType(type.value as PropertyType)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm transition-all",
                    propertyType === type.value
                      ? "border-banc-sky bg-banc-sky/10 text-banc-sky"
                      : "border-white/10 text-white/70 hover:border-white/20"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Beds & Baths */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
                <Bed className="h-4 w-4" />
                Bedrooms
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBeds(num)}
                    className={cn(
                      "h-12 w-12 rounded-xl border text-lg font-medium transition-all",
                      beds === num
                        ? "border-banc-sky bg-banc-sky/10 text-banc-sky"
                        : "border-white/10 text-white/70 hover:border-white/20"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
                <Bath className="h-4 w-4" />
                Bathrooms
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBaths(num)}
                    className={cn(
                      "h-12 w-12 rounded-xl border text-lg font-medium transition-all",
                      baths === num
                        ? "border-banc-sky bg-banc-sky/10 text-banc-sky"
                        : "border-white/10 text-white/70 hover:border-white/20"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {selectedAddress && (
            <button
              onClick={handleValuation}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-banc-sky py-4 text-lg font-medium text-white transition-colors hover:bg-banc-sky-dark disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5" />
                  Get Instant Valuation
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {showResults && valuation && (
        <>
          {/* Main Valuation */}
          <div className="rounded-2xl bg-gradient-to-br from-banc-sky/20 to-banc-sky/5 p-6 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              {valuation.confidence === "high" ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  valuation.confidence === "high" ? "text-green-400" : "text-yellow-400"
                )}
              >
                {valuation.confidence === "high" ? "High Confidence" : "Medium Confidence"}
              </span>
            </div>
            <p className="text-white/70">Estimated Value Range</p>
            <p className="my-2 text-4xl font-bold text-banc-sky">
              {formatCurrency(valuation.low)} - {formatCurrency(valuation.high)}
            </p>
            <p className="text-2xl font-semibold text-white">
              Mid: {formatCurrency(valuation.estimate)}
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-banc-dark-deep p-5 text-center">
              <p className="text-sm text-white/60">Market Trend</p>
              <div className="my-2 flex items-center justify-center gap-2">
                {valuation.trend === "up" ? (
                  <TrendingUp className="h-6 w-6 text-green-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-400" />
                )}
                <span
                  className={cn(
                    "text-2xl font-bold",
                    valuation.trend === "up" ? "text-green-400" : "text-red-400"
                  )}
                >
                  {valuation.trend === "up" ? "+" : "-"}
                  {valuation.trendPercent}%
                </span>
              </div>
              <p className="text-xs text-white/40">Last 12 months</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-banc-dark-deep p-5 text-center">
              <p className="text-sm text-white/60">Last Sold</p>
              <p className="my-2 text-2xl font-bold text-white">
                {formatCurrency(valuation.lastSold.price)}
              </p>
              <p className="text-xs text-white/40">{valuation.lastSold.date}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-banc-dark-deep p-5 text-center">
              <p className="text-sm text-white/60">Value Change</p>
              <p className="my-2 text-2xl font-bold text-banc-sky">
                +
                {formatCurrency(valuation.estimate - valuation.lastSold.price)}
              </p>
              <p className="text-xs text-white/40">Since last sale</p>
            </div>
          </div>

          {/* Comparable Sales */}
          <div className="rounded-2xl border border-white/10 bg-banc-dark-deep p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Comparable Sales Nearby</h3>
            <div className="space-y-3">
              {comparables.map((comp, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div>
                    <p className="font-medium text-white">{comp.address}</p>
                    <p className="text-sm text-white/50">
                      {comp.beds} bed {comp.type} • Sold {comp.date} • {comp.distance}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-banc-sky">{formatCurrency(comp.price)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Market Trend Graph Placeholder */}
          <div className="rounded-2xl border border-white/10 bg-banc-dark-deep p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Local Market Trends</h3>
            <div className="h-48 rounded-xl bg-white/5 p-4">
              {/* Placeholder for actual chart */}
              <div className="flex h-full items-end justify-between gap-2">
                {[40, 45, 42, 48, 52, 55, 58, 60, 65, 68, 72, 75].map((height, i) => (
                  <div
                    key={i}
                    className="relative flex-1 rounded-t bg-gradient-to-t from-banc-sky/50 to-banc-sky transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-white/50">
                      {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-white/40">
              Average sale prices in {postcode} over the last 12 months
            </p>
          </div>

          {/* API Integration Notice */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-start gap-2 text-sm text-white/60">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-banc-sky" />
              <span>
                This is an estimate based on local market data. For an accurate valuation, book a 
                professional appraisal with one of our local property experts.
              </span>
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/valuation">
              <Button className="w-full bg-banc-sky text-white hover:bg-banc-sky-dark sm:w-auto">
                Book Accurate Valuation
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 sm:w-auto"
              >
                Speak to an Expert
              </Button>
            </Link>
          </div>
        </>
      )}

      {/* Manual Valuation Form - Show if no results yet */}
      {!showResults && !isLoading && addresses.length === 0 && !submitSuccess && (
        <div className="rounded-2xl border border-white/10 bg-banc-dark-deep p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Request a Professional Valuation</h3>
          <p className="mb-4 text-sm text-white/60">
            Not finding your address? Request a professional valuation from our team. 
            We&apos;ll arrange a free, no-obligation appraisal at a time that suits you.
          </p>
          <form onSubmit={handleFormSubmit} className="grid gap-4 sm:grid-cols-2">
            {/* First Name */}
            <div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name *"
                className={cn(
                  "w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none",
                  formErrors.firstName 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-white/10 focus:border-banc-sky"
                )}
              />
              {formErrors.firstName && (
                <p className="mt-1 text-xs text-red-400">{formErrors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name *"
                className={cn(
                  "w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none",
                  formErrors.lastName 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-white/10 focus:border-banc-sky"
                )}
              />
              {formErrors.lastName && (
                <p className="mt-1 text-xs text-red-400">{formErrors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address *"
                className={cn(
                  "w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none",
                  formErrors.email 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-white/10 focus:border-banc-sky"
                )}
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number *"
                className={cn(
                  "w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none",
                  formErrors.phone 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-white/10 focus:border-banc-sky"
                )}
              />
              {formErrors.phone && (
                <p className="mt-1 text-xs text-red-400">{formErrors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Property Address *"
                className={cn(
                  "w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none",
                  formErrors.address 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-white/10 focus:border-banc-sky"
                )}
              />
              {formErrors.address && (
                <p className="mt-1 text-xs text-red-400">{formErrors.address}</p>
              )}
            </div>

            {/* Postcode */}
            <div>
              <input
                type="text"
                name="postcode"
                value={formData.postcode}
                onChange={handleInputChange}
                placeholder="Postcode *"
                className={cn(
                  "w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none uppercase",
                  formErrors.postcode 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-white/10 focus:border-banc-sky"
                )}
              />
              {formErrors.postcode && (
                <p className="mt-1 text-xs text-red-400">{formErrors.postcode}</p>
              )}
            </div>

            {/* Property Type */}
            <div>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-banc-sky focus:outline-none"
              >
                <option value="" className="bg-banc-dark-deep">Property Type</option>
                <option value="detached" className="bg-banc-dark-deep">Detached</option>
                <option value="semi-detached" className="bg-banc-dark-deep">Semi-Detached</option>
                <option value="terrace" className="bg-banc-dark-deep">Terrace</option>
                <option value="flat" className="bg-banc-dark-deep">Flat</option>
                <option value="bungalow" className="bg-banc-dark-deep">Bungalow</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <select
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-banc-sky focus:outline-none"
              >
                <option value="" className="bg-banc-dark-deep">Number of Bedrooms</option>
                <option value="1" className="bg-banc-dark-deep">1 Bedroom</option>
                <option value="2" className="bg-banc-dark-deep">2 Bedrooms</option>
                <option value="3" className="bg-banc-dark-deep">3 Bedrooms</option>
                <option value="4" className="bg-banc-dark-deep">4 Bedrooms</option>
                <option value="5" className="bg-banc-dark-deep">5 Bedrooms</option>
                <option value="6+" className="bg-banc-dark-deep">6+ Bedrooms</option>
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <select
                name="timeframe"
                value={formData.timeframe}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-banc-sky focus:outline-none"
              >
                <option value="" className="bg-banc-dark-deep">When are you looking to sell?</option>
                <option value="asap" className="bg-banc-dark-deep">As soon as possible</option>
                <option value="1-3months" className="bg-banc-dark-deep">1-3 months</option>
                <option value="3-6months" className="bg-banc-dark-deep">3-6 months</option>
                <option value="6-12months" className="bg-banc-dark-deep">6-12 months</option>
                <option value="just-curious" className="bg-banc-dark-deep">Just curious</option>
              </select>
            </div>

            {/* Message */}
            <div className="sm:col-span-2">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Additional information (optional)"
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-banc-sky focus:outline-none"
              />
            </div>

            {/* Consent Checkbox */}
            <div className="sm:col-span-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  className="mt-1 h-5 w-5 rounded border-white/30 bg-white/5 text-banc-sky focus:ring-banc-sky focus:ring-offset-0"
                />
                <span className="text-sm text-white/60">
                  I agree to be contacted by Banc Property Group regarding my valuation request. 
                  I understand that my data will be processed in accordance with the{" "}
                  <Link href="/privacy" className="text-banc-sky hover:underline">
                    Privacy Policy
                  </Link>
                  . *
                </span>
              </label>
              {formErrors.consent && (
                <p className="mt-1 text-xs text-red-400">{formErrors.consent}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-banc-sky py-4 font-medium text-white transition-colors hover:bg-banc-sky-dark disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Request Valuation"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success State */}
      {submitSuccess && (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-white">Request Submitted!</h3>
          <p className="text-white/60">
            Thank you for your valuation request. One of our property experts will contact you within 24 hours.
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="mt-4 text-sm text-banc-sky hover:underline"
          >
            Submit another request
          </button>
        </div>
      )}
    </div>
  );
}

export default ValuationTool;
