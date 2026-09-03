import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import { ArrowLeft, Calculator, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MortgageCalculator } from "@/components/MortgageCalculator";

export const metadata: Metadata = withPageDefaults("/tools/mortgage-calculator", {
  title: "Mortgage Calculator | Banc Property Group",
  description:
    "Calculate your monthly mortgage payments. Compare capital repayment and interest-only mortgages. View amortization schedules and total interest costs.",
});

export const revalidate = 3600;

export default function MortgageCalculatorPage() {
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
              <Calculator className="h-4 w-4 text-banc-focus" />
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-banc-muted-readable">Mortgage Tool</span>
            </div>
            <h1 className="mb-4 text-4xl font-semibold text-banc-dark-deep lg:text-5xl">Mortgage Calculator</h1>
            <p className="text-lg text-banc-muted-readable">
              Estimate your monthly mortgage payments and see how much interest you&apos;ll pay over the
              term. Compare different interest rates, deposit sizes, and repayment types.
            </p>
          </div>

          {/* Calculator */}
          <MortgageCalculator />

          {/* Info Section */}
          <div className="mt-12 rounded-2xl border border-banc-line bg-banc-grey-pale p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-banc-dark-deep">
              <Info className="h-5 w-5 text-banc-focus" />
              About Mortgage Calculations
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-banc-muted-readable">
              <p>
                <strong className="text-banc-dark-deep">Capital & Interest (Repayment):</strong> You pay off the
                loan amount plus interest each month. By the end of the term, you&apos;ll own the property
                outright.
              </p>
              <p>
                <strong className="text-banc-dark-deep">Interest Only:</strong> You only pay the interest each
                month. At the end of the term, you&apos;ll still owe the original loan amount. You&apos;ll need
                a repayment strategy in place.
              </p>
              <p>
                <strong className="text-banc-dark-deep">Loan-to-Value (LTV):</strong> This is the ratio of your
                loan amount to the property value. Lower LTVs typically get better interest rates. A
                75% LTV or below usually unlocks the best rates.
              </p>
              <p>
                <strong className="text-banc-dark-deep">Interest rates:</strong> The rates shown are examples.
                Actual rates available to you will depend on your circumstances, credit score, and the
                lender&apos;s criteria. Speak to a mortgage advisor for accurate quotes.
              </p>
              <p className="text-xs text-banc-muted-readable">
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
