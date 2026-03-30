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
  Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EPCData } from "@/lib/types/property";

interface EPCVisualizerProps {
  epc: EPCData;
  className?: string;
}

const RATING_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  A: { bg: "bg-green-600", text: "text-green-600", bar: "bg-green-600" },
  B: { bg: "bg-green-500", text: "text-green-500", bar: "bg-green-500" },
  C: { bg: "bg-green-400", text: "text-green-400", bar: "bg-green-400" },
  D: { bg: "bg-yellow-400", text: "text-yellow-500", bar: "bg-yellow-400" },
  E: { bg: "bg-orange-400", text: "text-orange-500", bar: "bg-orange-400" },
  F: { bg: "bg-orange-500", text: "text-orange-600", bar: "bg-orange-500" },
  G: { bg: "bg-red-500", text: "text-red-600", bar: "bg-red-500" },
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

export function EPCVisualizer({ epc, className = "" }: EPCVisualizerProps) {
  const [activeTab, setActiveTab] = useState<"current" | "potential">("current");
  const [showDetails, setShowDetails] = useState(false);
  const [showImprovements, setShowImprovements] = useState(false);

  const currentColors = RATING_COLORS[epc.currentRating];
  const potentialColors = RATING_COLORS[epc.potentialRating];

  const activeRating = activeTab === "current" ? epc.currentRating : epc.potentialRating;
  const activeScore = activeTab === "current" ? epc.currentScore : epc.potentialScore;
  const activeColors = activeTab === "current" ? currentColors : potentialColors;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg ${currentColors.bg} flex items-center justify-center text-white text-2xl font-bold shadow-sm`}>
            {epc.currentRating}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Energy Performance Certificate</h3>
            <p className="text-sm text-gray-600">Valid until {epc.validUntil}</p>
          </div>
          <Leaf className="h-5 w-5 text-green-500 ml-auto" />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("current")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "current" ? "text-[#4AC8E8]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Current Rating
          {activeTab === "current" && (
            <motion.div 
              layoutId="epc-tab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4AC8E8]"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("potential")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "potential" ? "text-[#4AC8E8]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Potential Rating
          {activeTab === "potential" && (
            <motion.div 
              layoutId="epc-tab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4AC8E8]"
            />
          )}
        </button>
      </div>

      <div className="p-5">
        {/* Rating Display */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {activeTab === "current" ? "Current Rating" : "Potential Rating"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${activeColors.text}`}>
                {activeRating}
              </span>
              <span className="text-2xl text-gray-400">/</span>
              <span className="text-2xl text-gray-400">G</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
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
            const width = 100 - ((RATING_SCALE.indexOf({ rating, min, max })) * 12);
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className={`w-6 font-bold ${colors.text}`}>{rating}</span>
                <div className="flex-1 relative">
                  <div 
                    className="h-5 bg-gray-100 rounded-r"
                    style={{ width: `${width}%` }}
                  >
                    <div 
                      className={`h-full rounded-r transition-all duration-500 ${colors.bar} ${
                        isActive ? 'opacity-100' : 'opacity-60'
                      }`}
                      style={{ 
                        width: isActive ? `${(activeScore - min) / (max - min) * 100}%` : '100%'
                      }}
                    />
                  </div>
                  {isActive && (
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white border-2 border-gray-900 rounded-full flex items-center justify-center text-sm font-bold shadow-md"
                      style={{ left: `${((activeScore - min) / (max - min)) * 100}%` }}
                    >
                      {activeScore}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 w-12 text-right">{max}+</span>
              </div>
            );
          })}
        </div>

        {/* Cost Estimates */}
        {(epc.estimatedCosts || epc.potentialCosts) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              Estimated Energy Costs
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {activeTab === "current" && epc.estimatedCosts && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5" />
                        Heating
                      </span>
                      <span className="font-medium">{epc.estimatedCosts.heating}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Lighting
                      </span>
                      <span className="font-medium">{epc.estimatedCosts.lighting}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5" />
                        Hot Water
                      </span>
                      <span className="font-medium">{epc.estimatedCosts.hotWater}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center border-l border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Total per year</p>
                      <p className="text-2xl font-bold text-gray-900">{epc.estimatedCosts.total}</p>
                    </div>
                  </div>
                </>
              )}
              {activeTab === "potential" && epc.potentialCosts && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5" />
                        Heating
                      </span>
                      <span className="font-medium">{epc.potentialCosts.heating}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Lighting
                      </span>
                      <span className="font-medium">{epc.potentialCosts.lighting}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5" />
                        Hot Water
                      </span>
                      <span className="font-medium">{epc.potentialCosts.hotWater}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center border-l border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Potential savings</p>
                      <p className="text-2xl font-bold text-green-600">
                        {epc.estimatedCosts && epc.potentialCosts && (
                          `£${parseInt(epc.estimatedCosts.total.replace(/[^0-9]/g, '')) - parseInt(epc.potentialCosts.total.replace(/[^0-9]/g, ''))}`
                        )}
                      </p>
                      <p className="text-xs text-green-600">per year</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Improvements Section */}
        {epc.improvements && epc.improvements.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowImprovements(!showImprovements)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-semibold text-gray-900">Recommended Improvements</span>
              {showImprovements ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            <AnimatePresence>
              {showImprovements && (
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
                        className="bg-blue-50 rounded-lg p-3 text-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">{improvement.description}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Save {improvement.annualSavings}/year
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-600">
                          <span>Est. cost: {improvement.cost}</span>
                          <span>Rating: {improvement.ratingImprovement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Info & Certificate Link */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Info className="h-4 w-4" />
            <span>Based on standard assumptions</span>
          </div>
          {epc.certificateUrl && (
            <Button variant="outline" size="sm" className="ml-auto" asChild>
              <a href={epc.certificateUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-1.5" />
                View Certificate
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
