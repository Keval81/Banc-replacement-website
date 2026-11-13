"use client";

import { useState, useMemo } from "react";
import { PoundSterling, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateMortgage,
  generateAmortizationSchedule,
  formatCurrency,
  formatPercent,
  parseCurrencyInput,
  type RepaymentType,
} from "@/lib/calculations";
import {
  actionPrimary,
  actionSecondary,
  choiceChip,
  eyebrow,
  fieldControl,
  fieldHelp,
  fieldLabel,
  formPanel,
  segmented,
  segmentedOption,
} from "@/components/ui/form-styles";
import Link from "next/link";

const REPAYMENT_OPTIONS: { value: RepaymentType; label: string; desc: string }[] = [
  {
    value: "repayment",
    label: "Capital & Interest",
    desc: "Pay off the loan + interest each month",
  },
  {
    value: "interest-only",
    label: "Interest Only",
    desc: "Pay only interest, owe full amount at end",
  },
];

const figure = "font-display font-light leading-none tracking-[-0.02em] text-banc-dark-deep";
const panelHeading = "mb-6 text-lg font-semibold text-banc-dark-deep";
const panelBlock = "mt-6 border-t border-banc-dark/15 pt-6";
const rangeControl = "h-11 w-full cursor-pointer accent-banc-focus";
const poundIcon = "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-banc-muted-readable";

interface MortgageCalculatorProps {
  className?: string;
  compact?: boolean;
}

