"use client";

import { useState, useMemo } from "react";
import { PoundSterling, TrendingUp, TrendingDown, Percent, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateYield,
  formatCurrency,
  formatPercent,
  parseCurrencyInput,
} from "@/lib/calculations";
import {
  actionPrimary,
  actionSecondary,
  eyebrow,
  fieldControl,
  fieldHelp,
  fieldLabel,
  formPanel,
  segmented,
  segmentedOption,
} from "@/components/ui/form-styles";
import Link from "next/link";

const figure = "font-display font-light leading-none tracking-[-0.02em] text-banc-dark-deep";
const panelHeading = "mb-4 text-lg font-semibold text-banc-dark-deep";
const panelBlock = "mt-6 border-t border-banc-dark/15 pt-6";
const poundIcon = "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-banc-muted-readable";

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
      <div className={cn(formPanel, className)}>
        <div className="space-y-5">
          <div>
            <label className={fieldLabel}>Property Price</label>
            <div className="relative">
              <PoundSterling className={poundIcon} />
              <input
                type="text"
                value={propertyPrice}
                onChange={formatInput(setPropertyPrice)}
                onBlur={() => formatCurrencyDisplay(propertyPrice, setPropertyPrice)}
                placeholder="e.g. £400,000"
                className={cn(fieldControl, "pl-11")}
              />
            </div>
          </div>

          <div>
            <label className={fieldLabel}>Monthly Rent</label>
            <div className="relative">
              <PoundSterling className={poundIcon} />
              <input
                type="text"
                value={monthlyRent}
                onChange={formatInput(setMonthlyRent)}
                onBlur={() => formatCurrencyDisplay(monthlyRent, setMonthlyRent)}
                placeholder="e.g. £1,500"
                className={cn(fieldControl, "pl-11")}
              />
            </div>
          </div>

          {propertyPriceNum > 0 && monthlyRentNum > 0 && (
            <div className="border-t border-banc-dark/15 pt-5">
              <p className={eyebrow}>Gross Yield</p>
              <p className={cn(figure, "mt-3 text-4xl")}>
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
      <div className={formPanel}>
        <h3 className="mb-6 text-lg font-semibold text-banc-dark-deep">Investment Details</h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Property Price */}
          <div>
            <label className={fieldLabel}>Property Price / Value</label>
            <div className="relative">
              <PoundSterling className={poundIcon} />
              <input
                type="text"
                value={propertyPrice}
                onChange={formatInput(setPropertyPrice)}
                onBlur={() => formatCurrencyDisplay(propertyPrice, setPropertyPrice)}
                placeholder="e.g. £400,000"
                className={cn(fieldControl, "pl-11")}
              />
            </div>
          </div>

          {/* Monthly Rent */}
          <div>
            <label className={fieldLabel}>Monthly Rent</label>
            <div className="relative">
              <PoundSterling className={poundIcon} />
              <input
                type="text"
                value={monthlyRent}
                onChange={formatInput(setMonthlyRent)}
                onBlur={() => formatCurrencyDisplay(monthlyRent, setMonthlyRent)}
                placeholder="e.g. £1,500"
                className={cn(fieldControl, "pl-11")}
              />
            </div>
          </div>

          {/* Annual Costs */}
          <div>
            <label className={fieldLabel}>Annual Operating Costs</label>
            <div className="relative">
              <PoundSterling className={poundIcon} />
              <input
                type="text"
                value={annualCosts}
                onChange={formatInput(setAnnualCosts)}
                onBlur={() => formatCurrencyDisplay(annualCosts, setAnnualCosts)}
                placeholder="e.g. £3,000"
                className={cn(fieldControl, "pl-11")}
              />
            </div>
            <p className={fieldHelp}>
              Maintenance, void periods, insurance, management fees
            </p>
          </div>

          {/* Include Mortgage Toggle */}
          <div>
            <label className={fieldLabel}>Include Mortgage?</label>
            <div className={segmented}>
              <button
                onClick={() => setIncludeMortgage(false)}
                className={cn(segmentedOption(!includeMortgage), "px-2 sm:px-4")}
              >
                Cash Purchase
              </button>
              <button
                onClick={() => setIncludeMortgage(true)}
                className={cn(segmentedOption(includeMortgage), "px-2 sm:px-4")}
              >
                Mortgage Included
              </button>
            </div>
          </div>
        </div>

        {/* Mortgage Details */}
        {includeMortgage && (
          <div className="mt-6 grid gap-6 border-t border-banc-dark/15 pt-6 md:grid-cols-2">
            <div>
              <label className={fieldLabel}>Mortgage Amount</label>
              <div className="relative">
                <PoundSterling className={poundIcon} />
                <input
                  type="text"
                  value={mortgageAmount}
                  onChange={formatInput(setMortgageAmount)}
                  onBlur={() => formatCurrencyDisplay(mortgageAmount, setMortgageAmount)}
                  placeholder="e.g. £300,000"
                  className={cn(fieldControl, "pl-11")}
                />
              </div>
            </div>
            <div>
              <label className={fieldLabel}>Mortgage Interest Rate</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={mortgageRate}
                  onChange={(e) => setMortgageRate(Number(e.target.value))}
                  placeholder="e.g. 5.5"
                  className={cn(fieldControl, "pr-11")}
                />
                <Percent className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-banc-muted-readable" />
              </div>
            </div>
          </div>
        )}

        {/* Default Costs Suggestion */}
        {defaultCosts && annualCosts === "" && (
          <div className="mt-6 border-t border-banc-dark/15 pt-6">
            <p className="text-sm leading-relaxed text-banc-muted-readable">
              Based on your rent, typical annual costs would be approximately{" "}
              <strong className="text-banc-dark-deep">{formatCurrency(defaultCosts.total)}</strong>:
              <br />
              • Void allowance (5%): {formatCurrency(defaultCosts.voids)}
              <br />
              • Maintenance (10%): {formatCurrency(defaultCosts.maintenance)}
              <br />• Management (10%): {formatCurrency(defaultCosts.management)}
              <br />• Insurance: {formatCurrency(defaultCosts.insurance)}
            </p>
            <button
              onClick={() => setAnnualCosts(formatCurrency(defaultCosts.total))}
              className={cn(actionSecondary, "mt-4")}
            >
              Use these values
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {propertyPriceNum > 0 && monthlyRentNum > 0 && (
        <>
          <div className={formPanel}>
            {/* Main Results */}
            <p className={eyebrow}>Gross Yield</p>
            <p className={cn(figure, "mt-3 text-[clamp(44px,11vw,64px)]")}>
              {formatPercent(result.grossYield)}
            </p>
            <p className={fieldHelp}>Before costs</p>

            <dl
              className={cn(
                "mt-6 grid border-t border-banc-dark/15 sm:gap-x-8",
                includeMortgage && result.roi !== undefined ? "sm:grid-cols-3" : "sm:grid-cols-2"
              )}
            >
              <div className="border-b border-banc-dark/15 py-4 sm:border-b-0 sm:pb-0">
                <dt className="text-sm text-banc-muted-readable">Net Yield</dt>
                <dd className="mt-1 text-xl font-medium text-banc-dark-deep">{formatPercent(result.netYield)}</dd>
                <dd className="text-xs text-banc-muted-readable">After operating costs</dd>
              </div>
              <div className="border-b border-banc-dark/15 py-4 last:border-b-0 last:pb-0 sm:border-b-0 sm:pb-0">
                <dt className="text-sm text-banc-muted-readable">Annual Income</dt>
                <dd className="mt-1 text-xl font-medium text-banc-dark-deep">{formatCurrency(result.netIncome)}</dd>
                <dd className="text-xs text-banc-muted-readable">Net after costs</dd>
              </div>
              {includeMortgage && result.roi !== undefined && (
                <div className="pt-4">
                  <dt className="text-sm text-banc-muted-readable">ROI</dt>
                  <dd
                    className={cn(
                      "mt-1 text-xl font-medium",
                      result.roi > 0 ? "text-green-700" : "text-red-700"
                    )}
                  >
                    {formatPercent(result.roi)}
                  </dd>
                  <dd className="text-xs text-banc-muted-readable">Return on investment</dd>
                </div>
              )}
            </dl>

            {/* Cash Flow Analysis */}
            {includeMortgage && result.cashFlow !== undefined && (
              <div className={panelBlock}>
                <h3 className={panelHeading}>Cash Flow Analysis</h3>
                <dl className="grid gap-5 sm:grid-cols-3 sm:gap-x-8">
                  <div>
                    <dt className="text-sm text-banc-muted-readable">Monthly Rent</dt>
                    <dd className="mt-1 text-xl font-medium text-green-700">
                      +{formatCurrency(monthlyRentNum)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-banc-muted-readable">Monthly Costs</dt>
                    <dd className="mt-1 text-xl font-medium text-red-700">
                      -{formatCurrency(annualCostsNum / 12 + (mortgageAmountNum * (mortgageRate / 100)) / 12)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-banc-muted-readable">Monthly Cash Flow</dt>
                    <dd
                      className={cn(
                        "mt-1 text-xl font-semibold",
                        result.cashFlow >= 0 ? "text-green-700" : "text-red-700"
                      )}
                    >
                      {result.cashFlow >= 0 ? "+" : ""}
                      {formatCurrency(result.cashFlow / 12)}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Yield Breakdown */}
            <div className={panelBlock}>
              <h3 className={panelHeading}>Income Breakdown</h3>
              <div className="divide-y divide-banc-dark/15 border-y border-banc-dark/15">
                <div className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 flex-shrink-0 text-green-700" />
                    <span className="text-banc-dark-deep">Annual Rental Income</span>
                  </div>
                  <p className="text-lg font-medium text-green-700">
                    +{formatCurrency(result.annualRent)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 flex-shrink-0 text-red-700" />
                    <span className="text-banc-dark-deep">Annual Operating Costs</span>
                  </div>
                  <p className="text-lg font-medium text-red-700">
                    -{formatCurrency(result.annualCosts)}
                  </p>
                </div>
                {includeMortgage && mortgageAmountNum > 0 && mortgageRate > 0 && (
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="h-5 w-5 flex-shrink-0 text-red-700" />
                      <span className="text-banc-dark-deep">Annual Mortgage Interest</span>
                    </div>
                    <p className="text-lg font-medium text-red-700">
                      -{formatCurrency((mortgageAmountNum * mortgageRate) / 100)}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 flex-shrink-0 text-banc-focus" />
                    <span className="font-semibold text-banc-dark-deep">Net Annual Income</span>
                  </div>
                  <p className="text-lg font-semibold text-banc-dark-deep">
                    {formatCurrency(result.netIncome)}
                  </p>
                </div>
              </div>
            </div>

            {/* Investment Assessment */}
            <div className={panelBlock}>
              <h3 className={panelHeading}>Investment Assessment</h3>
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
                <div
                  className={cn(
                    "border-l-2 pl-4",
                    result.grossYield >= 8
                      ? "border-green-600"
                      : result.grossYield >= 5
                      ? "border-amber-500"
                      : "border-red-600"
                  )}
                >
                  <p className="font-medium text-banc-dark-deep">Gross Yield Rating</p>
                  <p className="mt-1 text-sm text-banc-muted-readable">
                    {result.grossYield >= 8
                      ? "Excellent - Strong cash flow potential"
                      : result.grossYield >= 5
                      ? "Good - Solid investment potential"
                      : "Lower - May rely on capital appreciation"}
                  </p>
                </div>
                <div
                  className={cn(
                    "border-l-2 pl-4",
                    result.netYield >= 5
                      ? "border-green-600"
                      : result.netYield >= 3
                      ? "border-amber-500"
                      : "border-red-600"
                  )}
                >
                  <p className="font-medium text-banc-dark-deep">Net Yield Rating</p>
                  <p className="mt-1 text-sm text-banc-muted-readable">
                    {result.netYield >= 5
                      ? "Excellent - Strong returns after costs"
                      : result.netYield >= 3
                      ? "Good - Reasonable returns"
                      : "Lower - Consider reducing costs or increasing rent"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className={actionPrimary}>
              Get Lettings Advice
            </Link>
            <Link href="/sales/properties" className={actionSecondary}>
              Browse Investment Properties
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default YieldCalculator;
