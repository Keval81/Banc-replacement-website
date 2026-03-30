"use client";

import { useState, useMemo } from "react";
import { Calculator, PoundSterling, Home, Building2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateStampDuty,
  formatCurrency,
  formatPercent,
  parseCurrencyInput,
  type BuyerType,
  type Location,
} from "@/lib/calculations";
import { Button } from "@/components/ui/button";

interface StampDutyCalculatorProps {
  className?: string;
  compact?: boolean;
}

export function StampDutyCalculator({ className, compact = false }: StampDutyCalculatorProps) {
  const [price, setPrice] = useState<string>("");
  const [buyerType, setBuyerType] = useState<BuyerType>("home-mover");
  const [location, setLocation] = useState<Location>("england");

  const priceNum = parseCurrencyInput(price);

  const result = useMemo(
    () => calculateStampDuty(priceNum, buyerType, location),
    [priceNum, buyerType, location]
  );

  // Calculate comparison results
  const ftbResult = useMemo(
    () => calculateStampDuty(priceNum, "first-time", location),
    [priceNum, location]
  );
  const moverResult = useMemo(
    () => calculateStampDuty(priceNum, "home-mover", location),
    [priceNum, location]
  );
  const investorResult = useMemo(
    () => calculateStampDuty(priceNum, "additional-property", location),
    [priceNum, location]
  );

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and basic formatting
    if (/^[\d,£]*$/.test(value)) {
      setPrice(value);
    }
  };

  const formatPriceDisplay = () => {
    if (!price) return "";
    const num = parseCurrencyInput(price);
    if (num > 0) {
      setPrice(formatCurrency(num));
    }
  };

  if (compact) {
    return (
      <div className={cn("rounded-xl border border-white/10 bg-[#1A1917] p-4", className)}>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/60">Property Price</label>
            <div className="relative">
              <PoundSterling className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={price}
                onChange={handlePriceChange}
                onBlur={formatPriceDisplay}
                placeholder="e.g. £500,000"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-9 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#4AC8E8] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBuyerType("first-time")}
              className={cn(
                "rounded-lg border px-2 py-2 text-xs transition-all",
                buyerType === "first-time"
                  ? "border-[#4AC8E8] bg-[#4AC8E8]/10 text-[#4AC8E8]"
                  : "border-white/10 text-white/70 hover:border-white/20"
              )}
            >
              First-time
            </button>
            <button
              onClick={() => setBuyerType("home-mover")}
              className={cn(
                "rounded-lg border px-2 py-2 text-xs transition-all",
                buyerType === "home-mover"
                  ? "border-[#4AC8E8] bg-[#4AC8E8]/10 text-[#4AC8E8]"
                  : "border-white/10 text-white/70 hover:border-white/20"
              )}
            >
              Mover
            </button>
          </div>

          {priceNum > 0 && (
            <div className="rounded-lg bg-[#4AC8E8]/10 p-3 text-center">
              <p className="text-xs text-white/60">Stamp Duty</p>
              <p className="text-lg font-semibold text-[#4AC8E8]">
                {formatCurrency(result.totalTax)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Input Section */}
      <div className="rounded-2xl border border-white/10 bg-[#1A1917] p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Calculator className="h-5 w-5 text-[#4AC8E8]" />
          Calculator Settings
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Property Price */}
          <div>
            <label className="mb-2 block text-sm text-white/70">Property Price</label>
            <div className="relative">
              <PoundSterling className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={price}
                onChange={handlePriceChange}
                onBlur={formatPriceDisplay}
                placeholder="e.g. £500,000"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-lg text-white placeholder:text-white/30 focus:border-[#4AC8E8] focus:outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm text-white/70">Location</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "england", label: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
                { value: "scotland", label: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
                { value: "wales", label: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
              ].map((loc) => (
                <button
                  key={loc.value}
                  onClick={() => setLocation(loc.value as Location)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm transition-all",
                    location === loc.value
                      ? "border-[#4AC8E8] bg-[#4AC8E8]/10 text-[#4AC8E8]"
                      : "border-white/10 text-white/70 hover:border-white/20"
                  )}
                >
                  <span className="mr-1">{loc.flag}</span>
                  {loc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buyer Type */}
        <div className="mt-6">
          <label className="mb-2 block text-sm text-white/70">Buyer Type</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                value: "first-time",
                label: "First-time Buyer",
                icon: Home,
                desc: "No previous property ownership",
              },
              {
                value: "home-mover",
                label: "Home Mover",
                icon: Building2,
                desc: "Selling current home to buy new",
              },
              {
                value: "additional-property",
                label: "Additional Property",
                icon: Building2,
                desc: "Buy-to-let or second home",
              },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setBuyerType(type.value as BuyerType)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                  buyerType === type.value
                    ? "border-[#4AC8E8] bg-[#4AC8E8]/10"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <type.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    buyerType === type.value ? "text-[#4AC8E8]" : "text-white/40"
                  )}
                />
                <div>
                  <p
                    className={cn(
                      "font-medium",
                      buyerType === type.value ? "text-[#4AC8E8]" : "text-white"
                    )}
                  >
                    {type.label}
                  </p>
                  <p className="text-xs text-white/50">{type.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {priceNum > 0 && (
        <>
          {/* Main Result */}
          <div className="rounded-2xl bg-gradient-to-br from-[#4AC8E8]/20 to-[#4AC8E8]/5 p-6 text-center">
            <p className="text-white/70">Stamp Duty Land Tax Due</p>
            <p className="my-2 text-4xl font-bold text-[#4AC8E8]">
              {formatCurrency(result.totalTax)}
            </p>
            <p className="text-sm text-white/60">
              Effective tax rate: {formatPercent(result.effectiveRate)}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="rounded-2xl border border-white/10 bg-[#1A1917] p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Buyer Type Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 text-left text-sm font-medium text-white/60">Buyer Type</th>
                    <th className="py-3 text-right text-sm font-medium text-white/60">Stamp Duty</th>
                    <th className="py-3 text-right text-sm font-medium text-white/60">Effective Rate</th>
                    <th className="py-3 text-right text-sm font-medium text-white/60">vs. Current</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: "first-time", label: "First-time Buyer", result: ftbResult },
                    { type: "home-mover", label: "Home Mover", result: moverResult },
                    { type: "additional-property", label: "Additional Property", result: investorResult },
                  ].map((row) => (
                    <tr
                      key={row.type}
                      className={cn(
                        "border-b border-white/5",
                        buyerType === row.type && "bg-[#4AC8E8]/5"
                      )}
                    >
                      <td className="py-3 text-sm text-white">{row.label}</td>
                      <td className="py-3 text-right text-sm font-medium text-white">
                        {formatCurrency(row.result.totalTax)}
                      </td>
                      <td className="py-3 text-right text-sm text-white/70">
                        {formatPercent(row.result.effectiveRate)}
                      </td>
                      <td className="py-3 text-right text-sm">
                        {row.type === buyerType ? (
                          <span className="text-[#4AC8E8]">Current</span>
                        ) : (
                          <span
                            className={
                              row.result.totalTax > result.totalTax
                                ? "text-red-400"
                                : "text-green-400"
                            }
                          >
                            {row.result.totalTax > result.totalTax ? "+" : "-"}
                            {formatCurrency(Math.abs(row.result.totalTax - result.totalTax))}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Breakdown Table */}
          {result.breakdown.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#1A1917] p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Tax Breakdown by Band</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 text-left text-sm font-medium text-white/60">Tax Band</th>
                      <th className="py-3 text-right text-sm font-medium text-white/60">Rate</th>
                      <th className="py-3 text-right text-sm font-medium text-white/60">
                        Amount in Band
                      </th>
                      <th className="py-3 text-right text-sm font-medium text-white/60">Tax Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((band, index) => (
                      <tr key={index} className="border-b border-white/5">
                        <td className="py-3 text-sm text-white">{band.band}</td>
                        <td className="py-3 text-right text-sm text-white/70">
                          {formatPercent(band.rate * 100, 0)}
                        </td>
                        <td className="py-3 text-right text-sm text-white/70">
                          {formatCurrency(band.amountInBand)}
                        </td>
                        <td className="py-3 text-right text-sm font-medium text-[#4AC8E8]">
                          {formatCurrency(band.tax)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#4AC8E8]/10 font-semibold">
                      <td className="py-3 text-sm text-white">Total</td>
                      <td className="py-3"></td>
                      <td className="py-3"></td>
                      <td className="py-3 text-right text-sm text-[#4AC8E8]">
                        {formatCurrency(result.totalTax)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Visual Band Chart */}
          <div className="rounded-2xl border border-white/10 bg-[#1A1917] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Info className="h-5 w-5 text-[#4AC8E8]" />
              Tax Rate Bands ({location === "england" ? "England & NI" : location === "scotland" ? "Scotland" : "Wales"})
            </h3>
            <div className="space-y-3">
              {result.breakdown.map((band, index) => {
                const maxAmount = result.breakdown[0]?.amountInBand || 1;
                const width = Math.min((band.amountInBand / priceNum) * 100 * 3, 100);
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 flex-shrink-0 text-sm text-white/70">{band.band}</div>
                    <div className="flex-1">
                      <div className="h-6 rounded-full bg-white/5">
                        <div
                          className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-[#4AC8E8] to-[#1A9BBF] px-2 text-xs text-white transition-all"
                          style={{ width: `${Math.max(width, 5)}%` }}
                        >
                          {formatPercent(band.rate * 100, 0)}
                        </div>
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm text-white/60">
                      {formatCurrency(band.tax)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => {
                const data = {
                  price: priceNum,
                  buyerType,
                  location,
                  tax: result.totalTax,
                  date: new Date().toISOString(),
                };
                localStorage.setItem("stampDutyCalculation", JSON.stringify(data));
                alert("Calculation saved!");
              }}
            >
              Save Calculation
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default StampDutyCalculator;
