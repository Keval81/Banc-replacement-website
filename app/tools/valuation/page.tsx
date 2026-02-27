import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Home, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ValuationTool } from "@/components/ValuationTool";
import AVMValuation from "@/components/ai/AVMValuation";

export const metadata: Metadata = {
  title: "Online Property Valuation | Banc Property Group",
  description:
    "Get an instant estimate of your property's value. Compare with recent sales and market trends in your area.",
};

export default function ValuationPage() {
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2">
              <Home className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-orange-400">Valuation Tool</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white lg:text-5xl">Online Valuation</h1>
            <p className="text-lg text-white/70">
              Get an instant estimate of your property&apos;s value based on recent sales and market data
              in your area. For a more accurate valuation, book a professional appraisal.
            </p>
          </div>

          {/* AVM Instant Valuation */}
          <div className="mb-8 rounded-2xl border border-[#1DBFDD]/20 bg-white/[0.03] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#1DBFDD] to-[#1a4d5c] flex items-center justify-center text-sm">AI</span>
              AI-Powered Instant Valuation
            </h2>
            <p className="text-white/70 mb-6">
              Get an instant estimate using our advanced valuation model that analyzes comparable sales, 
              market trends, and property characteristics.
            </p>
            <AVMValuation />
          </div>

          {/* Calculator */}
          <ValuationTool />

          {/* Info Section */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
              <Info className="h-5 w-5 text-[#1DBFDD]" />
              About Online Valuations
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-white/70">
              <p>
                <strong className="text-white">How it works:</strong> Our online valuation tool uses
                algorithms that analyse recent sales data, property characteristics, and local market
                trends to provide an estimated value range.
              </p>
              <p>
                <strong className="text-white">Accuracy:</strong> Online valuations are estimates only
                and should be used as a starting point. Many factors that affect value (condition,
                extensions, unique features) can&apos;t be assessed remotely.
              </p>
              <p>
                <strong className="text-white">Recent Sales:</strong> The most accurate valuations come
                from recent sales of similar properties in your immediate area. Market conditions can
                change quickly.
              </p>
              <p>
                <strong className="text-white">Professional Appraisal:</strong> For the most accurate
                valuation, we recommend booking a professional appraisal with one of our local
                experts. They can assess your property&apos;s unique features and current condition.
              </p>
              <p className="text-xs text-white/50">
                This tool provides estimates based on available data and should not be used for
                financial or legal purposes. For an accurate market valuation, please contact us to
                arrange a professional appraisal.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