export function MortgageCalculator({ className, compact = false }: MortgageCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState<string>("");
  const [deposit, setDeposit] = useState<string>("");
  const [depositPercent, setDepositPercent] = useState<number>(10);
  const [interestRate, setInterestRate] = useState<number>(4.5);
  const [termYears, setTermYears] = useState<number>(25);
  const [repaymentType, setRepaymentType] = useState<RepaymentType>("repayment");
  const [showAmortization, setShowAmortization] = useState(false);
  const [depositMode, setDepositMode] = useState<"amount" | "percent">("percent");

  const propertyPriceNum = parseCurrencyInput(propertyPrice);
  const depositNum = parseCurrencyInput(deposit);

  // Auto-calculate deposit based on percentage
  const effectiveDeposit = useMemo(() => {
    if (depositMode === "percent") {
      return (propertyPriceNum * depositPercent) / 100;
    }
    return depositNum;
  }, [depositMode, propertyPriceNum, depositPercent, depositNum]);

  const result = useMemo(
    () =>
      calculateMortgage(propertyPriceNum, effectiveDeposit, interestRate, termYears, repaymentType),
    [propertyPriceNum, effectiveDeposit, interestRate, termYears, repaymentType]
  );

  const schedule = useMemo(
    () => generateAmortizationSchedule(result.loanAmount, interestRate, termYears),
    [result.loanAmount, interestRate, termYears]
  );

  // Group schedule by year for display
  const yearlySchedule = useMemo(() => {
    const grouped: { year: number; principal: number; interest: number; balance: number }[] = [];
    schedule.forEach((entry) => {
      const existing = grouped.find((g) => g.year === entry.year);
      if (existing) {
        existing.principal += entry.principal;
        existing.interest += entry.interest;
        existing.balance = entry.balance;
      } else {
        grouped.push({
          year: entry.year,
          principal: entry.principal,
          interest: entry.interest,
          balance: entry.balance,
        });
      }
    });
    return grouped.slice(0, 10); // Show first 10 years
  }, [schedule]);

  const handleDepositPercentChange = (percent: number) => {
    setDepositPercent(percent);
    if (propertyPriceNum > 0) {
      setDeposit(formatCurrency((propertyPriceNum * percent) / 100));
    }
  };

  const handleDepositAmountChange = (value: string) => {
    setDeposit(value);
    if (propertyPriceNum > 0) {
      const num = parseCurrencyInput(value);
      setDepositPercent((num / propertyPriceNum) * 100);
    }
  };

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

  // Calculate pie chart data
  const pieData = useMemo(() => {
    const principal = result.loanAmount;
    const interest = result.totalInterest;
    const total = principal + interest;
    return {
      principalPercent: total > 0 ? (principal / total) * 100 : 0,
      interestPercent: total > 0 ? (interest / total) * 100 : 0,
    };
  }, [result]);

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
                placeholder="e.g. £500,000"
                className={cn(fieldControl, "pl-11")}
              />
            </div>
          </div>

          <div>
            <label className={fieldLabel}>Deposit ({depositPercent.toFixed(0)}%)</label>
            <input
              type="range"
              min="5"
              max="50"
              value={depositPercent}
              onChange={(e) => handleDepositPercentChange(Number(e.target.value))}
              className={rangeControl}
            />
          </div>

          <div>
            <label className={fieldLabel}>Interest Rate</label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setInterestRate(rate)}
                  className={cn(choiceChip(interestRate === rate), "px-2")}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          {propertyPriceNum > 0 && (
            <div className="border-t border-banc-dark/15 pt-5">
              <p className={eyebrow}>Monthly Payment</p>
              <p className={cn(figure, "mt-3 text-4xl")}>
                {formatCurrency(result.monthlyPayment)}
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
        <h3 className={panelHeading}>Mortgage Details</h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Property Price */}
          <div>
            <label className={fieldLabel}>Property Price</label>
            <div className="relative">
              <PoundSterling className={poundIcon} />
              <input
                type="text"
                value={propertyPrice}
                onChange={formatInput(setPropertyPrice)}
                onBlur={() => formatCurrencyDisplay(propertyPrice, setPropertyPrice)}
                placeholder="e.g. £500,000"
                className={cn(fieldControl, "pl-11")}
              />
            </div>
          </div>

          {/* Deposit */}
          <div>
            <label className={fieldLabel}>
              Deposit
              <span className="ml-2">({depositPercent.toFixed(1)}%)</span>
            </label>
            <div className="relative">
              <PoundSterling className={poundIcon} />
              <input
                type="text"
                value={depositMode === "amount" ? deposit : formatCurrency(effectiveDeposit)}
                onChange={(e) => handleDepositAmountChange(e.target.value)}
                onBlur={() => formatCurrencyDisplay(deposit, setDeposit)}
                placeholder="e.g. £50,000"
                className={cn(fieldControl, "pl-11")}
              />
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="0.5"
              value={depositPercent}
              onChange={(e) => handleDepositPercentChange(Number(e.target.value))}
              className={cn(rangeControl, "mt-2")}
            />
            <div className="flex justify-between text-xs text-banc-muted-readable">
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <label className={fieldLabel}>Interest Rate</label>
            <div className="mb-3 grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setInterestRate(rate)}
                  className={cn(choiceChip(interestRate === rate), "px-2")}
                >
                  {rate}%
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className={cn(fieldControl, "pr-10")}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-banc-muted-readable">%</span>
            </div>
          </div>

          {/* Term */}
          <div>
            <label className={fieldLabel}>Mortgage Term</label>
            <div className="relative">
              <select
                value={termYears}
                onChange={(e) => setTermYears(Number(e.target.value))}
                className={cn(fieldControl, "appearance-none pr-11")}
              >
                {Array.from({ length: 31 }, (_, i) => i + 10).map((year) => (
                  <option key={year} value={year} className="bg-white">
                    {year} years
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-banc-muted-readable" />
            </div>
          </div>
        </div>

        {/* Repayment Type */}
        <div className="mt-6">
          <label className={fieldLabel}>Repayment Type</label>
          <div className={cn(segmented, "sm:max-w-md")}>
            {REPAYMENT_OPTIONS.map((type) => (
              <button
                key={type.value}
                onClick={() => setRepaymentType(type.value)}
                className={cn(segmentedOption(repaymentType === type.value), "px-2 sm:px-4")}
              >
                {type.label}
              </button>
            ))}
          </div>
          <p className={fieldHelp}>
            {REPAYMENT_OPTIONS.find((type) => type.value === repaymentType)?.desc}
          </p>
        </div>
      </div>

      {/* Results Section */}
      {propertyPriceNum > 0 && result.loanAmount > 0 && (
        <>
          <div className={formPanel}>
            {/* Main Results */}
            <p className={eyebrow}>Monthly Payment</p>
            <p className={cn(figure, "mt-3 text-[clamp(44px,11vw,64px)]")}>
              {formatCurrency(result.monthlyPayment)}
            </p>
            <p className={fieldHelp}>per month</p>

            <dl className="mt-6 grid border-t border-banc-dark/15 sm:grid-cols-3 sm:gap-x-8">
              <div className="border-b border-banc-dark/15 py-4 sm:border-b-0 sm:pb-0">
                <dt className="text-sm text-banc-muted-readable">Loan Amount</dt>
                <dd className="mt-1 text-xl font-medium text-banc-dark-deep">
                  {formatCurrency(result.loanAmount)}
                </dd>
                <dd className="text-xs text-banc-muted-readable">{formatPercent(result.ltv)} LTV</dd>
              </div>
              <div className="border-b border-banc-dark/15 py-4 sm:border-b-0 sm:pb-0">
                <dt className="text-sm text-banc-muted-readable">Total Interest</dt>
                <dd className="mt-1 text-xl font-medium text-banc-dark-deep">
                  {formatCurrency(result.totalInterest)}
                </dd>
                <dd className="text-xs text-banc-muted-readable">over {termYears} years</dd>
              </div>
              <div className="pt-4">
                <dt className="text-sm text-banc-muted-readable">Total Cost</dt>
                <dd className="mt-1 text-xl font-medium text-banc-dark-deep">
                  {formatCurrency(result.totalCost)}
                </dd>
                <dd className="text-xs text-banc-muted-readable">including deposit</dd>
              </div>
            </dl>

            {/* Pie Chart Visualization */}
            <div className={panelBlock}>
              <h3 className={panelHeading}>Payment Breakdown</h3>
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
                {/* Visual Pie Chart using SVG */}
                <div className="relative h-44 w-44 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      className="stroke-banc-line"
                      strokeWidth="20"
                    />
                    {/* Principal arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      className="stroke-banc-focus"
                      strokeWidth="20"
                      strokeDasharray={`${pieData.principalPercent * 2.51} ${251 - pieData.principalPercent * 2.51}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-medium text-banc-dark-deep">
                      {formatPercent(pieData.principalPercent)}
                    </span>
                    <span className="text-xs text-banc-muted-readable">Principal</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 divide-y divide-banc-dark/15 border-y border-banc-dark/15">
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-banc-focus" />
                      <span className="text-banc-dark-deep">Principal</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-banc-dark-deep">{formatCurrency(result.loanAmount)}</p>
                      <p className="text-sm text-banc-muted-readable">{formatPercent(pieData.principalPercent)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-banc-line" />
                      <span className="text-banc-dark-deep">Interest</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-banc-dark-deep">{formatCurrency(result.totalInterest)}</p>
                      <p className="text-sm text-banc-muted-readable">{formatPercent(pieData.interestPercent)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LTV Indicator */}
            <div className={panelBlock}>
              <h3 className={panelHeading}>Loan-to-Value Ratio</h3>
              <div className="space-y-4">
                <div className="relative">
                  <div className="h-3 rounded-full bg-banc-grey-pale">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        result.ltv > 90
                          ? "bg-red-600"
                          : result.ltv > 75
                          ? "bg-amber-500"
                          : "bg-green-600"
                      )}
                      style={{ width: `${Math.min(result.ltv, 100)}%` }}
                    />
                  </div>
                  {/* LTV markers */}
                  {[60, 75, 80, 85, 90].map((ltv) => (
                    <div
                      key={ltv}
                      className={cn(
                        "absolute top-5 -translate-x-1/2 text-xs text-banc-muted-readable",
                        (ltv === 80 || ltv === 85) && "hidden sm:block"
                      )}
                      style={{ left: `${ltv}%` }}
                    >
                      {ltv}%
                    </div>
                  ))}
                </div>
                <div className="flex items-end justify-between gap-4 pt-6">
                  <div>
                    <p className="text-sm text-banc-muted-readable">Your LTV</p>
                    <p
                      className={cn(
                        "mt-1 font-display text-4xl font-light leading-none tracking-[-0.02em]",
                        result.ltv > 90 ? "text-red-700" : result.ltv > 75 ? "text-amber-700" : "text-green-700"
                      )}
                    >
                      {formatPercent(result.ltv)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-banc-muted-readable">LTV Band</p>
                    <p className="mt-1 text-base font-medium text-banc-dark-deep">
                      {result.ltv <= 60
                        ? "Excellent (≤60%)"
                        : result.ltv <= 75
                        ? "Good (61-75%)"
                        : result.ltv <= 80
                        ? "Fair (76-80%)"
                        : result.ltv <= 85
                        ? "Higher (81-85%)"
                        : result.ltv <= 90
                        ? "High (86-90%)"
                        : "Very High (>90%)"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amortization Schedule */}
            <div className={panelBlock}>
              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className="flex min-h-11 w-full items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
              >
                <h3 className="text-lg font-semibold text-banc-dark-deep">Amortization Schedule</h3>
                {showAmortization ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0 text-banc-muted-readable" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0 text-banc-muted-readable" />
                )}
              </button>

              {showAmortization && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-banc-dark/15">
                        <th className="py-3 text-left text-sm font-medium text-banc-muted-readable">Year</th>
                        <th className="py-3 text-right text-sm font-medium text-banc-muted-readable">Interest</th>
                        <th className="py-3 text-right text-sm font-medium text-banc-muted-readable">Principal</th>
                        <th className="py-3 text-right text-sm font-medium text-banc-muted-readable">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlySchedule.map((year) => (
                        <tr key={year.year} className="border-b border-banc-dark/15">
                          <td className="whitespace-nowrap py-3 text-sm text-banc-dark-deep">Year {year.year}</td>
                          <td className="py-3 pl-3 text-right text-sm text-banc-muted-readable">
                            {formatCurrency(year.interest)}
                          </td>
                          <td className="py-3 pl-3 text-right text-sm font-medium text-banc-dark-deep">
                            {formatCurrency(year.principal)}
                          </td>
                          <td className="py-3 pl-3 text-right text-sm text-banc-muted-readable">
                            {formatCurrency(year.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs text-banc-muted-readable">
                    Showing first 10 years. Full schedule available on request.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className={actionPrimary}>
              Get Mortgage Advice
            </Link>
            <button
              className={actionSecondary}
              onClick={() => {
                const data = {
                  propertyPrice: propertyPriceNum,
                  deposit: effectiveDeposit,
                  interestRate,
                  termYears,
                  repaymentType,
                  monthlyPayment: result.monthlyPayment,
                  date: new Date().toISOString(),
                };
                localStorage.setItem("mortgageCalculation", JSON.stringify(data));
                alert("Calculation saved!");
              }}
            >
              Save Calculation
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MortgageCalculator;
