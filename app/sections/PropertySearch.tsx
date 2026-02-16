"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const bedroomOptions = ["1+", "2+", "3+", "4+", "5+"];
const propertyTypes = ["Detached", "Semi-Detached", "Terraced", "Flat", "Bungalow", "Land"];

export default function PropertySearch() {
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [mapOpen, setMapOpen] = React.useState(false);
  const [mapExpanded, setMapExpanded] = React.useState(false);

  return (
    <section className="relative bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 pb-6 pt-16 lg:px-10">
        <div className="rounded-3xl border border-[#C8C9CB] bg-[#F0F0ED] p-6 shadow-sm lg:p-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm uppercase tracking-[0.3em] text-[#6B6E72] font-heading">Search</p>
              <h2 className="text-2xl font-semibold text-[#2C2F33] sm:text-3xl font-heading">
                Find your next property
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-[#6B6E72] font-heading">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Cuffley, Mayfair or postcode"
                  className="mt-2 w-full rounded-xl border border-[#C8C9CB] bg-white px-4 py-3 text-sm text-[#2C2F33] focus:outline-none focus:ring-2 focus:ring-[#4BC5C5]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B6E72] font-heading">
                  Min Price
                </label>
                <select className="mt-2 w-full rounded-xl border border-[#C8C9CB] bg-white px-4 py-3 text-sm text-[#2C2F33] focus:outline-none focus:ring-2 focus:ring-[#4BC5C5]">
                  <option>No min</option>
                  <option>£250k</option>
                  <option>£500k</option>
                  <option>£750k</option>
                  <option>£1m</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B6E72] font-heading">
                  Max Price
                </label>
                <select className="mt-2 w-full rounded-xl border border-[#C8C9CB] bg-white px-4 py-3 text-sm text-[#2C2F33] focus:outline-none focus:ring-2 focus:ring-[#4BC5C5]">
                  <option>No max</option>
                  <option>£750k</option>
                  <option>£1m</option>
                  <option>£1.5m</option>
                  <option>£2m+</option>
                </select>
              </div>

              <div className="flex flex-col justify-between">
                <label className="text-xs font-semibold text-[#6B6E72] font-heading">
                  Price Range
                </label>
                <input
                  type="range"
                  className="mt-3 w-full accent-[#4BC5C5]"
                  min={0}
                  max={100}
                />
                <span className="text-xs text-[#6B6E72]">Adjust range</span>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <label className="text-xs font-semibold text-[#6B6E72] font-heading">Bedrooms</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {bedroomOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="rounded-full border border-[#C8C9CB] bg-white px-4 py-2 text-xs font-semibold text-[#2C2F33] transition-colors hover:border-[#4BC5C5] hover:text-[#4BC5C5] font-heading"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B6E72] font-heading">Property Type</label>
                <select className="mt-2 w-full rounded-xl border border-[#C8C9CB] bg-white px-4 py-3 text-sm text-[#2C2F33] focus:outline-none focus:ring-2 focus:ring-[#4BC5C5]">
                  {propertyTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#4BC5C5] font-heading"
                >
                  Advanced Filters
                  <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              <div className="flex items-end justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMapOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-[#4BC5C5] bg-white px-4 py-3 text-sm font-semibold text-[#4BC5C5] transition-all hover:bg-[#4BC5C5] hover:text-white font-heading"
                >
                  <MapPin className="h-4 w-4" />
                  View Area Map
                </button>
                <Button size="lg" className="w-full lg:w-auto">
                  Search
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {advancedOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-4 border-t border-[#C8C9CB] pt-6 lg:grid-cols-5">
                    {[
                      "Tenure (Freehold/Leasehold)",
                      "Garden",
                      "Parking",
                      "EPC Rating",
                    ].map((label) => (
                      <label key={label} className="flex items-center gap-3 text-sm text-[#2C2F33]">
                        <input type="checkbox" className="h-4 w-4 rounded border-[#C8C9CB] text-[#4BC5C5] focus:ring-[#4BC5C5]" />
                        {label}
                      </label>
                    ))}
                    <div>
                      <label className="text-xs font-semibold text-[#6B6E72] font-heading">Keywords</label>
                      <input
                        type="text"
                        placeholder="Garden, parking, open-plan"
                        className="mt-2 w-full rounded-xl border border-[#C8C9CB] bg-white px-4 py-2 text-sm text-[#2C2F33] focus:outline-none focus:ring-2 focus:ring-[#4BC5C5]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Premium Map Modal */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2F33]/80 backdrop-blur-sm p-4"
            onClick={() => setMapOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`relative overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-500 ${
                mapExpanded ? "h-[90vh] w-[95vw]" : "max-h-[85vh] w-full max-w-4xl"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#C8C9CB] bg-[#F0F0ED] px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#2C2F33] font-heading">
                    Our Coverage Area
                  </h3>
                  <p className="text-sm text-[#6B6E72]">
                    Premium properties in Hertfordshire & North London
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMapExpanded(!mapExpanded)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C8C9CB] bg-white text-[#6B6E72] transition-colors hover:border-[#4BC5C5] hover:text-[#4BC5C5]"
                    aria-label={mapExpanded ? "Minimize map" : "Expand map"}
                  >
                    {mapExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setMapOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C8C9CB] bg-white text-[#6B6E72] transition-colors hover:border-[#4BC5C5] hover:text-[#4BC5C5]"
                    aria-label="Close map"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Map Content */}
              <div className={`relative overflow-hidden bg-[#E8E8E8] ${mapExpanded ? "h-[calc(90vh-80px)]" : "h-[60vh] max-h-[500px]"}`}>
                <Image
                  src="/map-area.png"
                  alt="Banc Property Group coverage area map showing Hertfordshire and North London"
                  fill
                  className="object-contain"
                  priority
                />
                
                {/* Map Overlay - Key Areas */}
                <div className="absolute bottom-6 left-6 rounded-2xl border border-white/30 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6E72] mb-2 font-heading">
                    Key Locations
                  </p>
                  <div className="space-y-2">
                    {[
                      { name: "Cuffley", color: "#4BC5C5" },
                      { name: "Mayfair", color: "#2E9E9E" },
                      { name: "Hadley Wood", color: "#1D7A7A" },
                      { name: "Brookmans Park", color: "#6EE0E0" },
                    ].map((location) => (
                      <div key={location.name} className="flex items-center gap-2">
                        <div 
                          className="h-2 w-2 rounded-full" 
                          style={{ backgroundColor: location.color }}
                        />
                        <span className="text-sm text-[#2C2F33]">{location.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Premium Badge */}
                <div className="absolute right-6 top-6 rounded-full bg-[#2C2F33] px-4 py-2 shadow-lg">
                  <span className="text-xs font-semibold text-white font-heading">
                    Premium Coverage
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[#C8C9CB] bg-white px-6 py-4">
                <p className="text-sm text-[#6B6E72]">
                  Contact us for properties outside these areas
                </p>
                <Button size="sm" onClick={() => setMapOpen(false)}>
                  Start Searching
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
