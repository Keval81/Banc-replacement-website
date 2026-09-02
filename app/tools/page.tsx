import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import {
  Calculator,
  Home,
  PoundSterling,
  TrendingUp,
  TrendingDown,
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
    color: "from-green-500/20 to-green-500/5",
    iconColor: "text-green-400",
  },
  {
    id: "mortgage",
    title: "Mortgage Calculator",
    description:
      "Estimate your monthly mortgage payments. Compare repayment types, interest rates, and view amortization schedules.",
    icon: Calculator,
    href: "/tools/mortgage-calculator",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
  },
  {
    id: "affordability",
    title: "Affordability Calculator",
    description:
      "Find out how much you can borrow and your maximum property budget based on your income and deposit.",
    icon: TrendingUp,
    href: "/tools/affordability",
    color: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-400",
  },
  {
    id: "valuation",
    title: "Online Valuation Tool",
    description:
      "Get an instant estimate of your property's value. Compare with recent sales and market trends.",
    icon: Home,
    href: "/tools/valuation",
    color: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-400",
  },
  {
    id: "yield",
    title: "Rental Yield Calculator",
    description:
      "Calculate gross and net rental yields for buy-to-let investments. Include mortgage costs for ROI analysis.",
    icon: Percent,
    href: "/tools/yield-calculator",
    color: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-400",
  },
];

export default function ToolsPage() {
  return (
    <div className="relative overflow-hidden min-h-screen bg-banc-dark-deep">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1625225233840-695456021cde?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep/80 via-banc-dark-deep/60 to-banc-dark-deep/40" />
        </div>
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pb-16 pt-24 lg:px-10 lg:pb-24 lg:pt-32">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-banc-sky/5 to-transparent" />
          <div className="absolute inset-0 opacity-30">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 25%, rgba(29, 191, 221, 0.1) 0%, transparent 50%)",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-banc-sky/30 bg-banc-sky/10 px-4 py-2">
              <Calculator className="h-4 w-4 text-banc-sky" />
              <span className="text-sm text-banc-sky">Free Property Tools</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white lg:text-6xl">
              Property <span className="text-banc-sky">Calculators</span> & Tools
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-white/70">
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
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-banc-sky/30 hover:bg-white/[0.07]"
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 transition-opacity group-hover:opacity-100`}
                  />

                  <div className="relative">
                    {/* Icon */}
                    <div
                      className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 ${tool.iconColor}`}
                    >
                      <tool.icon className="h-7 w-7" />
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 text-xl font-semibold text-white group-hover:text-banc-sky transition-colors">
                      {tool.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-white/60">
                      {tool.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-medium text-banc-sky">
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
        <section className="border-t border-white/10 bg-white/[0.02] px-4 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">Why Use Our Tools?</h2>
              <p className="mx-auto max-w-2xl text-white/60">
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
                <div key={index} className="rounded-2xl border border-white/10 bg-banc-dark-deep p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-banc-sky/10">
                    <span className="text-xl font-bold text-banc-sky">{index + 1}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-white/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-banc-sky/20 to-banc-sky/5 p-8 text-center md:p-12">
              <div className="relative">
                <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
                  Need Expert Advice?
                </h2>
                <p className="mb-6 text-white/70">
                  Our calculators are a great starting point, but nothing beats speaking to an
                  expert. Get personalised advice from our team.
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-banc-sky px-6 py-3 font-medium text-white transition-colors hover:bg-banc-sky-dark"
                  >
                    Contact Us
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/valuation"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
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
