import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import { Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
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

      <main>
        <PageBand
          eyebrow="Tax calculator"
          title="Stamp Duty Calculator"
          lede="Calculate Stamp Duty Land Tax (SDLT) for England & Northern Ireland, Land and Buildings Transaction Tax (LBTT) for Scotland, or Land Transaction Tax (LTT) for Wales."
          back={{ href: "/tools", label: "All tools" }}
        />
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
          {/* Calculator */}
          <StampDutyCalculator />

          {/* Info Section */}
          <div className="mt-12 border-t border-banc-dark/15 pt-8">
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
