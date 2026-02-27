import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calculator, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MortgageCalculator } from "@/components/MortgageCalculator";

export const metadata: Metadata = {
  title: "Mortgage Calculator | Banc Property Group",
  description:
    "Calculate your monthly mortgage payments. Compare capital repayment and interest-only mortgages. View amortization schedules and total interest costs.",
};

export default function MortgageCalculatorPage() {
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2">
              <Calculator className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">Mortgage Tool</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white lg:text-5xl">Mortgage Calculator</h1>
            <p className="text-lg text-white/70">
              Estimate your monthly mortgage payments and see how much interest you&apos;ll pay over the
              term. Compare different interest rates, deposit sizes, and repayment types.
            </p>
          </div>

          {/* Calculator */}
          <MortgageCalculator />

          {/* Info Section */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
              <Info className="h-5 w-5 text-[#1DBFDD]" />
              About Mortgage Calculations
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-white/70">
              <p>
                <strong className="text-white">Capital & Interest (Repayment):</strong> You pay off the
                loan amount plus interest each month. By the end of the term, you&apos;ll own the property
                outright.
              </p>
              <p>
                <strong className="text-white">Interest Only:</strong> You only pay the interest each
                month. At the end of the term, you&apos;ll still owe the original loan amount. You&apos;ll need
                a repayment strategy in place.
              </p>
              <p>
                <strong className="text-white">Loan-to-Value (LTV):</strong> This is the ratio of your
                loan amount to the property value. Lower LTVs typically get better interest rates. A
                75% LTV or below usually unlocks the best rates.
              </p>
              <p>
                <strong className="text-white">Interest rates:</strong> The rates shown are examples.
                Actual rates available to you will depend on your circumstances, credit score, and the
                lender&apos;s criteria. Speak to a mortgage advisor for accurate quotes.
              </p>
              <p className="text-xs text-white/50">
                This calculator provides estimates only. It doesn&apos;t include fees, charges, or the
                impact of interest rate changes over time. Always seek professional mortgage advice.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
