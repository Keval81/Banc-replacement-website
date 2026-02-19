import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
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

export const metadata: Metadata = {
  title: "Lettings | Banc Property Services",
  description: "Premium letting services for landlords and tenants across Cuffley, Mayfair and beyond. Property management, tenant finding, and expert advice.",
};

interface ServiceCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const serviceCards: ServiceCard[] = [
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

export default function LettingsPage(): ReactNode {
  return (
    <div className="min-h-screen bg-off-white text-charcoal">
      <Header />
      
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-charcoal">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-dark-grey to-charcoal" />
          
          {/* Subtle pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(29, 191, 221, 0.5) 1px, transparent 0)`,
              backgroundSize: '48px 48px'
            }}
          />
          
          {/* Decorative glow */}
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-cyan/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary-cyan/5 blur-3xl" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex min-h-[420px] flex-col justify-center py-20 lg:py-28">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 self-start">
              <Sparkles className="h-4 w-4 text-primary-cyan" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary-cyan">
                Property Lettings
              </span>
            </div>
            
            {/* Title */}
            <h1 className="font-heading text-5xl font-semibold text-white sm:text-6xl lg:text-7xl">
              Lettings
            </h1>
            
            {/* Description */}
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 lg:text-xl">
              Whether you are a landlord seeking quality tenants or a tenant 
              searching for your perfect home, we provide exceptional service 
              tailored to your needs.
            </p>
            
            {/* Quick stats */}
            <div className="mt-10 flex flex-wrap gap-8">
              <div className="flex flex-col">
                <span className="font-heading text-3xl font-semibold text-primary-cyan">500+</span>
                <span className="text-sm text-white/50">Properties Managed</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-3xl font-semibold text-primary-cyan">98%</span>
                <span className="text-sm text-white/50">Tenant Satisfaction</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-3xl font-semibold text-primary-cyan">15+</span>
                <span className="text-sm text-white/50">Years Experience</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-off-white to-transparent" />
      </section>

      {/* Services Grid Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Section Header */}
          <div className="mb-14 text-center">
            <span className="inline-block rounded-full bg-primary-cyan/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary-cyan">
              Our Services
            </span>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-charcoal sm:text-4xl lg:text-5xl">
              Lettings Services
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-mid-grey">
              Comprehensive letting solutions designed to meet the needs of both landlords and tenants.
            </p>
          </div>
          
          {/* Service Cards Grid - 3x2 */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Link 
                  key={card.title} 
                  href={card.href}
                  className="group relative block overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl"
                >
                  {/* Animated gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  
                  {/* Top accent bar with animation */}
                  <div className="absolute left-0 top-0 h-1 w-0 bg-gradient-to-r from-primary-cyan to-light-cyan transition-all duration-500 ease-out group-hover:w-full" />
                  
                  {/* Content container */}
                  <div className="relative p-8">
                    {/* Icon with animated container */}
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-cyan/10 to-primary-cyan/5 text-primary-cyan transition-all duration-500 ease-out group-hover:scale-110 group-hover:bg-primary-cyan group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary-cyan/25">
                      <IconComponent className="h-8 w-8 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-heading text-xl font-semibold text-charcoal transition-colors duration-300 group-hover:text-primary-cyan">
                      {card.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="mt-3 leading-relaxed text-mid-grey">
                      {card.description}
                    </p>
                    
                    {/* Animated link indicator */}
                    <div className="mt-6 flex items-center text-sm font-semibold text-primary-cyan">
                      <span className="mr-2 transition-transform duration-300 group-hover:translate-x-1">
                        Learn more
                      </span>
                      <ArrowRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-2" />
                    </div>
                  </div>
                  
                  {/* Corner decoration */}
                  <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-primary-cyan/5 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Landlord & Tenant Split Section */}
      <section className="py-20 lg:py-28 bg-charcoal">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Section Header */}
          <div className="mb-14 text-center">
            <span className="inline-block rounded-full bg-primary-cyan/20 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary-cyan">
              Who We Serve
            </span>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Tailored Solutions
            </h2>
          </div>
          
          {/* Split Cards */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Landlords Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-dark-grey p-8 lg:p-10">
              {/* Background glow */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-cyan/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
              
              <div className="relative">
                {/* Icon */}
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-cyan/20 text-primary-cyan transition-all duration-300 group-hover:bg-primary-cyan group-hover:text-white">
                  <Key className="h-7 w-7" />
                </div>
                
                <h3 className="font-heading text-2xl font-semibold text-white lg:text-3xl">
                  For Landlords
                </h3>
                
                <p className="mt-4 leading-relaxed text-white/70">
                  Maximise your rental income with our comprehensive property management 
                  services. From tenant find to full management, we handle everything 
                  so you don&apos;t have to worry.
                </p>
                
                {/* Benefits list */}
                <ul className="mt-8 space-y-4">
                  {landlordBenefits.map((item) => (
                    <li key={item} className="flex items-center text-white/80">
                      <span className="mr-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-cyan/20 text-primary-cyan">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm lg:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Link 
                  href="/lettings/landlords-guide"
                  className="mt-8 inline-flex items-center rounded-xl bg-primary-cyan px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-dark-cyan hover:shadow-lg hover:shadow-primary-cyan/25"
                >
                  Landlords Guide
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Tenants Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-dark-grey p-8 lg:p-10">
              {/* Background glow */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-cyan/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
              
              <div className="relative">
                {/* Icon */}
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-cyan/20 text-primary-cyan transition-all duration-300 group-hover:bg-primary-cyan group-hover:text-white">
                  <BookOpen className="h-7 w-7" />
                </div>
                
                <h3 className="font-heading text-2xl font-semibold text-white lg:text-3xl">
                  For Tenants
                </h3>
                
                <p className="mt-4 leading-relaxed text-white/70">
                  Find your perfect rental home with Banc. We offer a wide range of 
                  quality properties and provide support throughout your tenancy 
                  journey.
                </p>
                
                {/* Benefits list */}
                <ul className="mt-8 space-y-4">
                  {tenantBenefits.map((item) => (
                    <li key={item} className="flex items-center text-white/80">
                      <span className="mr-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-cyan/20 text-primary-cyan">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm lg:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Link 
                  href="/lettings/tenants-guide"
                  className="mt-8 inline-flex items-center rounded-xl bg-primary-cyan px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-dark-cyan hover:shadow-lg hover:shadow-primary-cyan/25"
                >
                  Tenants Guide
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="relative overflow-hidden bg-primary-cyan py-20">
        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="font-heading text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Contact our lettings team today for expert advice and assistance. 
            We&apos;re here to help you every step of the way.
          </p>
          <Link 
            href="/contact"
            className="mt-8 inline-flex items-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-primary-cyan transition-all duration-300 hover:bg-white/90 hover:shadow-xl hover:shadow-black/10"
          >
            Contact Us
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
