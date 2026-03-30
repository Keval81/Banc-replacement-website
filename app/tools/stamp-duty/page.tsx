import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PoundSterling, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { StampDutyCalculator } from "@/components/StampDutyCalculator";

export const metadata: Metadata = {
  title: "Stamp Duty Calculator | Banc Property Group",
  description:
    "Calculate Stamp Duty Land Tax (SDLT) for England, LBTT for Scotland, or LTT for Wales. Compare rates for first-time buyers, home movers, and additional properties.",
};

export default function StampDutyPage() {
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2">
              <PoundSterling className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Tax Calculator</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
              Stamp Duty Calculator
            </h1>
            <p className="text-lg text-white/70">
              Calculate Stamp Duty Land Tax (SDLT) for England & Northern Ireland, Land and Buildings
              Transaction Tax (LBTT) for Scotland, or Land Transaction Tax (LTT) for Wales.
            </p>
          </div>

          {/* Calculator */}
          <StampDutyCalculator />

          {/* Info Section */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
              <Info className="h-5 w-5 text-[#4AC8E8]" />
              About Stamp Duty
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-white/70">
              <p>
                <strong className="text-white">First-time buyer relief:</strong> In England, first-time
                buyers pay no stamp duty on the first £425,000 of a property purchase (up to a maximum
                purchase price of £625,000). In Scotland, the threshold is £175,000.
              </p>
              <p>
                <strong className="text-white">Additional property surcharge:</strong> If you&apos;re buying
                an additional residential property (such as a buy-to-let or second home), you&apos;ll
                pay an extra 3% on top of the standard rates in England, 6% in Scotland (ADS), and 4%
                in Wales.
              </p>
              <p>
                <strong className="text-white">Non-residential rates:</strong> Different rates apply for
                non-residential and mixed-use properties. This calculator is for residential properties
                only.
              </p>
              <p className="text-xs text-white/50">
                Rates shown are for 2024/2025 tax year and may be subject to change. Always consult a
                solicitor or tax advisor for the most current information.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
