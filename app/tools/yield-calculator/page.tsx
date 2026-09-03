import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import { ArrowLeft, Percent, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { YieldCalculator } from "@/components/YieldCalculator";

export const metadata: Metadata = withPageDefaults("/tools/yield-calculator", {
  title: "Rental Yield Calculator | Banc Property Group",
  description:
    "Calculate gross and net rental yields for buy-to-let investments. Include mortgage costs to analyse ROI and cash flow.",
});

export const revalidate = 3600;

export default function YieldCalculatorPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <main className="px-4 pb-20 pt-24 lg:px-10 lg:pb-24 lg:pt-32">
        <div className="mx-auto max-w-4xl">
          {/* Back Link */}
          <Link
            href="/tools"
            className="mb-6 inline-flex items-center gap-2 text-sm text-banc-muted-readable transition-colors hover:text-banc-focus"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2">
              <Percent className="h-4 w-4 text-banc-focus" />
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-banc-muted-readable">Investment Tool</span>
            </div>
            <h1 className="mb-4 text-4xl font-semibold text-banc-dark-deep lg:text-5xl">Rental Yield Calculator</h1>
            <p className="text-lg text-banc-muted-readable">
              Calculate gross and net rental yields for your buy-to-let investments. Analyse ROI and
              cash flow with optional mortgage calculations.
            </p>
          </div>

          {/* Calculator */}
          <YieldCalculator />

          {/* Info Section */}
          <div className="mt-12 rounded-2xl border border-banc-line bg-banc-grey-pale p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-banc-dark-deep">
              <Info className="h-5 w-5 text-banc-focus" />
              Understanding Rental Yields
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-banc-muted-readable">
              <p>
                <strong className="text-banc-dark-deep">Gross Yield:</strong> This is your annual rental income
                as a percentage of the property value. It&apos;s a quick way to compare investment
                opportunities but doesn&apos;t account for costs.
              </p>
              <p>
                <strong className="text-banc-dark-deep">Net Yield:</strong> This deducts operating costs
                (maintenance, void periods, management fees, insurance) from your rental income. It
                gives a more realistic picture of your return.
              </p>
              <p>
                <strong className="text-banc-dark-deep">ROI (Return on Investment):</strong> If you&apos;re using a
                mortgage, ROI looks at your return relative to the cash you&apos;ve invested (your
                deposit). A leveraged investment can magnify both gains and losses.
              </p>
              <p>
                <strong className="text-banc-dark-deep">What&apos;s a Good Yield?:</strong> In the UK, gross yields
                of 5-8% are generally considered good, with higher yields often found in the North.
                London and the South East typically see lower yields (3-5%) but may offer stronger
                capital growth.
              </p>
              <p className="text-xs text-banc-muted-readable">
                Remember that yield is just one factor in property investment. Capital growth potential,
                tenant demand, and your overall investment strategy are equally important.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
