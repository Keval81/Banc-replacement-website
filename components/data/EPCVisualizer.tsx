"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Thermometer, 
  Lightbulb, 
  Droplets, 
  TrendingDown,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  Leaf,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { EPCCertificate } from "@/lib/types/data";

interface EPCVisualizerProps {
  epc: EPCCertificate;
  className?: string;
  showImprovements?: boolean;
}

const RATING_COLORS: Record<string, { bg: string; text: string; bar: string; gradient: string }> = {
  A: { bg: "bg-green-600", text: "text-green-600", bar: "bg-green-600", gradient: "from-green-500 to-green-600" },
  B: { bg: "bg-green-500", text: "text-green-500", bar: "bg-green-500", gradient: "from-green-400 to-green-500" },
  C: { bg: "bg-green-400", text: "text-green-500", bar: "bg-green-400", gradient: "from-green-300 to-green-400" },
  D: { bg: "bg-yellow-400", text: "text-yellow-600", bar: "bg-yellow-400", gradient: "from-yellow-300 to-yellow-400" },
  E: { bg: "bg-orange-400", text: "text-orange-600", bar: "bg-orange-400", gradient: "from-orange-300 to-orange-400" },
  F: { bg: "bg-orange-500", text: "text-orange-700", bar: "bg-orange-500", gradient: "from-orange-400 to-orange-500" },
  G: { bg: "bg-red-500", text: "text-red-600", bar: "bg-red-500", gradient: "from-red-400 to-red-500" },
};

const RATING_SCALE = [
  { rating: "A", min: 92, max: 100 },
  { rating: "B", min: 81, max: 91 },
  { rating: "C", min: 69, max: 80 },
  { rating: "D", min: 55, max: 68 },
  { rating: "E", min: 39, max: 54 },
  { rating: "F", min: 21, max: 38 },
  { rating: "G", min: 1, max: 20 },
];

