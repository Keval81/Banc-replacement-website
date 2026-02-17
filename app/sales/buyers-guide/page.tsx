import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Home, FileText, Key, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Buyers Guide | Banc Property Services",
  description: "Everything you need to know about buying a property. Expert advice from Banc Property Group to help you navigate the buying process.",
};

const steps = [
  {
    icon: Search,
    title: "Register Your Interest",
    description: "The first step is to register your details with us. This ensures you receive notifications about new properties that match your criteria before they appear on the open market."
  },
  {
    icon: Home,
    title: "View Properties",
    description: "Arrange viewings at times that suit you. Our team will accompany you and provide detailed information about each property, the local area, and answer any questions you may have."
  },
  {
    icon: FileText,
    title: "Make an Offer",
    description: "Once you find your perfect property, we'll guide you through making an offer. We'll negotiate on your behalf and keep you informed throughout the process."
  },
  {
    icon: Key,
    title: "Complete the Purchase",
    description: "We'll liaise with all parties to ensure a smooth transaction. From solicitors to surveyors, we coordinate everything to get you the keys to your new home."
  }
];

const tips = [
  "Get a mortgage agreement in principle before you start viewing",
  "Consider the total cost including stamp duty, legal fees, and moving costs",
  "Research the local area including schools, transport links, and amenities",
  "Don't skip the survey – it could save you thousands in the long run",
  "Be prepared to act quickly in a competitive market",
  "Keep your paperwork organised and respond promptly to requests"
];

export default function BuyersGuidePage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Guide</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Buyers Guide
            </h1>
            <p className="mt-6 text-lg text-white/70">
              Everything you need to know about buying a property. 
              Our expert team is here to guide you through every step of the process.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">The Process</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Buying in Four Steps</h2>
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

      {/* Tips */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Expert Advice</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Top Tips for Buyers</h2>
              <p className="mt-4 text-[#6B7280]">
                Our experienced team has helped hundreds of buyers find their perfect property. 
                Here are our top tips to make your buying journey smoother.
              </p>
              <ul className="mt-6 space-y-4">
                {tips.map((tip) => (
                  <li key={tip} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD] mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-[#6B7280]">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80" 
                alt="Happy homeowners"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mortgage Advice */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rounded-2xl bg-[#2C2F33] p-8 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Finance</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">Mortgage Advice</h2>
                <p className="mt-4 text-white/70">
                  We work with independent mortgage advisers who can help you find the best deal 
                  for your circumstances. Getting your finances in place early puts you in a 
                  stronger position when making an offer.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-white/70">
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD] mr-3" />
                    <span>Independent whole-of-market advice</span>
                  </div>
                  <div className="flex items-center text-white/70">
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD] mr-3" />
                    <span>Agreement in principle within 24 hours</span>
                  </div>
                  <div className="flex items-center text-white/70">
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD] mr-3" />
                    <span>Access to exclusive rates</span>
                  </div>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <Button className="bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white px-8 py-6">
                  Speak to a Mortgage Adviser
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1DBFDD] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to start your property search?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Browse our portfolio of premium properties for sale.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/sales/properties">
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
