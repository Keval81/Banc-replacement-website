import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import {
  Calculator,
  PoundSterling,
  TrendingUp,
  MapPin,
  Percent,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = withPageDefaults("/tools", {
  title: "Property Tools & Calculators | Banc Property Group",
  description:
    "Free property calculators and tools. Calculate stamp duty, mortgage payments, affordability, property yields, and get instant valuations.",
});

export const revalidate = 3600;

const tools = [
  {
    id: "stamp-duty",
    title: "Stamp Duty Calculator",
    description:
      "Calculate SDLT, LBTT, or LTT for England, Scotland, or Wales. Compare costs for first-time buyers, home movers, and investors.",
    icon: PoundSterling,
    href: "/tools/stamp-duty",
    iconColor: "text-banc-focus",
  },
  {
    id: "mortgage",
    title: "Mortgage Calculator",
    description:
      "Estimate your monthly mortgage payments. Compare repayment types, interest rates, and view amortization schedules.",
    icon: Calculator,
    href: "/tools/mortgage-calculator",
    iconColor: "text-banc-focus",
  },
  {
    id: "affordability",
    title: "Affordability Calculator",
    description:
      "Find out how much you can borrow and your maximum property budget based on your income and deposit.",
    icon: TrendingUp,
    href: "/tools/affordability",
    iconColor: "text-banc-focus",
  },
  {
    id: "yield",
    title: "Rental Yield Calculator",
    description:
      "Calculate gross and net rental yields for buy-to-let investments. Include mortgage costs for ROI analysis.",
    icon: Percent,
    href: "/tools/yield-calculator",
    iconColor: "text-banc-focus",
  },
  {
    id: "catchment",
    title: "School Catchment Checker",
    description:
      "See which schools a postcode falls within, with distances and Ofsted ratings for the area.",
    icon: MapPin,
    href: "/tools/catchment-checker",
    iconColor: "text-banc-focus",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pb-16 pt-24 lg:px-10 lg:pb-24 lg:pt-32">
          <div className="relative mx-auto max-w-7xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-banc-sky/30 bg-banc-sky/10 px-4 py-2">
              <Calculator className="h-4 w-4 text-banc-focus" />
              <span className="text-sm text-banc-focus">Free Property Tools</span>
            </div>

            <h1 className="mb-6 text-4xl font-semibold leading-tight text-banc-dark-deep lg:text-6xl">
              Property <span className="text-banc-focus">Calculators</span> & Tools
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-banc-muted-readable">
              Plan your property journey with our free calculators. From stamp duty to rental yields,
              make informed decisions with accurate calculations.
            </p>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="px-4 pb-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative overflow-hidden rounded-2xl border border-banc-line bg-white p-6 transition-colors hover:border-banc-sky"
                >
                  <div className="relative">
                    {/* Icon */}
                    <div
                      className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-banc-grey-pale ${tool.iconColor}`}
                    >
                      <tool.icon className="h-7 w-7" />
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 text-xl font-semibold text-banc-dark-deep group-hover:text-banc-focus transition-colors">
                      {tool.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-banc-muted-readable">
                      {tool.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-medium text-banc-focus">
                      <span>Try Calculator</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Use Our Tools Section */}
        <section className="border-t border-banc-line bg-banc-grey-pale px-4 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-semibold text-banc-dark-deep">Why Use Our Tools?</h2>
              <p className="mx-auto max-w-2xl text-banc-muted-readable">
                Our calculators are designed to help you make informed property decisions
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Accurate & Up-to-Date",
                  description:
                    "Our calculators use the latest tax rates and industry-standard formulas to ensure accuracy.",
                },
                {
                  title: "Instant Results",
                  description:
                    "Get immediate calculations as you type. No waiting, no sign-up required.",
                },
                {
                  title: "Free Forever",
                  description:
                    "All our tools are completely free to use. Calculate as many scenarios as you need.",
                },
              ].map((feature, index) => (
                <div key={index} className="rounded-2xl border border-banc-line bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-banc-sky/10">
                    <span className="text-xl font-semibold text-banc-focus">{index + 1}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-banc-dark-deep">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-banc-muted-readable">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border border-banc-line bg-white p-8 text-center md:p-12">
              <div className="relative">
                <h2 className="mb-4 text-2xl font-semibold text-banc-dark-deep md:text-3xl">
                  Need Expert Advice?
                </h2>
                <p className="mb-6 text-banc-muted-readable">
                  Our calculators are a great starting point, but nothing beats speaking to an
                  expert. Get personalised advice from our team.
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-banc-focus px-6 py-3 font-medium text-white transition-colors hover:bg-banc-focus-hover"
                  >
                    Contact Us
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/valuation"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-banc-line px-6 py-3 font-medium text-banc-dark-deep transition-colors hover:bg-banc-grey-pale"
                  >
                    Book a Valuation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
