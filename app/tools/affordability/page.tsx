import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import { Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import { AffordabilityCalculator } from "@/components/AffordabilityCalculator";

export const metadata: Metadata = withPageDefaults("/tools/affordability", {
  title: "Mortgage Affordability Calculator | Banc Property Group",
  description:
    "Find out how much you can borrow and your maximum property budget. Calculate based on income, deposit, and existing financial commitments.",
});

export const revalidate = 3600;

export default function AffordabilityPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <main>
        <PageBand
          eyebrow="Affordability tool"
          title="Affordability Calculator"
          lede="Discover how much you could borrow and what your maximum property budget might be. Factor in your income, deposit, and existing commitments."
          back={{ href: "/tools", label: "All tools" }}
        />
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
          {/* Calculator */}
          <AffordabilityCalculator />

          {/* Info Section */}
          <div className="mt-12 border-t border-banc-dark/15 pt-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-banc-dark-deep">
              <Info className="h-5 w-5 text-banc-focus" />
              Understanding Affordability
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-banc-muted-readable">
              <p>
                <strong className="text-banc-dark-deep">Income Multipliers:</strong> Lenders typically offer
                between 4 and 5.5 times your annual income. The exact multiplier depends on your credit
                history, employment type, and existing financial commitments.
              </p>
              <p>
                <strong className="text-banc-dark-deep">Debt-to-Income Ratio:</strong> Lenders will look at your
                existing monthly debt payments (loans, credit cards, car finance) when assessing how
                much you can borrow. High existing debt may reduce the amount you can borrow.
              </p>
              <p>
                <strong className="text-banc-dark-deep">The 28% Rule:</strong> As a general guideline, your
                monthly mortgage payment should not exceed 28% of your gross monthly income.
              </p>
              <p>
                <strong className="text-banc-dark-deep">Joint Applications:</strong> When applying with a
                partner, lenders will consider your combined income. This can significantly increase
                your borrowing capacity.
              </p>
              <p className="text-xs text-banc-muted-readable">
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
