import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Percent, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { YieldCalculator } from "@/components/YieldCalculator";

export const metadata: Metadata = {
  title: "Rental Yield Calculator | Banc Property Group",
  description:
    "Calculate gross and net rental yields for buy-to-let investments. Include mortgage costs to analyse ROI and cash flow.",
};

export default function YieldCalculatorPage() {
  return (
    <div className="min-h-screen bg-[#2C2F33]">
      <Header />

      <main className="px-4 pb-20 pt-24 lg:px-10 lg:pb-24 lg:pt-32">
        <div className="mx-auto max-w-4xl">
          {/* Back Link */}
          <Link
            href="/tools"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-[#1DBFDD]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2">
              <Percent className="h-4 w-4 text-pink-400" />
              <span className="text-sm text-pink-400">Investment Tool</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white lg:text-5xl">Rental Yield Calculator</h1>
            <p className="text-lg text-white/70">
              Calculate gross and net rental yields for your buy-to-let investments. Analyse ROI and
              cash flow with optional mortgage calculations.
            </p>
          </div>

          {/* Calculator */}
          <YieldCalculator />

          {/* Info Section */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
              <Info className="h-5 w-5 text-[#1DBFDD]" />
              Understanding Rental Yields
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-white/70">
              <p>
                <strong className="text-white">Gross Yield:</strong> This is your annual rental income
                as a percentage of the property value. It&apos;s a quick way to compare investment
                opportunities but doesn&apos;t account for costs.
              </p>
              <p>
                <strong className="text-white">Net Yield:</strong> This deducts operating costs
                (maintenance, void periods, management fees, insurance) from your rental income. It
                gives a more realistic picture of your return.
              </p>
              <p>
                <strong className="text-white">ROI (Return on Investment):</strong> If you&apos;re using a
                mortgage, ROI looks at your return relative to the cash you&apos;ve invested (your
                deposit). A leveraged investment can magnify both gains and losses.
              </p>
              <p>
                <strong className="text-white">What&apos;s a Good Yield?:</strong> In the UK, gross yields
                of 5-8% are generally considered good, with higher yields often found in the North.
                London and the South East typically see lower yields (3-5%) but may offer stronger
                capital growth.
              </p>
              <p className="text-xs text-white/50">
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
