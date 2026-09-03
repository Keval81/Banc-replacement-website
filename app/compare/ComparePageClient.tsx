"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompareTable from "@/components/search/CompareTable";
import { useComparison } from "@/app/hooks/usePropertyComparison";
import { Button } from "@/components/ui/button";
import { Scale, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function ComparePage() {
  const { comparedProperties, clearComparison } = useComparison();

  return (
    <div className="bg-white text-banc-dark min-h-screen">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-banc-dark-deep to-[#1a1c1f] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link 
                href="/search" 
                className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to search
              </Link>
              <h1 className="text-3xl md:text-4xl font-semibold text-white">
                Compare Properties
              </h1>
              <p className="text-white/70 mt-2">
                Side-by-side comparison of {comparedProperties.length} properties
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/search">
                <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                  <Plus className="w-4 h-4 mr-2" />
                  Add More
                </Button>
              </Link>
              {comparedProperties.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={clearComparison}
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {comparedProperties.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-banc-grey-pale rounded-2xl"
            >
              <Scale className="w-16 h-16 text-banc-muted-readable mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No properties to compare</h2>
              <p className="text-banc-muted-readable mb-6 max-w-md mx-auto">
                Select properties from the search page to compare them side-by-side. 
                You can compare up to 3 properties at once.
              </p>
              <Link href="/search">
                <Button className="bg-banc-sky hover:bg-banc-sky-dark">
                  Browse Properties
                </Button>
              </Link>
            </motion.div>
          ) : comparedProperties.length === 1 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-banc-grey-pale rounded-2xl"
            >
              <Scale className="w-16 h-16 text-banc-muted-readable mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Add more properties</h2>
              <p className="text-banc-muted-readable mb-6 max-w-md mx-auto">
                You have 1 property selected. Add at least one more property to see a comparison.
              </p>
              <Link href="/search">
                <Button className="bg-banc-sky hover:bg-banc-sky-dark">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Property
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Comparison Tips */}
              <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-medium text-blue-900 mb-1">Comparison Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Green checkmarks indicate the best value for each feature</li>
                  <li>• Price per sqft helps you compare value across different sizes</li>
                  <li>• Click &quot;View Property&quot; to see full details and arrange a viewing</li>
                </ul>
              </div>

              {/* Compare Table */}
              <div className="bg-white rounded-2xl border border-banc-grey/20 overflow-hidden">
                <CompareTable />
              </div>

              {/* Bottom CTA */}
              <div className="mt-8 text-center">
                <p className="text-banc-muted-readable mb-4">
                  Want to see more options? Continue browsing or adjust your search criteria.
                </p>
                <div className="flex justify-center gap-3">
                  <Link href="/search">
                    <Button variant="outline">
                      Back to Search
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button className="bg-banc-sky hover:bg-banc-sky-dark">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
