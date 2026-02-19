"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  Home, 
  Calculator, 
  BookOpen, 
  Key, 
  PoundSterling, 
  TrendingUp,
  Sparkles,
  MapPin,
  BedDouble,
  Search
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const serviceCards = [
  {
    title: "Properties",
    description: "Find your next property here.",
    href: "/lettings/properties",
    icon: Home,
  },
  {
    title: "Property Valuation",
    description: "Find out how much your property could be worth.",
    href: "/contact",
    icon: Calculator,
  },
  {
    title: "Tenants Guide",
    description: "Read our brief guide to the letting process.",
    href: "/lettings/tenants-guide",
    icon: BookOpen,
  },
  {
    title: "Landlords Guide",
    description: "Read our guide to letting a property.",
    href: "/lettings/landlords-guide",
    icon: Key,
  },
  {
    title: "Fees",
    description: "Find out more about our fees",
    href: "/lettings/fees",
    icon: PoundSterling,
  },
  {
    title: "Yield Calculator",
    description: "Find out your gross rental yield.",
    href: "/lettings/yield-calculator",
    icon: TrendingUp,
  },
];

const landlordBenefits = [
  "Free rental valuation",
  "Marketing on major portals",
  "Tenant referencing & checks",
  "Rent collection & management",
];

const tenantBenefits = [
  "Wide selection of properties",
  "Online property search",
  "Responsive maintenance support",
  "Clear, transparent fees",
];