export function EPCVisualizer({ epc, className = "", showImprovements = true }: EPCVisualizerProps) {
  const [activeTab, setActiveTab] = useState<"current" | "potential">("current");
  const [showImprovementsList, setShowImprovementsList] = useState(false);

  const currentColors = RATING_COLORS[epc.currentRating];
  const potentialColors = RATING_COLORS[epc.potentialRating];

  const activeRating = activeTab === "current" ? epc.currentRating : epc.potentialRating;
  const activeScore = activeTab === "current" ? epc.currentScore : epc.potentialScore;
  const activeColors = activeTab === "current" ? currentColors : potentialColors;

  const currentTotalCost = epc.heatingCostCurrent + epc.hotWaterCostCurrent + epc.lightingCostCurrent;
  const potentialTotalCost = epc.heatingCostPotential + epc.hotWaterCostPotential + epc.lightingCostPotential;
  const annualSavings = currentTotalCost - potentialTotalCost;

  return (
    <div className={`bg-white rounded-lg border border-banc-grey/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-banc-grey/20">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg ${currentColors.bg} flex items-center justify-center text-white text-2xl font-bold shadow-sm`}>
            {epc.currentRating}
          </div>
          <div>
            <h3 className="font-semibold text-banc-dark">Energy Performance Certificate</h3>
            <p className="text-sm text-banc-grey">Valid until {new Date(epc.lodgementDate).getFullYear() + 10}</p>
          </div>
          <Leaf className="h-5 w-5 text-green-500 ml-auto" />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-banc-grey/20">
        <button
          onClick={() => setActiveTab("current")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "current" ? "text-emerald-600" : "text-banc-grey hover:text-banc-dark-mid"
          }`}
        >
          Current Rating
          {activeTab === "current" && (
            <motion.div 
              layoutId="epc-tab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("potential")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "potential" ? "text-emerald-600" : "text-banc-grey hover:text-banc-dark-mid"
          }`}
        >
          Potential Rating
          {activeTab === "potential" && (
            <motion.div 
              layoutId="epc-tab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
            />
          )}
        </button>
      </div>

      <div className="p-5">
        {/* Rating Display */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-banc-grey mb-1">
              {activeTab === "current" ? "Current Rating" : "Potential Rating"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${activeColors.text}`}>
                {activeRating}
              </span>
              <span className="text-2xl text-banc-grey">/</span>
              <span className="text-2xl text-banc-grey">G</span>
            </div>
            <p className="text-sm text-banc-grey mt-1">
              Score: <span className="font-semibold">{activeScore}</span>
            </p>
          </div>
          <div className={`w-24 h-24 rounded-full ${activeColors.bg} bg-opacity-20 flex items-center justify-center`}>
            <Zap className={`h-12 w-12 ${activeColors.text}`} />
          </div>
        </div>

        {/* Rating Scale */}
        <div className="space-y-1.5 mb-6">
          {RATING_SCALE.map(({ rating, min, max }) => {
            const colors = RATING_COLORS[rating];
            const isActive = rating === activeRating;
            const index = RATING_SCALE.findIndex(r => r.rating === rating);
            const width = 100 - (index * 12);
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className={`w-6 font-bold ${colors.text}`}>{rating}</span>
                <div className="flex-1 relative">
                  <div 
                    className="h-5 bg-banc-grey-pale rounded-r"
                    style={{ width: `${width}%` }}
                  >
                    <div 
                      className={`h-full rounded-r transition-all duration-500 ${colors.bar} ${
                        isActive ? 'opacity-100' : 'opacity-40'
                      }`}
                    />
                  </div>
                  {isActive && (
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white border-2 border-banc-dark rounded-full flex items-center justify-center text-sm font-bold shadow-md"
                      style={{ left: `${((activeScore - min) / (max - min)) * 100}%` }}
                    >
                      {activeScore}
                    </div>
                  )}
                </div>
                <span className="text-xs text-banc-grey w-12 text-right">{max}+</span>
              </div>
            );
          })}
        </div>

        {/* Cost Estimates */}
        <div className="bg-banc-grey-pale rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-banc-dark mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-green-500" />
            Estimated Energy Costs
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {activeTab === "current" ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-banc-grey flex items-center gap-1">
                      <Thermometer className="h-3.5 w-3.5" />
                      Heating
                    </span>
                    <span className="font-medium">£{epc.heatingCostCurrent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-banc-grey flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5" />
                      Lighting
                    </span>
                    <span className="font-medium">£{epc.lightingCostCurrent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-banc-grey flex items-center gap-1">
                      <Droplets className="h-3.5 w-3.5" />
                      Hot Water
                    </span>
                    <span className="font-medium">£{epc.hotWaterCostCurrent}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center border-l border-banc-grey/20">
                  <div className="text-center">
                    <p className="text-xs text-banc-grey mb-1">Total per year</p>
                    <p className="text-2xl font-bold text-banc-dark">£{currentTotalCost}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-banc-grey flex items-center gap-1">
                      <Thermometer className="h-3.5 w-3.5" />
                      Heating
                    </span>
                    <span className="font-medium">£{epc.heatingCostPotential}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-banc-grey flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5" />
                      Lighting
                    </span>
                    <span className="font-medium">£{epc.lightingCostPotential}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-banc-grey flex items-center gap-1">
                      <Droplets className="h-3.5 w-3.5" />
                      Hot Water
                    </span>
                    <span className="font-medium">£{epc.hotWaterCostPotential}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center border-l border-banc-grey/20">
                  <div className="text-center">
                    <p className="text-xs text-banc-grey mb-1">Potential savings</p>
                    <p className="text-2xl font-bold text-green-600">£{annualSavings}</p>
                    <p className="text-xs text-green-600">per year</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-banc-grey">Property Type</p>
            <p className="font-medium text-banc-dark">{epc.propertyType}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-banc-grey">Built Form</p>
            <p className="font-medium text-banc-dark">{epc.builtForm}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-banc-grey">Floor Area</p>
            <p className="font-medium text-banc-dark">{epc.totalFloorArea} m²</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-banc-grey">CO₂ Emissions</p>
            <p className="font-medium text-banc-dark">{epc.co2Emissions} tonnes/year</p>
          </div>
        </div>

        {/* Improvements Section */}
        {showImprovements && epc.improvements && epc.improvements.length > 0 && (
          <div className="border-t border-banc-grey/20 pt-4">
            <button
              onClick={() => setShowImprovementsList(!showImprovementsList)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-semibold text-banc-dark">Recommended Improvements</span>
              {showImprovementsList ? (
                <ChevronUp className="h-5 w-5 text-banc-grey" />
              ) : (
                <ChevronDown className="h-5 w-5 text-banc-grey" />
              )}
            </button>
            
            <AnimatePresence>
              {showImprovementsList && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-3">
                    {epc.improvements.map((improvement, index) => (
                      <div 
                        key={index}
                        className="bg-emerald-50 rounded-lg p-3 text-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-banc-dark">{improvement.improvementDescription}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Save £{improvement.typicalSaving}/year
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-banc-grey">
                          <span>Est. cost: {improvement.indicativeCost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Info */}
        <div className="mt-4 pt-4 border-t border-banc-grey/20 flex items-center gap-1.5 text-sm text-banc-grey">
          <Info className="h-4 w-4" />
          <span>Based on standard assumptions about occupancy and energy use</span>
        </div>
      </div>
    </div>
  );
}
