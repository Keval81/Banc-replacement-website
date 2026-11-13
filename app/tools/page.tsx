import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import {
  Calculator,
  PoundSterling,
  TrendingUp,
  Percent,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimaryOnDark,
  actionSecondaryOnDark,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";

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
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <main>
        <PageBand
          eyebrow="Free Property Tools"
          title="Property Calculators & Tools"
          lede="Plan your property journey with our free calculators. From stamp duty to rental yields, make informed decisions with accurate calculations."
        />

        {/* Tools Grid */}
        <section className={sectionPadding}>
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group flex flex-col rounded-[var(--radius-md)] border border-banc-line bg-white p-5 transition-colors duration-200 hover:border-banc-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 sm:p-6"
                >
                  {/* Icon */}
                  <tool.icon className={`mb-5 h-6 w-6 ${tool.iconColor}`} aria-hidden="true" />

                  {/* Content */}
                  <h2 className="mb-2 text-xl font-semibold text-banc-dark-deep transition-colors group-hover:text-banc-focus">
                    {tool.title}
                  </h2>
                  <p className="mb-5 text-sm leading-relaxed text-banc-muted-readable">
                    {tool.description}
                  </p>

                  {/* CTA */}
                  <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-banc-focus">
                    <span>Try Calculator</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Use Our Tools Section */}
        <section className={`border-t border-banc-dark/15 ${sectionPadding}`}>
          <div className="mx-auto max-w-7xl">
            <h2 className={sectionHeading}>Why Use Our Tools?</h2>
            <p className="mt-4 max-w-2xl text-banc-muted-readable">
              Our calculators are designed to help you make informed property decisions
            </p>

            <div className="mt-7 grid gap-6 md:grid-cols-3 md:gap-8">
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
                <div key={index} className="border-t border-banc-dark/15 pt-6">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-banc-muted-readable">
                    0{index + 1}
                  </span>
                  <h3 className="mb-2 mt-3 text-lg font-semibold text-banc-dark-deep">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-banc-muted-readable">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`banc-dark-surface bg-banc-dark-deep text-white ${sectionPadding}`}>
          <div className="mx-auto max-w-7xl">
            <h2 className={sectionHeadingOnDark}>Need Expert Advice?</h2>
            <p className="mt-4 max-w-2xl text-white/70">
              Our calculators are a great starting point, but nothing beats speaking to an
              expert. Get personalised advice from our team.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className={actionPrimaryOnDark}>
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/valuation" className={actionSecondaryOnDark}>
                Book a Valuation
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
