import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Shield, FileText, CheckCircle, Home, Key, PoundSterling } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Landlords Guide | Banc Property Services",
  description: "Expert advice for landlords on letting your property. Learn how Banc Property Group can help you maximise your rental income and manage your property investment.",
};

const services = [
  {
    icon: Users,
    title: "Tenant Find",
    description: "We find and reference quality tenants for your property. You maintain full control of the tenancy thereafter.",
    features: ["Marketing on major portals", "Accompanied viewings", "Full referencing", "Tenancy setup"]
  },
  {
    icon: Shield,
    title: "Rent Collection",
    description: "We find tenants and collect rent on your behalf, while you handle day-to-day property management.",
    features: ["Everything in Tenant Find", "Monthly rent collection", "Chasing arrears", "Regular statements"]
  },
  {
    icon: Home,
    title: "Full Management",
    description: "Complete hands-off property management. We handle everything from finding tenants to maintenance issues.",
    features: ["Everything in Rent Collection", "24/7 maintenance line", "Regular inspections", "Legal compliance"]
  }
];

const benefits = [
  { icon: TrendingUp, title: "Maximise Returns", desc: "Competitive rental valuations and advice on property improvements" },
  { icon: Users, title: "Quality Tenants", desc: "Rigorous referencing including credit, employment, and previous landlord checks" },
  { icon: Shield, title: "Legal Compliance", desc: "Full compliance with all landlord regulations and safety requirements" },
  { icon: FileText, title: "Transparent Reporting", desc: "Clear monthly statements and online access to your property information" }
];

const legalRequirements = [
  "Gas Safety Certificate (annual)",
  "Electrical Safety Certificate (every 5 years)",
  "Energy Performance Certificate (EPC)",
  "Smoke alarms on every floor",
  "Carbon monoxide alarms in rooms with solid fuel appliances",
  "Right to Rent checks",
  "Deposit protection in approved scheme",
  "How to Rent guide provided to tenants"
];

export default function LandlordsGuidePage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Guide</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Landlords Guide
            </h1>
            <p className="mt-6 text-lg text-white/70">
              Expert guidance on letting your property. From finding quality tenants 
              to full property management, we're here to help maximise your investment.
            </p>
          </div>
        </div>
      </section>

      {/* Service Levels */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Services</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Choose Your Level of Service</h2>
            <p className="mt-4 text-[#6B7280] max-w-2xl mx-auto">
              We offer three levels of service to suit your needs and budget. 
              All include our premium marketing and quality tenant finding.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="rounded-2xl border border-[#E5E7EB] p-8 hover:border-[#1DBFDD] transition-colors">
                <service.icon className="h-12 w-12 text-[#1DBFDD]" />
                <h3 className="mt-4 text-xl font-semibold">{service.title}</h3>
                <p className="mt-2 text-[#6B7280]">{service.description}</p>
                <ul className="mt-6 space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-[#1DBFDD] mr-2 flex-shrink-0" />
                      <span className="text-[#6B7280]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Why Us</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">The Banc Landlord Advantage</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center p-6">
                <benefit.icon className="h-10 w-10 text-[#1DBFDD] mx-auto" />
                <h3 className="mt-4 text-lg font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-sm text-[#6B7280]">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Compliance */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80" 
                alt="Legal compliance"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Compliance</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Legal Requirements</h2>
              <p className="mt-4 text-[#6B7280]">
                As a landlord, you have legal obligations to ensure your property 
                is safe and compliant. We can help you meet all requirements.
              </p>
              <ul className="mt-6 space-y-3">
                {legalRequirements.map((item) => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD] mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-[#6B7280]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Rental Valuation */}
      <section className="bg-[#2C2F33] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Valuation</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Rental Valuation</h2>
              <p className="mt-4 text-white/70">
                Get an accurate assessment of your property's rental potential. 
                We consider current market conditions, comparable properties, and 
                unique features of your property to provide a realistic valuation.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-white/70">
                  <PoundSterling className="h-5 w-5 text-[#1DBFDD] mr-3" />
                  <span>Current market analysis</span>
                </div>
                <div className="flex items-center text-white/70">
                  <TrendingUp className="h-5 w-5 text-[#1DBFDD] mr-3" />
                  <span>Rental yield calculations</span>
                </div>
                <div className="flex items-center text-white/70">
                  <Home className="h-5 w-5 text-[#1DBFDD] mr-3" />
                  <span>Improvement recommendations</span>
                </div>
              </div>
              <Button className="mt-8 bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white px-8 py-6">
                Book Rental Valuation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="bg-white/5 rounded-2xl p-8">
              <Key className="h-12 w-12 text-[#1DBFDD] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-4">Landlord Resources</h3>
              <ul className="space-y-3 text-white/70">
                <li>• Regular market updates and insights</li>
                <li>• Tax change notifications</li>
                <li>• Legislative update alerts</li>
                <li>• Landlord insurance advice</li>
                <li>• Access to trusted contractors</li>
                <li>• 24/7 emergency line (Full Management)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1DBFDD] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to let your property?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Book your free rental valuation or speak to our lettings team.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button className="bg-white text-[#1DBFDD] hover:bg-white/90 px-8 py-6 text-base">
              Book Valuation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-base">
              Contact Lettings Team
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
