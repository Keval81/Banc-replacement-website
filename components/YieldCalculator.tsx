"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  PoundSterling,
  TrendingUp,
  TrendingDown,
  Home,
  Wrench,
  Percent,
  Wallet,
  PieChart,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateYield,
  formatCurrency,
  formatPercent,
  parseCurrencyInput,
} from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface YieldCalculatorProps {
  className?: string;
  compact?: boolean;
}

export function YieldCalculator({ className, compact = false }: YieldCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState<string>("");
  const [monthlyRent, setMonthlyRent] = useState<string>("");
  const [annualCosts, setAnnualCosts] = useState<string>("");
  const [mortgageAmount, setMortgageAmount] = useState<string>("");
  const [mortgageRate, setMortgageRate] = useState<number>(0);
  const [includeMortgage, setIncludeMortgage] = useState(false);

  const propertyPriceNum = parseCurrencyInput(propertyPrice);
  const monthlyRentNum = parseCurrencyInput(monthlyRent);
  const annualCostsNum = parseCurrencyInput(annualCosts);
  const mortgageAmountNum = parseCurrencyInput(mortgageAmount);

  const result = useMemo(
    () =>
      calculateYield(
        propertyPriceNum,
        monthlyRentNum,
        annualCostsNum,
        includeMortgage ? mortgageAmountNum : undefined,
        includeMortgage ? mortgageRate : undefined
      ),
    [propertyPriceNum, monthlyRentNum, annualCostsNum, mortgageAmountNum, mortgageRate, includeMortgage]
  );

  const formatInput = (setter: (val: string) => void) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^[\d,£]*$/.test(value)) {
        setter(value);
      }
    };
  };

  const formatCurrencyDisplay = (value: string, setter: (val: string) => void) => {
    const num = parseCurrencyInput(value);
    if (num > 0) {
      setter(formatCurrency(num));
    }
  };

  // Default cost calculations
  const defaultCosts = useMemo(() => {
    if (monthlyRentNum > 0) {
      const annualRent = monthlyRentNum * 12;
      return {
        voids: annualRent * 0.05, // 5% void allowance
        maintenance: annualRent * 0.1, // 10% maintenance
        management: annualRent * 0.1, // 10% management
        insurance: 500,
        total: annualRent * 0.25 + 500,
      };
    }
    return null;
  }, [monthlyRentNum]);

  if (compact) {
    return (
      <div className={cn("rounded-xl border border-white/10 bg-[#2C2F33] p-4", className)}>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/60">Property Price</label>
            <div className="relative">
              <PoundSterling className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={propertyPrice}
                onChange={formatInput(setPropertyPrice)}
                onBlur={() => formatCurrencyDisplay(propertyPrice, setPropertyPrice)}
                placeholder="e.g. £400,000"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-9 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#1DBFDD] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/60">Monthly Rent</label>
            <div className="relative">
              <PoundSterling className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={monthlyRent}
                onChange={formatInput(setMonthlyRent)}
                onBlur={() => formatCurrencyDisplay(monthlyRent, setMonthlyRent)}
                placeholder="e.g. £1,500"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-9 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#1DBFDD] focus:outline-none"
              />
            </div>
          </div>

          {propertyPriceNum > 0 && monthlyRentNum > 0 && (
            <div className="rounded-lg bg-[#1DBFDD]/10 p-3 text-center">
              <p className="text-xs text-white/60">Gross Yield</p>
              <p className="text-lg font-semibold text-[#1DBFDD]">
                {formatPercent(result.grossYield)}
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
      <div className="rounded-2xl border border-white/10 bg-[#2C2F33] p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Calculator className="h-5 w-5 text-[#1DBFDD]" />
          Investment Details
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Property Price */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
              <Home className="h-4 w-4" />
              Property Price / Value
            </label>
            <div className="relative">
              <PoundSterling className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={propertyPrice}
                onChange={formatInput(setPropertyPrice)}
                onBlur={() => formatCurrencyDisplay(propertyPrice, setPropertyPrice)}
                placeholder="e.g. £400,000"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-lg text-white placeholder:text-white/30 focus:border-[#1DBFDD] focus:outline-none"
              />
            </div>
          </div>

          {/* Monthly Rent */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
              <PoundSterling className="h-4 w-4" />
              Monthly Rent
            </label>
            <div className="relative">
              <PoundSterling className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={monthlyRent}
                onChange={formatInput(setMonthlyRent)}
                onBlur={() => formatCurrencyDisplay(monthlyRent, setMonthlyRent)}
                placeholder="e.g. £1,500"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-lg text-white placeholder:text-white/30 focus:border-[#1DBFDD] focus:outline-none"
              />
            </div>
          </div>

          {/* Annual Costs */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
              <Wrench className="h-4 w-4" />
              Annual Operating Costs
            </label>
            <div className="relative">
              <PoundSterling className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={annualCosts}
                onChange={formatInput(setAnnualCosts)}
                onBlur={() => formatCurrencyDisplay(annualCosts, setAnnualCosts)}
                placeholder="e.g. £3,000"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-lg text-white placeholder:text-white/30 focus:border-[#1DBFDD] focus:outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-white/40">
              Maintenance, void periods, insurance, management fees
            </p>
          </div>

          {/* Include Mortgage Toggle */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
              <Percent className="h-4 w-4" />
              Include Mortgage?
            </label>
            <button
              onClick={() => setIncludeMortgage(!includeMortgage)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                includeMortgage
                  ? "border-[#1DBFDD] bg-[#1DBFDD]/10"
                  : "border-white/10 hover:border-white/20"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-11 items-center rounded-full transition-colors",
                  includeMortgage ? "bg-[#1DBFDD]" : "bg-white/20"
                )}
              >
                <div
                  className={cn(
                    "h-5 w-5 rounded-full bg-white transition-transform",
                    includeMortgage ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </div>
              <span className={includeMortgage ? "text-[#1DBFDD]" : "text-white/70"}>
                {includeMortgage ? "Mortgage Included" : "Cash Purchase"}
              </span>
            </button>
          </div>
        </div>

        {/* Mortgage Details */}
        {includeMortgage && (
          <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/70">Mortgage Amount</label>
              <div className="relative">
                <PoundSterling className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={mortgageAmount}
                  onChange={formatInput(setMortgageAmount)}
                  onBlur={() => formatCurrencyDisplay(mortgageAmount, setMortgageAmount)}
                  placeholder="e.g. £300,000"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-lg text-white placeholder:text-white/30 focus:border-[#1DBFDD] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">Mortgage Interest Rate</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={mortgageRate}
                  onChange={(e) => setMortgageRate(Number(e.target.value))}
                  placeholder="e.g. 5.5"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white placeholder:text-white/30 focus:border-[#1DBFDD] focus:outline-none"
                />
                <Percent className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              </div>
            </div>
          </div>
        )}

        {/* Default Costs Suggestion */}
        {defaultCosts && annualCosts === "" && (
          <div className="mt-4 rounded-xl border border-[#1DBFDD]/30 bg-[#1DBFDD]/10 p-4">
            <p className="flex items-start gap-2 text-sm text-white/70">
              <Info className="h-5 w-5 flex-shrink-0 text-[#1DBFDD]" />
              <span>
                Based on your rent, typical annual costs would be approximately{" "}
                <strong className="text-[#1DBFDD]">{formatCurrency(defaultCosts.total)}</strong>:
                <br />
                • Void allowance (5%): {formatCurrency(defaultCosts.voids)}
                <br />
                • Maintenance (10%): {formatCurrency(defaultCosts.maintenance)}
                <br />• Management (10%): {formatCurrency(defaultCosts.management)}
                <br />• Insurance: {formatCurrency(defaultCosts.insurance)}
              </span>
            </p>
            <button
              onClick={() => setAnnualCosts(formatCurrency(defaultCosts.total))}
              className="mt-2 text-sm text-[#1DBFDD] hover:underline"
            >
              Use these values
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {propertyPriceNum > 0 && monthlyRentNum > 0 && (
        <>
          {/* Main Results */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#2C2F33] p-5 text-center">
              <p className="text-sm text-white/60">Gross Yield</p>
              <p className="my-1 text-2xl font-bold text-[#1DBFDD]">{formatPercent(result.grossYield)}</p>
              <p className="text-xs text-white/40">Before costs</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#2C2F33] p-5 text-center">
              <p className="text-sm text-white/60">Net Yield</p>
              <p className="my-1 text-2xl font-bold text-white">{formatPercent(result.netYield)}</p>
              <p className="text-xs text-white/40">After operating costs</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#2C2F33] p-5 text-center">
              <p className="text-sm text-white/60">Annual Income</p>
              <p className="my-1 text-2xl font-bold text-white">{formatCurrency(result.netIncome)}</p>
              <p className="text-xs text-white/40">Net after costs</p>
            </div>
            {includeMortgage && result.roi !== undefined && (
              <div className="rounded-2xl border border-white/10 bg-[#2C2F33] p-5 text-center">
                <p className="text-sm text-white/60">ROI</p>
                <p
                  className={cn(
                    "my-1 text-2xl font-bold",
                    result.roi > 0 ? "text-green-400" : "text-red-400"
                  )}
                >
                  {formatPercent(result.roi)}
                </p>
                <p className="text-xs text-white/40">Return on investment</p>
              </div>
            )}
          </div>

          {/* Cash Flow Analysis */}
          {includeMortgage && result.cashFlow !== undefined && (
            <div className="rounded-2xl border border-white/10 bg-[#2C2F33] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Wallet className="h-5 w-5 text-[#1DBFDD]" />
                Cash Flow Analysis
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white/5 p-4 text-center">
                  <p className="text-sm text-white/60">Monthly Rent</p>
                  <p className="my-1 text-xl font-bold text-green-400">
                    +{formatCurrency(monthlyRentNum)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 text-center">
                  <p className="text-sm text-white/60">Monthly Costs</p>
                  <p className="my-1 text-xl font-bold text-red-400">
                    -{formatCurrency(annualCostsNum / 12 + (mortgageAmountNum * (mortgageRate / 100)) / 12)}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-xl p-4 text-center",
                    result.cashFlow >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                  )}
                >
                  <p className="text-sm text-white/60">Monthly Cash Flow</p>
                  <p
                    className={cn(
                      "my-1 text-xl font-bold",
                      result.cashFlow >= 0 ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {result.cashFlow >= 0 ? "+" : ""}
                    {formatCurrency(result.cashFlow / 12)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Yield Breakdown */}
          <div className="rounded-2xl border border-white/10 bg-[#2C2F33] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <PieChart className="h-5 w-5 text-[#1DBFDD]" />
              Income Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="text-white">Annual Rental Income</span>
                </div>
                <p className="text-lg font-semibold text-green-400">
                  +{formatCurrency(result.annualRent)}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                  <span className="text-white">Annual Operating Costs</span>
                </div>
                <p className="text-lg font-semibold text-red-400">
                  -{formatCurrency(result.annualCosts)}
                </p>
              </div>
              {includeMortgage && mortgageAmountNum > 0 && mortgageRate > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                    <span className="text-white">Annual Mortgage Interest</span>
                  </div>
                  <p className="text-lg font-semibold text-red-400">
                    -{formatCurrency((mortgageAmountNum * mortgageRate) / 100)}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between rounded-xl bg-[#1DBFDD]/10 p-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-[#1DBFDD]" />
                  <span className="font-medium text-white">Net Annual Income</span>
                </div>
                <p className="text-lg font-semibold text-[#1DBFDD]">
                  {formatCurrency(result.netIncome)}
                </p>
              </div>
            </div>
          </div>

          {/* Investment Assessment */}
          <div className="rounded-2xl border border-white/10 bg-[#2C2F33] p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Investment Assessment</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className={cn(
                  "rounded-xl border p-4",
                  result.grossYield >= 8
                    ? "border-green-500/30 bg-green-500/10"
                    : result.grossYield >= 5
                    ? "border-yellow-500/30 bg-yellow-500/10"
                    : "border-red-500/30 bg-red-500/10"
                )}
              >
                <p className="font-medium text-white">Gross Yield Rating</p>
                <p className="text-sm text-white/70">
                  {result.grossYield >= 8
                    ? "Excellent - Strong cash flow potential"
                    : result.grossYield >= 5
                    ? "Good - Solid investment potential"
                    : "Lower - May rely on capital appreciation"}
                </p>
              </div>
              <div
                className={cn(
                  "rounded-xl border p-4",
                  result.netYield >= 5
                    ? "border-green-500/30 bg-green-500/10"
                    : result.netYield >= 3
                    ? "border-yellow-500/30 bg-yellow-500/10"
                    : "border-red-500/30 bg-red-500/10"
                )}
              >
                <p className="font-medium text-white">Net Yield Rating</p>
                <p className="text-sm text-white/70">
                  {result.netYield >= 5
                    ? "Excellent - Strong returns after costs"
                    : result.netYield >= 3
                    ? "Good - Reasonable returns"
                    : "Lower - Consider reducing costs or increasing rent"}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/contact">
              <Button className="w-full bg-[#1DBFDD] text-white hover:bg-[#0E8CAB] sm:w-auto">
                Get Lettings Advice
              </Button>
            </Link>
            <Link href="/sales/properties">
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 sm:w-auto"
              >
                Browse Investment Properties
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default YieldCalculator;
