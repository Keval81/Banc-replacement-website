"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimaryOnDark,
  actionSecondaryOnDark,
  eyebrow,
  eyebrowOnDark,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Home,
  Calculator,
  BookOpen,
  Key,
  PoundSterling,
  TrendingUp,
  Check,
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
    href: "/tools/yield-calculator",
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

      <PageBand
        eyebrow="Property Lettings"
        title="Lettings"
        lede="Whether you are a landlord seeking quality tenants or a tenant searching for your perfect home, we provide exceptional service tailored to your needs."
        image={{
          src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      >
        <LettingsPropertySearch variant="hero" />

        {/* Quick facts — memberships evidenced on our fee schedule */}
        <div className="mt-8 grid border-t border-white/15 sm:grid-cols-3 sm:gap-x-8">
          {[
            { value: "CMP", label: "Client Money Protected" },
            { value: "TPO", label: "Property Ombudsman Member" },
            { value: "Guild", label: "Approved Agent" },
          ].map((fact) => (
            <div key={fact.value} className="flex items-baseline justify-between gap-4 border-b border-white/15 py-4 sm:block sm:border-b-0">
              <p className="font-display text-2xl font-light text-white lg:text-3xl">{fact.value}</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/70 sm:mt-1">{fact.label}</p>
            </div>
          ))}
        </div>
      </PageBand>

      {/* Services */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>Our Services</p>
          <h2 className={cn(sectionHeading, "mt-3")}>Lettings Services</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-banc-muted-readable">
            Comprehensive letting solutions designed to meet the needs of both landlords and tenants.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {serviceCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="block rounded-[var(--radius-md)] border border-banc-line bg-white p-5 transition-colors duration-200 hover:border-banc-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 lg:p-6"
                >
                  <IconComponent className="h-6 w-6 text-banc-focus" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-banc-dark-deep">{card.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-banc-muted-readable">
                    {card.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-banc-focus">
                    Learn more
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Landlord & Tenant Split Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrowOnDark}>Who We Serve</p>
          <h2 className={cn(sectionHeadingOnDark, "mt-3")}>Tailored Solutions</h2>

          <div className="mt-7 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="border-t border-white/15 pt-6">
              <h3 className="font-display text-2xl font-light text-white">For Landlords</h3>
              <p className="mt-3 text-base leading-relaxed text-white/70">
                Maximise your rental income with our comprehensive property management
                services. From tenant find to full management, we handle everything.
              </p>
              <ul className="mt-5">
                {landlordBenefits.map((item) => (
                  <li key={item} className="flex items-center gap-3 border-t border-white/15 py-3 text-sm text-white/80 lg:text-base">
                    <Check className="h-4 w-4 flex-shrink-0 text-[var(--banc-focus-dark)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/lettings/landlords-guide" className={cn(actionSecondaryOnDark, "mt-6")}>
                Landlords Guide
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="border-t border-white/15 pt-6">
              <h3 className="font-display text-2xl font-light text-white">For Tenants</h3>
              <p className="mt-3 text-base leading-relaxed text-white/70">
                Find your perfect rental home with Banc. We offer a wide range of
                quality properties and provide support throughout your tenancy.
              </p>
              <ul className="mt-5">
                {tenantBenefits.map((item) => (
                  <li key={item} className="flex items-center gap-3 border-t border-white/15 py-3 text-sm text-white/80 lg:text-base">
                    <Check className="h-4 w-4 flex-shrink-0 text-[var(--banc-focus-dark)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/lettings/tenants-guide" className={cn(actionSecondaryOnDark, "mt-6")}>
                Tenants Guide
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Closing call to action */}
          <div className="mt-12 border-t border-white/15 pt-10">
            <h2 className={sectionHeadingOnDark}>Ready to get started?</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
              Contact our lettings team today for expert advice and assistance.
            </p>
            <Link href="/contact" className={cn(actionPrimaryOnDark, "mt-7")}>
              Contact Us
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
