import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Home, Users, Key, CheckCircle, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sellers Guide | Banc Property Services",
  description: "Expert advice on selling your property. Learn how Banc Property Group can help you achieve the best price for your home.",
};

const steps = [
  {
    icon: Home,
    title: "Property Valuation",
    description: "We provide a free, no-obligation valuation based on current market conditions, comparable sales, and your property's unique features."
  },
  {
    icon: Camera,
    title: "Professional Marketing",
    description: "Our team creates high-quality photography, video tours, and compelling descriptions to showcase your property at its best."
  },
  {
    icon: Users,
    title: "Find the Right Buyer",
    description: "We match your property with qualified buyers from our extensive database and national network of applicants."
  },
  {
    icon: Key,
    title: "Complete the Sale",
    description: "We manage the entire process from offer acceptance to completion, keeping you informed at every stage."
  }
];

const marketingFeatures = [
  "Professional photography and video tours",
  "Featured listings on Rightmove and Zoopla",
  "Social media promotion to targeted audiences",
  "Email campaigns to our database of buyers",
  "For Sale board with QR code technology",
  "Premium listings for maximum visibility"
];

const whyChooseUs = [
  { icon: TrendingUp, title: "Local Expertise", desc: "Deep knowledge of the Cuffley, Mayfair and surrounding markets" },
  { icon: Users, title: "Qualified Buyers", desc: "Access to our database of serious, pre-qualified applicants" },
  { icon: Camera, title: "Premium Marketing", desc: "Professional photography, video tours and targeted advertising" },
  { icon: Shield, title: "Dedicated Support", desc: "Personal agent from valuation through to completion" }
];

export default function SellersGuidePage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Guide</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Sellers Guide
            </h1>
            <p className="mt-6 text-lg text-white/70">
              Achieve the best price for your property with our expert guidance. 
              From valuation to completion, we're with you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">The Process</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Selling in Four Steps</h2>
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

      {/* Marketing */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" 
                alt="Professional property photography"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Marketing</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Premium Property Marketing</h2>
              <p className="mt-4 text-[#6B7280]">
                We invest in professional marketing to ensure your property stands out 
                from the crowd and reaches the right buyers.
              </p>
              <ul className="mt-6 space-y-3">
                {marketingFeatures.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-[#1DBFDD] mr-3 flex-shrink-0" />
                    <span className="text-[#6B7280]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Why Banc</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">The Banc Advantage</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl border border-[#E5E7EB]">
                <item.icon className="h-10 w-10 text-[#1DBFDD] mx-auto" />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[#6B7280]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preparing Your Home */}
      <section className="bg-[#2C2F33] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Preparation</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Preparing Your Home for Sale</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4">First Impressions</h3>
              <ul className="space-y-3 text-white/70">
                <li>• Ensure the front of your property is tidy</li>
                <li>• Declutter rooms to make spaces feel larger</li>
                <li>• Let in natural light during viewings</li>
                <li>• Consider minor repairs and touch-ups</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Documentation</h3>
              <ul className="space-y-3 text-white/70">
                <li>• Gather planning permissions and guarantees</li>
                <li>• Compile utility bill information</li>
                <li>• Prepare council tax band details</li>
                <li>• Organise service history for any work done</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4">During Viewings</h3>
              <ul className="space-y-3 text-white/70">
                <li>• Keep the property clean and fresh</li>
                <li>• Remove pets during viewings if possible</li>
                <li>• Be flexible with viewing times</li>
                <li>• Allow buyers to explore at their own pace</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1DBFDD] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to sell your property?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Book your free, no-obligation valuation today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button className="bg-white text-[#1DBFDD] hover:bg-white/90 px-8 py-6 text-base">
              Book Valuation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href="/sales/properties">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-base">
                View Our Sold Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