export default function LettingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero - Mobile Optimized */}
      <section className="relative bg-[#2C2F33] py-16 lg:py-24 overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#1DBFDD]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#1DBFDD]/5 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 lg:px-10">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 lg:mb-6">
            <Sparkles className="h-4 w-4 text-[#1DBFDD]" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#1DBFDD] lg:text-sm">
              Property Lettings
            </span>
          </div>
          
          <h1 className="text-2xl font-semibold text-white sm:text-3xl lg:text-5xl">
            Lettings
          </h1>
          
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            Whether you are a landlord seeking quality tenants or a tenant 
            searching for your perfect home, we provide exceptional service 
            tailored to your needs.
          </p>
          
          {/* Quick stats */}
          <div className="mt-6 flex flex-wrap gap-6 lg:mt-10 lg:gap-8">
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-[#1DBFDD] lg:text-3xl">500+</span>
              <span className="text-xs text-white/50 lg:text-sm">Properties Managed</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-[#1DBFDD] lg:text-3xl">98%</span>
              <span className="text-xs text-white/50 lg:text-sm">Tenant Satisfaction</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-[#1DBFDD] lg:text-3xl">15+</span>
              <span className="text-xs text-white/50 lg:text-sm">Years Experience</span>
            </div>
          </div>
        </div>
      </section>

      {/* Property Search Bar - NEW */}
      <section className="bg-[#1DBFDD] py-6 lg:py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="rounded-xl bg-white p-4 shadow-lg lg:p-6">
            <div className="grid gap-4 lg:grid-cols-5 lg:gap-3">
              {/* Search Input */}
              <div className="relative lg:col-span-2">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <Input
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              
              {/* Min Price */}
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <select
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full h-12 rounded-md border border-input bg-background px-10 text-sm"
                >
                  <option value="">Min Price</option>
                  <option value="500">£500 pcm</option>
                  <option value="1000">£1,000 pcm</option>
                  <option value="1500">£1,500 pcm</option>
                  <option value="2000">£2,000 pcm</option>
                  <option value="3000">£3,000 pcm</option>
                </select>
              </div>
              
              {/* Max Price */}
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full h-12 rounded-md border border-input bg-background px-10 text-sm"
                >
                  <option value="">Max Price</option>
                  <option value="1000">£1,000 pcm</option>
                  <option value="1500">£1,500 pcm</option>
                  <option value="2000">£2,000 pcm</option>
                  <option value="3000">£3,000 pcm</option>
                  <option value="5000">£5,000+ pcm</option>
                </select>
              </div>
              
              {/* Bedrooms & Search Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <BedDouble className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full h-12 rounded-md border border-input bg-background px-10 text-sm"
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
      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          {/* Section Header */}
          <div className="mb-8 text-center lg:mb-12">
            <span className="inline-block rounded-full bg-[#1DBFDD]/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-[#1DBFDD]">
              Our Services
            </span>
            <h2 className="mt-3 text-2xl font-semibold lg:text-4xl">
              Lettings Services
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-[#6B7280] lg:text-base">
              Comprehensive letting solutions designed to meet the needs of both landlords and tenants.
            </p>
          </div>
          
          {/* Service Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {serviceCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Link 
                  key={card.title} 
                  href={card.href}
                  className="group block rounded-2xl border border-[#E5E7EB] bg-white p-6 transition-all hover:border-[#1DBFDD] hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#1DBFDD]/10 text-[#1DBFDD] transition-all group-hover:bg-[#1DBFDD] group-hover:text-white">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-lg font-semibold transition-colors group-hover:text-[#1DBFDD]">
                    {card.title}
                  </h3>
                  
                  <p className="mt-2 text-sm text-[#6B7280]">
                    {card.description}
                  </p>
                  
                  <span className="mt-4 inline-flex items-center text-sm text-[#1DBFDD]">
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Landlord & Tenant Split Section */}
      <section className="py-12 lg:py-20 bg-[#2C2F33]">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          {/* Section Header */}
          <div className="mb-8 text-center lg:mb-12">
            <span className="inline-block rounded-full bg-[#1DBFDD]/20 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-[#1DBFDD]">
              Who We Serve
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-white lg:text-4xl">
              Tailored Solutions
            </h2>
          </div>
          
          {/* Split Cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Landlords Card */}
            <div className="rounded-2xl bg-[#3A3D42] p-6 lg:p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#1DBFDD]/20 text-[#1DBFDD]">
                <Key className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-semibold text-white lg:text-2xl">
                For Landlords
              </h3>
              
              <p className="mt-3 text-sm leading-relaxed text-white/70 lg:text-base">
                Maximise your rental income with our comprehensive property management 
                services. From tenant find to full management, we handle everything.
              </p>
              
              <ul className="mt-6 space-y-3">
                {landlordBenefits.map((item) => (
                  <li key={item} className="flex items-center text-sm text-white/80">
                    <span className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#1DBFDD]/20 text-[#1DBFDD]">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/lettings/landlords-guide"
                className="mt-6 inline-flex items-center rounded-lg bg-[#1DBFDD] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0E8CAB]"
              >
                Landlords Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Tenants Card */}
            <div className="rounded-2xl bg-[#3A3D42] p-6 lg:p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#1DBFDD]/20 text-[#1DBFDD]">
                <BookOpen className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-semibold text-white lg:text-2xl">
                For Tenants
              </h3>
              
              <p className="mt-3 text-sm leading-relaxed text-white/70 lg:text-base">
                Find your perfect rental home with Banc. We offer a wide range of 
                quality properties and provide support throughout your tenancy.
              </p>
              
              <ul className="mt-6 space-y-3">
                {tenantBenefits.map((item) => (
                  <li key={item} className="flex items-center text-sm text-white/80">
                    <span className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#1DBFDD]/20 text-[#1DBFDD]">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/lettings/tenants-guide"
                className="mt-6 inline-flex items-center rounded-lg bg-[#1DBFDD] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0E8CAB]"
              >
                Tenants Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="relative overflow-hidden bg-[#1DBFDD] py-12 lg:py-16">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-10">
          <h2 className="text-2xl font-semibold text-white lg:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/90 lg:text-lg">
            Contact our lettings team today for expert advice and assistance.
          </p>
          <Link 
            href="/contact"
            className="mt-6 inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#1DBFDD] transition-all hover:bg-white/90 lg:px-8 lg:py-4 lg:text-base"
          >
            Contact Us
            <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
