import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import { ArrowLeft, PoundSterling, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { StampDutyCalculator } from "@/components/StampDutyCalculator";

export const metadata: Metadata = withPageDefaults("/tools/stamp-duty", {
  title: "Stamp Duty Calculator | Banc Property Group",
  description:
    "Calculate Stamp Duty Land Tax (SDLT) for England, LBTT for Scotland, or LTT for Wales. Compare rates for first-time buyers, home movers, and additional properties.",
});

export const revalidate = 3600;

export default function StampDutyPage() {
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
              <PoundSterling className="h-4 w-4 text-banc-focus" />
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-banc-muted-readable">Tax Calculator</span>
            </div>
            <h1 className="mb-4 text-4xl font-semibold text-banc-dark-deep lg:text-5xl">
              Stamp Duty Calculator
            </h1>
            <p className="text-lg text-banc-muted-readable">
              Calculate Stamp Duty Land Tax (SDLT) for England & Northern Ireland, Land and Buildings
              Transaction Tax (LBTT) for Scotland, or Land Transaction Tax (LTT) for Wales.
            </p>
          </div>

          {/* Calculator */}
          <StampDutyCalculator />

          {/* Info Section */}
          <div className="mt-12 rounded-2xl border border-banc-line bg-banc-grey-pale p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-banc-dark-deep">
              <Info className="h-5 w-5 text-banc-focus" />
              About Stamp Duty
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-banc-muted-readable">
              <p>
                <strong className="text-banc-dark-deep">First-time buyer relief:</strong> In England, first-time
                buyers pay no stamp duty on the first £300,000 of a property purchase, and 5% on the
                portion from £300,001 to £500,000; the relief is not available above £500,000. In
                Scotland, the first-time buyer nil rate band is £175,000.
              </p>
              <p>
                <strong className="text-banc-dark-deep">Additional property surcharge:</strong> If you&apos;re buying
                an additional residential property (such as a buy-to-let or second home), you&apos;ll
                usually pay an extra 5% on top of the standard rates in England, an 8% Additional
                Dwelling Supplement in Scotland, and Wales applies its own higher-rate bands.
              </p>
              <p>
                <strong className="text-banc-dark-deep">Non-residential rates:</strong> Different rates apply for
                non-residential and mixed-use properties. This calculator is for residential properties
                only.
              </p>
              <p className="text-xs text-banc-muted-readable">
                Rates verified against gov.uk, revenue.scot and gov.wales in August 2026 and may be
                subject to change. Always consult a solicitor or tax advisor for the most current
                information.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
