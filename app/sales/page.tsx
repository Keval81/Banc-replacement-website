"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Home, Users, FileText, Search, MapPin, BedDouble, PoundSterling } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SalesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero - Mobile Optimized */}
      <section className="relative bg-[#2C2F33] py-12 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#1DBFDD] lg:mb-3 lg:text-sm">Property Sales</p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl lg:text-5xl">
              Selling Your Property
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70 lg:mt-4 lg:text-lg">
              Achieve the best price for your home with our premium marketing, 
              expert valuations, and dedicated sales team.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 lg:mt-6">
              <Link href="/contact">
                <Button className="bg-[#1DBFDD] px-5 py-5 text-sm text-white hover:bg-[#0E8CAB] active:bg-[#0E8CAB] lg:px-6 lg:py-6 lg:text-base">
                  Request Valuation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sales/properties">
                <Button variant="outline" className="border-white/30 px-5 py-5 text-sm text-white hover:bg-white/10 active:bg-white/10 lg:px-6 lg:py-6 lg:text-base">
                  View Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Property Search Bar - Mobile Optimized */}
      <section className="bg-[#1DBFDD] py-4 lg:py-6">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="rounded-xl bg-white p-3 shadow-lg lg:p-5">
            {/* Mobile: Stacked layout */}
            <div className="flex flex-col gap-3 lg:hidden">
              {/* Search Input */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <Input
                  placeholder="Search by location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-10 text-sm"
                />
              </div>
              
              {/* Price Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <PoundSterling className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <select
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-12 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-8 text-sm"
                  >
                    <option value="">Min Price</option>
                    <option value="150000">£150k</option>
                    <option value="250000">£250k</option>
                    <option value="500000">£500k</option>
                    <option value="750000">£750k</option>
                    <option value="1000000">£1m</option>
                  </select>
                </div>
                <div className="relative">
                  <PoundSterling className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <select
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-12 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-8 text-sm"
                  >
                    <option value="">Max Price</option>
                    <option value="500000">£500k</option>
                    <option value="750000">£750k</option>
                    <option value="1000000">£1m</option>
                    <option value="1500000">£1.5m</option>
                    <option value="2000000">£2m+</option>
                  </select>
                </div>
              </div>
              
              {/* Bedrooms & Search */}
              <div className="grid grid-cols-4 gap-3">
                <div className="relative col-span-3">
                  <BedDouble className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="h-12 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-8 text-sm"
                  >
                    <option value="">Bedrooms</option>
                    <option value="1">1+ beds</option>
                    <option value="2">2+ beds</option>
                    <option value="3">3+ beds</option>
                    <option value="4">4+ beds</option>
                    <option value="5">5+ beds</option>
                  </select>
                </div>
                <Button className="col-span-1 h-12 bg-[#2C2F33] px-0 hover:bg-[#1DBFDD]">
                  <Search className="mx-auto h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden gap-3 lg:grid lg:grid-cols-5">
              {/* Search Input */}
              <div className="relative lg:col-span-2">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <Input
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-10"
                />
              </div>
              
              {/* Min Price */}
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <select
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-12 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-4 text-sm"
                >
                  <option value="">Min Price</option>
                  <option value="150000">£150,000</option>
                  <option value="250000">£250,000</option>
                  <option value="500000">£500,000</option>
                  <option value="750000">£750,000</option>
                  <option value="1000000">£1,000,000</option>
                </select>
              </div>
              
              {/* Max Price */}
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-12 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-4 text-sm"
                >
                  <option value="">Max Price</option>
                  <option value="500000">£500,000</option>
                  <option value="750000">£750,000</option>
                  <option value="1000000">£1,000,000</option>
                  <option value="1500000">£1,500,000</option>
                  <option value="2000000">£2,000,000+</option>
                </select>
              </div>
              
              {/* Bedrooms & Search Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <BedDouble className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="h-12 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-4 text-sm"
                  >
                    <option value="">Beds</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <Button className="h-12 w-12 bg-[#2C2F33] p-0 hover:bg-[#1DBFDD]">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - Mobile Optimized */}
      <section className="py-10 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <Link href="/sales/properties" className="group">
              <div className="rounded-2xl border border-[#E5E7EB] p-5 transition-all active:bg-[#F9FAFB] lg:p-8 lg:hover:border-[#1DBFDD] lg:hover:shadow-lg">
                <Home className="h-7 w-7 text-[#1DBFDD] lg:h-10 lg:w-10" />
                <h3 className="mt-3 text-base font-semibold lg:mt-4 lg:text-xl">Our Properties</h3>
                <p className="mt-1 text-sm text-[#6B7280] lg:mt-2">
                  Browse our portfolio of premium properties for sale.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-[#1DBFDD] lg:mt-4">
                  View Properties <ArrowRight className="ml-1 h-4 w-4 transition-transform group-active:translate-x-1 lg:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            <Link href="/sales/buyers-guide" className="group">
              <div className="rounded-2xl border border-[#E5E7EB] p-5 transition-all active:bg-[#F9FAFB] lg:p-8 lg:hover:border-[#1DBFDD] lg:hover:shadow-lg">
                <Users className="h-7 w-7 text-[#1DBFDD] lg:h-10 lg:w-10" />
                <h3 className="mt-3 text-base font-semibold lg:mt-4 lg:text-xl">Buyers Guide</h3>
                <p className="mt-1 text-sm text-[#6B7280] lg:mt-2">
                  Everything you need to know about buying a property.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-[#1DBFDD] lg:mt-4">
                  Read Guide <ArrowRight className="ml-1 h-4 w-4 transition-transform group-active:translate-x-1 lg:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            <Link href="/sales/sellers-guide" className="group sm:col-span-2 lg:col-span-1">
              <div className="rounded-2xl border border-[#E5E7EB] p-5 transition-all active:bg-[#F9FAFB] lg:p-8 lg:hover:border-[#1DBFDD] lg:hover:shadow-lg">
                <FileText className="h-7 w-7 text-[#1DBFDD] lg:h-10 lg:w-10" />
                <h3 className="mt-3 text-base font-semibold lg:mt-4 lg:text-xl">Sellers Guide</h3>
                <p className="mt-1 text-sm text-[#6B7280] lg:mt-2">
                  Expert advice on preparing and selling your home.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-[#1DBFDD] lg:mt-4">
                  Read Guide <ArrowRight className="ml-1 h-4 w-4 transition-transform group-active:translate-x-1 lg:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#F9FAFB] py-10 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="mb-6 text-center lg:mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-[#1DBFDD] lg:text-sm">Why Banc</p>
            <h2 className="mt-2 text-xl font-semibold lg:mt-3 lg:text-4xl">The Banc Sales Advantage</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {[
              { title: "Local Expertise", desc: "Deep knowledge of Cuffley, Mayfair and surrounding areas" },
              { title: "Premium Marketing", desc: "Professional photography, video tours, and targeted advertising" },
              { title: "Qualified Buyers", desc: "Access to our database of pre-qualified, serious buyers" },
              { title: "Dedicated Support", desc: "Personal agent from valuation through to completion" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-white p-4 text-center lg:p-6">
                <h3 className="text-sm font-semibold lg:text-base">{item.title}</h3>
                <p className="mt-1 text-xs text-[#6B7280] lg:mt-2 lg:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1DBFDD] py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-10">
          <h2 className="text-xl font-semibold text-white lg:text-4xl">
            Ready to sell your property?
          </h2>
          <p className="mt-2 text-sm text-white/90 lg:mt-3 lg:text-lg">
            Get a free, no-obligation valuation from our expert team.
          </p>
          <Link href="/contact">
            <Button className="mt-5 bg-white px-6 py-5 text-sm text-[#1DBFDD] hover:bg-white/90 active:bg-white/90 lg:mt-6 lg:px-8 lg:py-6 lg:text-base">
              Book Your Valuation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
