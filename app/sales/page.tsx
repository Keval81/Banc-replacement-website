import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Users, FileText } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sales | Banc Property Services",
  description: "Expert property sales services across Cuffley, Mayfair and beyond. Free valuations, premium marketing, and exceptional results.",
};

export default function SalesPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Property Sales</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Selling Your Property
            </h1>
            <p className="mt-6 text-lg text-white/70">
              Achieve the best price for your home with our premium marketing, 
              expert valuations, and dedicated sales team.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button className="bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white px-8 py-6 text-base">
                Request Valuation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base">
                View Our Properties
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 md:grid-cols-3">
            <Link href="/sales/properties" className="group">
              <div className="rounded-2xl border border-[#E5E7EB] p-8 transition-all hover:border-[#1DBFDD] hover:shadow-lg">
                <Home className="h-10 w-10 text-[#1DBFDD]" />
                <h3 className="mt-4 text-xl font-semibold">Our Properties</h3>
                <p className="mt-2 text-[#6B7280]">
                  Browse our portfolio of premium properties for sale.
                </p>
                <span className="mt-4 inline-flex items-center text-[#1DBFDD] group-hover:underline">
                  View Properties <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>

            <Link href="/sales/buyers-guide" className="group">
              <div className="rounded-2xl border border-[#E5E7EB] p-8 transition-all hover:border-[#1DBFDD] hover:shadow-lg">
                <Users className="h-10 w-10 text-[#1DBFDD]" />
                <h3 className="mt-4 text-xl font-semibold">Buyers Guide</h3>
                <p className="mt-2 text-[#6B7280]">
                  Everything you need to know about buying a property.
                </p>
                <span className="mt-4 inline-flex items-center text-[#1DBFDD] group-hover:underline">
                  Read Guide <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>

            <Link href="/sales/sellers-guide" className="group">
              <div className="rounded-2xl border border-[#E5E7EB] p-8 transition-all hover:border-[#1DBFDD] hover:shadow-lg">
                <FileText className="h-10 w-10 text-[#1DBFDD]" />
                <h3 className="mt-4 text-xl font-semibold">Sellers Guide</h3>
                <p className="mt-2 text-[#6B7280]">
                  Expert advice on preparing and selling your home.
                </p>
                <span className="mt-4 inline-flex items-center text-[#1DBFDD] group-hover:underline">
                  Read Guide <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Why Banc</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">The Banc Sales Advantage</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Local Expertise", desc: "Deep knowledge of Cuffley, Mayfair and surrounding areas" },
              { title: "Premium Marketing", desc: "Professional photography, video tours, and targeted advertising" },
              { title: "Qualified Buyers", desc: "Access to our database of pre-qualified, serious buyers" },
              { title: "Dedicated Support", desc: "Personal agent from valuation through to completion" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[#6B7280]">{item.desc}</p>
              </div>
            ))}
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
            Get a free, no-obligation valuation from our expert team.
          </p>
          <Button className="mt-8 bg-white text-[#1DBFDD] hover:bg-white/90 px-8 py-6 text-base">
            Book Your Valuation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
