import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, FileText, Key, CheckCircle, Home, CreditCard, Shield } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tenants Guide | Banc Property Services",
  description: "Everything tenants need to know about renting a property. Expert advice from Banc Property Group to help you find your perfect rental home.",
};

const steps = [
  {
    icon: Search,
    title: "Register & Search",
    description: "Register your details and requirements with us. We'll notify you immediately when suitable properties become available."
  },
  {
    icon: Home,
    title: "View Properties",
    description: "Arrange viewings at convenient times. Our team will show you around and answer any questions about the property and area."
  },
  {
    icon: FileText,
    title: "Application & References",
    description: "Once you find your perfect home, we'll guide you through the application process including credit checks and references."
  },
  {
    icon: Key,
    title: "Move In",
    description: "Complete the paperwork, pay your deposit and first month's rent, and collect the keys to your new home."
  }
];

const costs = [
  { item: "Holding Deposit", amount: "One week's rent", desc: "Required to secure the property (capped at one week's rent)" },
  { item: "Security Deposit", amount: "Five weeks' rent", desc: "Held in a government-approved deposit protection scheme" },
  { item: "First Month's Rent", amount: "One month's rent", desc: "Payable in advance before you move in" },
  { item: "Council Tax", amount: "Variable", desc: "Your responsibility as the tenant" },
  { item: "Utilities", amount: "Variable", desc: "Gas, electricity, water, and broadband" }
];

const tenantResponsibilities = [
  "Pay rent on time as specified in your tenancy agreement",
  "Keep the property clean and in good condition",
  "Report any maintenance issues promptly",
  "Respect neighbours and avoid causing nuisance",
  "Obtain permission before making alterations",
  "Allow access for agreed inspections and repairs"
];

export default function TenantsGuidePage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Guide</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Tenants Guide
            </h1>
            <p className="mt-6 text-lg text-white/70">
              Everything you need to know about renting a property. 
              Let us help you find your perfect rental home.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">The Process</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Renting in Four Steps</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#1DBFDD]/10 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-[#1DBFDD]" />
                </div>
                <div className="mt-4 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1DBFDD] text-white font-semibold text-sm">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-[#6B7280]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Costs */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Costs</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Understanding the Costs</h2>
            <p className="mt-4 text-[#6B7280] max-w-2xl mx-auto">
              It's important to understand all the costs involved in renting a property. 
              Here's a breakdown of what you can expect.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {costs.map((cost, index) => (
                <div key={cost.item} className={`p-6 ${index !== costs.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{cost.item}</h3>
                      <p className="text-[#6B7280] text-sm mt-1">{cost.desc}</p>
                    </div>
                    <span className="text-[#1DBFDD] font-semibold whitespace-nowrap ml-4">{cost.amount}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[#6B7280] text-center">
              Note: Some landlords may include certain bills in the rent. 
              This will be clearly stated in the property listing.
            </p>
          </div>
        </div>
      </section>

      {/* Responsibilities */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Responsibilities</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Tenant Responsibilities</h2>
              <p className="mt-4 text-[#6B7280]">
                As a tenant, you have certain responsibilities to maintain the property 
                and ensure a good relationship with your landlord and neighbours.
              </p>
              <ul className="mt-6 space-y-4">
                {tenantResponsibilities.map((item) => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD] mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-[#6B7280]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-[#2C2F33] p-8 text-white">
              <Shield className="h-12 w-12 text-[#1DBFDD] mb-4" />
              <h3 className="text-xl font-semibold mb-4">Deposit Protection</h3>
              <p className="text-white/70 mb-4">
                Your security deposit is protected in a government-approved scheme. 
                This ensures it's returned to you at the end of your tenancy, provided 
                you meet the terms of your agreement.
              </p>
              <p className="text-white/70">
                We provide you with all the necessary documentation and information 
                about where your deposit is held within 30 days of payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="bg-[#2C2F33] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Advice</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Top Tips for Tenants</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white/5 rounded-2xl p-6">
              <CreditCard className="h-10 w-10 text-[#1DBFDD] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Budget Wisely</h3>
              <p className="text-white/70 text-sm">
                Ensure you can comfortably afford the rent and associated costs. 
                Most landlords require proof that your annual income is at least 30 times the monthly rent.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6">
              <FileText className="h-10 w-10 text-[#1DBFDD] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Read Your Contract</h3>
              <p className="text-white/70 text-sm">
                Carefully review your tenancy agreement before signing. 
                Understand your rights and responsibilities, including notice periods and break clauses.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6">
              <Home className="h-10 w-10 text-[#1DBFDD] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Inspect Everything</h3>
              <p className="text-white/70 text-sm">
                Complete the inventory thoroughly when you move in. 
                Take photos of any existing damage and report issues immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1DBFDD] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to find your rental home?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Browse our available properties or register your requirements.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/lettings/properties">
              <Button className="bg-white text-[#1DBFDD] hover:bg-white/90 px-8 py-6 text-base">
                View Properties
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-base">
              Register with Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
