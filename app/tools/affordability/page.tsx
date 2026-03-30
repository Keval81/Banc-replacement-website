import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AffordabilityCalculator } from "@/components/AffordabilityCalculator";

export const metadata: Metadata = {
  title: "Mortgage Affordability Calculator | Banc Property Group",
  description:
    "Find out how much you can borrow and your maximum property budget. Calculate based on income, deposit, and existing financial commitments.",
};

export default function AffordabilityPage() {
  return (
    <div className="min-h-screen bg-[#1A1917]">
      <Header />

      <main className="px-4 pb-20 pt-24 lg:px-10 lg:pb-24 lg:pt-32">
        <div className="mx-auto max-w-4xl">
          {/* Back Link */}
          <Link
            href="/tools"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-[#4AC8E8]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-400">Affordability Tool</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
              Affordability Calculator
            </h1>
            <p className="text-lg text-white/70">
              Discover how much you could borrow and what your maximum property budget might be. Factor
              in your income, deposit, and existing commitments.
            </p>
          </div>

          {/* Calculator */}
          <AffordabilityCalculator />

          {/* Info Section */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
              <Info className="h-5 w-5 text-[#4AC8E8]" />
              Understanding Affordability
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-white/70">
              <p>
                <strong className="text-white">Income Multipliers:</strong> Lenders typically offer
                between 4 and 5.5 times your annual income. The exact multiplier depends on your credit
                history, employment type, and existing financial commitments.
              </p>
              <p>
                <strong className="text-white">Debt-to-Income Ratio:</strong> Lenders will look at your
                existing monthly debt payments (loans, credit cards, car finance) when assessing how
                much you can borrow. High existing debt may reduce the amount you can borrow.
              </p>
              <p>
                <strong className="text-white">The 28% Rule:</strong> As a general guideline, your
                monthly mortgage payment should not exceed 28% of your gross monthly income.
              </p>
              <p>
                <strong className="text-white">Joint Applications:</strong> When applying with a
                partner, lenders will consider your combined income. This can significantly increase
                your borrowing capacity.
              </p>
              <p className="text-xs text-white/50">
                This calculator provides estimates based on standard industry multiples. Your actual
                borrowing capacity will depend on the lender&apos;s specific criteria and your individual
                circumstances.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
