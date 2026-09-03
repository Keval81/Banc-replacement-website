"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Home, 
  Calculator, 
  BookOpen, 
  Key, 
  PoundSterling, 
  TrendingUp,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import LettingsPropertySearch from "@/app/sections/LettingsPropertySearch";

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
    href: "/valuation",
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
  return (
    <div className="bg-white text-banc-dark">
      <Header />
      
      {/* Hero - Mobile Optimized */}
      <section className="relative bg-banc-dark-deep py-12 lg:py-24 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep/80 via-banc-dark-deep/60 to-banc-dark-deep/40" />
        </div>
        {/* Background glow */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-banc-sky/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-banc-sky/5 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 lg:px-10">
          {/* Badge */}
          <div className="mb-2 inline-flex items-center gap-2 lg:mb-4">
            <Sparkles className="h-3.5 w-3.5 text-banc-sky lg:h-4 lg:w-4" />
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-banc-sky lg:text-sm">
              Property Lettings
            </span>
          </div>
          
          <h1 className="text-2xl font-semibold text-white sm:text-3xl lg:text-5xl">
            Lettings
          </h1>
          
          <p className="mt-3 text-sm leading-relaxed text-white/70 lg:mt-4 lg:text-lg">
            Whether you are a landlord seeking quality tenants or a tenant 
            searching for your perfect home, we provide exceptional service 
            tailored to your needs.
          </p>
          
          {/* Quick facts — memberships evidenced on our fee schedule */}
          <div className="mt-5 flex flex-wrap gap-5 lg:mt-8 lg:gap-8">
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-banc-sky lg:text-3xl">CMP</span>
              <span className="text-xs text-white/50 lg:text-sm">Client Money Protected</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-banc-sky lg:text-3xl">TPO</span>
              <span className="text-xs text-white/50 lg:text-sm">Property Ombudsman Member</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-banc-sky lg:text-3xl">Guild</span>
              <span className="text-xs text-white/50 lg:text-sm">Approved Agent</span>
            </div>
          </div>
        </div>
      </section>

      {/* Property Search Section - Using New Professional Component */}
      <section className="relative z-10 -mt-8 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <LettingsPropertySearch variant="hero" />
        </div>
      </section>

      {/* Services Grid - Mobile Optimized */}
      <section className="py-10 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          {/* Section Header */}
          <div className="mb-6 text-center lg:mb-12">
            <span className="inline-block rounded-full bg-banc-sky/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-banc-focus lg:px-4">
              Our Services
            </span>
            <h2 className="mt-2 text-xl font-semibold lg:mt-3 lg:text-4xl">
              Lettings Services
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-banc-muted-readable lg:mt-3 lg:text-base">
              Comprehensive letting solutions designed to meet the needs of both landlords and tenants.
            </p>
          </div>
          
          {/* Service Cards Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {serviceCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Link 
                  key={card.title} 
                  href={card.href}
                  className="group block rounded-xl border border-banc-line bg-white p-4 transition-all active:bg-banc-grey-pale lg:rounded-2xl lg:p-6 lg:hover:border-banc-sky lg:hover:shadow-lg"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-banc-sky/10 text-banc-focus transition-all lg:mb-4 lg:h-12 lg:w-12 lg:rounded-xl lg:group-hover:bg-banc-sky lg:group-hover:text-white">
                    <IconComponent className="h-5 w-5 lg:h-6 lg:w-6" />
                  </div>
                  
                  <h3 className="text-sm font-semibold lg:text-base">{card.title}</h3>
                  
                  <p className="mt-1 text-xs text-banc-muted-readable lg:mt-2 lg:text-sm">
                    {card.description}
                  </p>
                  
                  <span className="mt-2 inline-flex items-center text-xs text-banc-focus lg:mt-3 lg:text-sm">
                    Learn more
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-active:translate-x-1 lg:group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Landlord & Tenant Split Section */}
      <section className="bg-banc-dark-deep py-10 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          {/* Section Header */}
          <div className="mb-6 text-center lg:mb-12">
            <span className="inline-block rounded-full bg-banc-sky/20 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-banc-sky lg:px-4">
              Who We Serve
            </span>
            <h2 className="mt-2 text-xl font-semibold text-white lg:mt-3 lg:text-4xl">
              Tailored Solutions
            </h2>
          </div>
          
          {/* Split Cards */}
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
            {/* Landlords Card */}
            <div className="rounded-xl bg-banc-dark-mid p-5 lg:rounded-2xl lg:p-8">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-banc-sky/20 text-banc-sky lg:mb-4 lg:h-12 lg:w-12 lg:rounded-xl">
                <Key className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              
              <h3 className="text-lg font-semibold text-white lg:text-2xl">
                For Landlords
              </h3>
              
              <p className="mt-2 text-sm leading-relaxed text-white/70 lg:mt-3 lg:text-base">
                Maximise your rental income with our comprehensive property management 
                services. From tenant find to full management, we handle everything.
              </p>
              
              <ul className="mt-4 space-y-2 lg:mt-6 lg:space-y-3">
                {landlordBenefits.map((item) => (
                  <li key={item} className="flex items-center text-sm text-white/80 lg:text-base">
                    <span className="mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-banc-sky/20 text-banc-sky lg:h-6 lg:w-6">
                      <svg className="h-3 w-3 lg:h-3.5 lg:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/lettings/landlords-guide"
                className="mt-5 inline-flex items-center rounded-lg bg-banc-focus px-4 py-2.5 text-sm font-semibold text-white transition-colors active:bg-banc-sky-dark lg:mt-6 lg:px-5 lg:hover:bg-banc-sky-dark"
              >
                Landlords Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Tenants Card */}
            <div className="rounded-xl bg-banc-dark-mid p-5 lg:rounded-2xl lg:p-8">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-banc-sky/20 text-banc-sky lg:mb-4 lg:h-12 lg:w-12 lg:rounded-xl">
                <BookOpen className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              
              <h3 className="text-lg font-semibold text-white lg:text-2xl">
                For Tenants
              </h3>
              
              <p className="mt-2 text-sm leading-relaxed text-white/70 lg:mt-3 lg:text-base">
                Find your perfect rental home with Banc. We offer a wide range of 
                quality properties and provide support throughout your tenancy.
              </p>
              
              <ul className="mt-4 space-y-2 lg:mt-6 lg:space-y-3">
                {tenantBenefits.map((item) => (
                  <li key={item} className="flex items-center text-sm text-white/80 lg:text-base">
                    <span className="mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-banc-sky/20 text-banc-sky lg:h-6 lg:w-6">
                      <svg className="h-3 w-3 lg:h-3.5 lg:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/lettings/tenants-guide"
                className="mt-5 inline-flex items-center rounded-lg bg-banc-focus px-4 py-2.5 text-sm font-semibold text-white transition-colors active:bg-banc-sky-dark lg:mt-6 lg:px-5 lg:hover:bg-banc-sky-dark"
              >
                Tenants Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="relative overflow-hidden bg-banc-sky py-10 lg:py-16">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-10">
          <h2 className="text-xl font-semibold text-banc-dark-deep lg:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-banc-dark-deep/90 lg:mt-3 lg:text-lg">
            Contact our lettings team today for expert advice and assistance.
          </p>
          <Link 
            href="/contact"
            className="mt-5 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-banc-focus transition-all active:bg-white/90 lg:mt-6 lg:px-8 lg:py-4 lg:text-base lg:hover:bg-white/90"
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
