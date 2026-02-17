import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Key, Users, FileText } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lettings | Banc Property Services",
  description: "Premium letting services for landlords and tenants across Cuffley, Mayfair and beyond. Property management, tenant finding, and expert advice.",
};

export default function LettingsPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Property Lettings</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Lettings & Property Management
            </h1>
            <p className="mt-6 text-lg text-white/70">
              Whether you are a landlord seeking quality tenants or a tenant 
              searching for your perfect home, we provide exceptional service.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button className="bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white px-8 py-6 text-base">
                Landlord Valuation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base">
                View Rental Properties
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 md:grid-cols-3">
            <Link href="/lettings/properties" className="group">
              <div className="rounded-2xl border border-[#E5E7EB] p-8 transition-all hover:border-[#1DBFDD] hover:shadow-lg">
                <Key className="h-10 w-10 text-[#1DBFDD]" />
                <h3 className="mt-4 text-xl font-semibold">Rental Properties</h3>
                <p className="mt-2 text-[#6B7280]">
                  Browse our available properties to rent.
                </p>
                <span className="mt-4 inline-flex items-center text-[#1DBFDD] group-hover:underline">
                  View Properties <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>

            <Link href="/lettings/tenants-guide" className="group">
              <div className="rounded-2xl border border-[#E5E7EB] p-8 transition-all hover:border-[#1DBFDD] hover:shadow-lg">
                <Users className="h-10 w-10 text-[#1DBFDD]" />
                <h3 className="mt-4 text-xl font-semibold">Tenants Guide</h3>
                <p className="mt-2 text-[#6B7280]">
                  Everything tenants need to know about renting.
                </p>
                <span className="mt-4 inline-flex items-center text-[#1DBFDD] group-hover:underline">
                  Read Guide <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>

            <Link href="/lettings/landlords-guide" className="group">
              <div className="rounded-2xl border border-[#E5E7EB] p-8 transition-all hover:border-[#1DBFDD] hover:shadow-lg">
                <FileText className="h-10 w-10 text-[#1DBFDD]" />
                <h3 className="mt-4 text-xl font-semibold">Landlords Guide</h3>
                <p className="mt-2 text-[#6B7280]">
                  Expert advice for landlords on letting your property.
                </p>
                <span className="mt-4 inline-flex items-center text-[#1DBFDD] group-hover:underline">
                  Read Guide <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Landlord Services */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">For Landlords</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Full-Service Property Management</h2>
              <p className="mt-4 text-[#6B7280]">
                From tenant find to full management, we offer flexible solutions 
                tailored to your needs. Our comprehensive service includes:
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Marketing on Rightmove, Zoopla and our network",
                  "Tenant referencing and credit checks",
                  "Deposit protection and compliance",
                  "Rent collection and arrears management",
                  "Property maintenance and inspections",
                  "Legal compliance and documentation"
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <span className="mr-2 text-[#1DBFDD]">✓</span>
                    <span className="text-[#6B7280]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#2C2F33] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-semibold">Request a Lettings Valuation</h3>
              <p className="mt-2 text-white/70">
                Find out how much rental income your property could generate.
              </p>
              <Button className="mt-6 bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white w-full">
                Book Valuation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
