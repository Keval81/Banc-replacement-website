import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import { Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
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

      <main>
        <PageBand
          eyebrow="Mortgage tool"
          title="Mortgage Calculator"
          lede="Estimate your monthly payments and the interest you will pay over the term. Compare rates, deposit sizes and repayment types."
          back={{ href: "/tools", label: "All tools" }}
        />
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
          {/* Calculator */}
          <MortgageCalculator />

          {/* Info Section */}
          <div className="mt-12 border-t border-banc-dark/15 pt-8">
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
