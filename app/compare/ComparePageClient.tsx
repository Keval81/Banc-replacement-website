"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompareTable from "@/components/search/CompareTable";
import { useComparison } from "@/app/hooks/usePropertyComparison";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimary,
  actionSecondary,
  actionSecondaryOnDark,
} from "@/components/ui/form-styles";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ComparePage() {
  const { comparedProperties, clearComparison } = useComparison();

  return (
    <div className="min-h-screen bg-banc-grey-pale text-banc-dark">
      <Header />

      <main>
        <PageBand
          eyebrow="Compare"
          title="Compare Properties"
          lede={<>Side-by-side comparison of {comparedProperties.length} properties</>}
          back={{ href: "/search", label: "Back to search" }}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/search" className={actionSecondaryOnDark}>
              <Plus className="h-4 w-4" />
              Add More
            </Link>
            {comparedProperties.length > 0 && (
              <button onClick={clearComparison} className={actionSecondaryOnDark}>
                Clear All
              </button>
            )}
          </div>
        </PageBand>

        {/* Main Content */}
        <section className="py-12 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            {comparedProperties.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="mb-2 text-xl font-semibold text-banc-dark-deep">No properties to compare</h2>
                <p className="mb-6 max-w-md text-banc-muted-readable">
                  Select properties from the search page to compare them side-by-side. 
                  You can compare up to 3 properties at once.
                </p>
                <Link href="/search" className={actionPrimary}>
                  Browse Properties
                </Link>
              </motion.div>
            ) : comparedProperties.length === 1 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="mb-2 text-xl font-semibold text-banc-dark-deep">Add more properties</h2>
                <p className="mb-6 max-w-md text-banc-muted-readable">
                  You have 1 property selected. Add at least one more property to see a comparison.
                </p>
                <Link href="/search" className={actionPrimary}>
                  <Plus className="h-4 w-4" />
                  Add Another Property
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Comparison Tips */}
                <div className="mb-8">
                  <h3 className="mb-2 font-semibold text-banc-dark-deep">Comparison Tips</h3>
                  <ul className="space-y-1 text-sm text-banc-muted-readable">
                    <li>• Green checkmarks indicate the best value for each feature</li>
                    <li>• Price per sqft helps you compare value across different sizes</li>
                    <li>• Click &quot;View Property&quot; to see full details and arrange a viewing</li>
                  </ul>
                </div>

                {/* Compare Table */}
                <div className="overflow-hidden rounded-[var(--radius-md)] border border-banc-line bg-white">
                  <CompareTable />
                </div>

                {/* Bottom CTA */}
                <div className="mt-8 border-t border-banc-dark/15 pt-8">
                  <p className="mb-6 text-banc-muted-readable">
                    Want to see more options? Continue browsing or adjust your search criteria.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/contact" className={actionPrimary}>
                      Contact Us
                    </Link>
                    <Link href="/search" className={actionSecondary}>
                      Back to Search
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
