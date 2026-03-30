"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  PoundSterling,
  Percent,
  Clock,
  ChevronDown,
  ChevronUp,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateMortgage,
  generateAmortizationSchedule,
  formatCurrency,
  formatPercent,
  parseCurrencyInput,
  type RepaymentType,
} from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
      <div className={cn("rounded-xl border border-white/10 bg-[#1A1917] p-4", className)}>
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
                placeholder="e.g. £500,000"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-9 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#4AC8E8] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/60">Deposit ({depositPercent.toFixed(0)}%)</label>
            <input
              type="range"
              min="5"
              max="50"
              value={depositPercent}
              onChange={(e) => handleDepositPercentChange(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[#4AC8E8]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/60">Interest Rate</label>
            <div className="grid grid-cols-4 gap-1">
              {[3, 4, 5, 6].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setInterestRate(rate)}
                  className={cn(
                    "rounded-lg px-2 py-1.5 text-xs transition-all",
                    interestRate === rate
                      ? "bg-[#4AC8E8] text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  )}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          {propertyPriceNum > 0 && (
            <div className="rounded-lg bg-[#4AC8E8]/10 p-3 text-center">
              <p className="text-xs text-white/60">Monthly Payment</p>
              <p className="text-lg font-semibold text-[#4AC8E8]">
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
      <div className="rounded-2xl border border-white/10 bg-[#1A1917] p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Calculator className="h-5 w-5 text-[#4AC8E8]" />
          Mortgage Details
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Property Price */}
          <div>
            <label className="mb-2 block text-sm text-white/70">Property Price</label>
            <div className="relative">
              <PoundSterling className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={propertyPrice}
                onChange={formatInput(setPropertyPrice)}
                onBlur={() => formatCurrencyDisplay(propertyPrice, setPropertyPrice)}
                placeholder="e.g. £500,000"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-lg text-white placeholder:text-white/30 focus:border-[#4AC8E8] focus:outline-none"
              />
            </div>
          </div>

          {/* Deposit */}
          <div>
            <label className="mb-2 block text-sm text-white/70">
              Deposit
              <span className="ml-2 text-xs text-white/50">({depositPercent.toFixed(1)}%)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <PoundSterling className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={depositMode === "amount" ? deposit : formatCurrency(effectiveDeposit)}
                  onChange={(e) => handleDepositAmountChange(e.target.value)}
                  onBlur={() => formatCurrencyDisplay(deposit, setDeposit)}
                  placeholder="e.g. £50,000"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-lg text-white placeholder:text-white/30 focus:border-[#4AC8E8] focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="0.5"
              value={depositPercent}
              onChange={(e) => handleDepositPercentChange(Number(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[#4AC8E8]"
            />
            <div className="mt-1 flex justify-between text-xs text-white/40">
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
              <Percent className="h-4 w-4" />
              Interest Rate
            </label>
            <div className="mb-3 flex gap-2">
              {[3, 4, 5, 6].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setInterestRate(rate)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm transition-all",
                    interestRate === rate
                      ? "bg-[#4AC8E8] text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  )}
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
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white focus:border-[#4AC8E8] focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">%</span>
            </div>
          </div>

          {/* Term */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
              <Clock className="h-4 w-4" />
              Mortgage Term
            </label>
            <div className="relative">
              <select
                value={termYears}
                onChange={(e) => setTermYears(Number(e.target.value))}
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white focus:border-[#4AC8E8] focus:outline-none"
              >
                {Array.from({ length: 31 }, (_, i) => i + 10).map((year) => (
                  <option key={year} value={year} className="bg-[#1A1917]">
                    {year} years
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            </div>
          </div>
        </div>

        {/* Repayment Type */}
        <div className="mt-6">
          <label className="mb-2 block text-sm text-white/70">Repayment Type</label>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
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
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setRepaymentType(type.value as RepaymentType)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  repaymentType === type.value
                    ? "border-[#4AC8E8] bg-[#4AC8E8]/10"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <p
                  className={cn(
                    "font-medium",
                    repaymentType === type.value ? "text-[#4AC8E8]" : "text-white"
                  )}
                >
                  {type.label}
                </p>
                <p className="text-xs text-white/50">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {propertyPriceNum > 0 && result.loanAmount > 0 && (
        <>
          {/* Main Results */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#1A1917] p-5 text-center">
              <p className="text-sm text-white/60">Monthly Payment</p>
              <p className="my-1 text-2xl font-bold text-[#4AC8E8]">
                {formatCurrency(result.monthlyPayment)}
              </p>
              <p className="text-xs text-white/40">per month</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#1A1917] p-5 text-center">
              <p className="text-sm text-white/60">Loan Amount</p>
              <p className="my-1 text-2xl font-bold text-white">
                {formatCurrency(result.loanAmount)}
              </p>
              <p className="text-xs text-white/40">{formatPercent(result.ltv)} LTV</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#1A1917] p-5 text-center">
              <p className="text-sm text-white/60">Total Interest</p>
              <p className="my-1 text-2xl font-bold text-white">
                {formatCurrency(result.totalInterest)}
              </p>
              <p className="text-xs text-white/40">over {termYears} years</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#1A1917] p-5 text-center">
              <p className="text-sm text-white/60">Total Cost</p>
              <p className="my-1 text-2xl font-bold text-white">
                {formatCurrency(result.totalCost)}
              </p>
              <p className="text-xs text-white/40">including deposit</p>
            </div>
          </div>

          {/* Pie Chart Visualization */}
          <div className="rounded-2xl border border-white/10 bg-[#1A1917] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <PieChart className="h-5 w-5 text-[#4AC8E8]" />
              Payment Breakdown
            </h3>
            <div className="flex flex-col items-center gap-8 md:flex-row">
              {/* Visual Pie Chart using SVG */}
              <div className="relative h-48 w-48 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="20"
                  />
                  {/* Principal arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#4AC8E8"
                    strokeWidth="20"
                    strokeDasharray={`${pieData.principalPercent * 2.51} ${251 - pieData.principalPercent * 2.51}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {formatPercent(pieData.principalPercent)}
                  </span>
                  <span className="text-xs text-white/50">Principal</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-[#4AC8E8]" />
                    <span className="text-white">Principal</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatCurrency(result.loanAmount)}</p>
                    <p className="text-sm text-white/50">{formatPercent(pieData.principalPercent)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-white/30" />
                    <span className="text-white">Interest</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatCurrency(result.totalInterest)}</p>
                    <p className="text-sm text-white/50">{formatPercent(pieData.interestPercent)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LTV Indicator */}
          <div className="rounded-2xl border border-white/10 bg-[#1A1917] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <TrendingUp className="h-5 w-5 text-[#4AC8E8]" />
              Loan-to-Value Ratio
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <div className="h-4 rounded-full bg-white/10">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      result.ltv > 90
                        ? "bg-red-500"
                        : result.ltv > 75
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    )}
                    style={{ width: `${Math.min(result.ltv, 100)}%` }}
                  />
                </div>
                {/* LTV markers */}
                {[60, 75, 80, 85, 90].map((ltv) => (
                  <div
                    key={ltv}
                    className="absolute top-5 -translate-x-1/2 text-xs text-white/40"
                    style={{ left: `${ltv}%` }}
                  >
                    {ltv}%
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm text-white/60">Your LTV</p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      result.ltv > 90 ? "text-red-400" : result.ltv > 75 ? "text-yellow-400" : "text-green-400"
                    )}
                  >
                    {formatPercent(result.ltv)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">LTV Band</p>
                  <p className="text-lg font-medium text-white">
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
          <div className="rounded-2xl border border-white/10 bg-[#1A1917] p-6">
            <button
              onClick={() => setShowAmortization(!showAmortization)}
              className="flex w-full items-center justify-between"
            >
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <TrendingUp className="h-5 w-5 text-[#4AC8E8]" />
                Amortization Schedule
              </h3>
              {showAmortization ? (
                <ChevronUp className="h-5 w-5 text-white/40" />
              ) : (
                <ChevronDown className="h-5 w-5 text-white/40" />
              )}
            </button>

            {showAmortization && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 text-left text-sm font-medium text-white/60">Year</th>
                      <th className="py-3 text-right text-sm font-medium text-white/60">Interest</th>
                      <th className="py-3 text-right text-sm font-medium text-white/60">Principal</th>
                      <th className="py-3 text-right text-sm font-medium text-white/60">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlySchedule.map((year) => (
                      <tr key={year.year} className="border-b border-white/5">
                        <td className="py-2 text-sm text-white">Year {year.year}</td>
                        <td className="py-2 text-right text-sm text-white/70">
                          {formatCurrency(year.interest)}
                        </td>
                        <td className="py-2 text-right text-sm text-[#4AC8E8]">
                          {formatCurrency(year.principal)}
                        </td>
                        <td className="py-2 text-right text-sm text-white/70">
                          {formatCurrency(year.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-center text-xs text-white/40">
                  Showing first 10 years. Full schedule available on request.
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/contact">
              <Button className="w-full bg-[#4AC8E8] text-white hover:bg-[#1A9BBF] sm:w-auto">
                Get Mortgage Advice
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 sm:w-auto"
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
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default MortgageCalculator;
