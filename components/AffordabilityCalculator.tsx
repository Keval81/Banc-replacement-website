"use client";

import { useState, useMemo } from "react";
import { Wallet, Users, CreditCard, PiggyBank, TrendingUp, Home, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateAffordability,
  estimatePaymentsAtRates,
  formatCurrency,
  parseCurrencyInput,
} from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AffordabilityCalculatorProps {
  className?: string;
  compact?: boolean;
}

export function AffordabilityCalculator({ className, compact = false }: AffordabilityCalculatorProps) {
  const [income1, setIncome1] = useState<string>("");
  const [income2, setIncome2] = useState<string>("");
  const [outgoings, setOutgoings] = useState<string>("");
  const [deposit, setDeposit] = useState<string>("");
  const [multiplier, setMultiplier] = useState<number>(4.5);

  const income1Num = parseCurrencyInput(income1);
  const income2Num = parseCurrencyInput(income2);
  const outgoingsNum = parseCurrencyInput(outgoings);
  const depositNum = parseCurrencyInput(deposit);

  const result = useMemo(
    () => calculateAffordability(income1Num, income2Num, outgoingsNum, depositNum, multiplier),
    [income1Num, income2Num, outgoingsNum, depositNum, multiplier]
  );

  // Estimate payments at different rates based on max borrowing
  const rateEstimates = useMemo(
    () => estimatePaymentsAtRates(result.maxBorrowing, 25, [3, 4, 5, 6]),
    [result.maxBorrowing]
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

  const totalIncome = income1Num + income2Num;
  const debtToIncome = totalIncome > 0 ? (outgoingsNum * 12 / totalIncome) * 100 : 0;

  if (compact) {
    return (
      <div className={cn("rounded-xl border border-banc-line bg-white p-4", className)}>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs text-banc-muted-readable">Your Income</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-banc-muted-readable">£</span>
              <input
                type="text"
                value={income1}
                onChange={formatInput(setIncome1)}
                onBlur={() => formatCurrencyDisplay(income1, setIncome1)}
                placeholder="e.g. £50,000"
                className="w-full rounded-lg border border-banc-line bg-banc-grey-pale px-8 py-2 text-sm text-banc-dark-deep placeholder:text-banc-muted-readable focus:border-banc-sky focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-banc-muted-readable">Deposit Available</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-banc-muted-readable">£</span>
              <input
                type="text"
                value={deposit}
                onChange={formatInput(setDeposit)}
                onBlur={() => formatCurrencyDisplay(deposit, setDeposit)}
                placeholder="e.g. £50,000"
                className="w-full rounded-lg border border-banc-line bg-banc-grey-pale px-8 py-2 text-sm text-banc-dark-deep placeholder:text-banc-muted-readable focus:border-banc-sky focus:outline-none"
              />
            </div>
          </div>

          {totalIncome > 0 && (
            <div className="rounded-lg bg-banc-sky/10 p-3 text-center">
              <p className="text-xs text-banc-muted-readable">Max Property Budget</p>
              <p className="text-lg font-semibold text-banc-focus">
                {formatCurrency(result.estimatedBudget)}
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
      <div className="rounded-2xl border border-banc-line bg-white p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-banc-dark-deep">
          <Wallet className="h-5 w-5 text-banc-focus" />
          Your Finances
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Income 1 */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-banc-muted-readable">
              <Users className="h-4 w-4" />
              Your Annual Income
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 text-lg text-banc-muted-readable -translate-y-1/2">£</span>
              <input
                type="text"
                value={income1}
                onChange={formatInput(setIncome1)}
                onBlur={() => formatCurrencyDisplay(income1, setIncome1)}
                placeholder="e.g. £50,000"
                className="w-full rounded-xl border border-banc-line bg-banc-grey-pale px-10 py-3 text-lg text-banc-dark-deep placeholder:text-banc-muted-readable focus:border-banc-sky focus:outline-none"
              />
            </div>
          </div>

          {/* Income 2 */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-banc-muted-readable">
              <Users className="h-4 w-4" />
              Partner&apos;s Income (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 text-lg text-banc-muted-readable -translate-y-1/2">£</span>
              <input
                type="text"
                value={income2}
                onChange={formatInput(setIncome2)}
                onBlur={() => formatCurrencyDisplay(income2, setIncome2)}
                placeholder="e.g. £40,000"
                className="w-full rounded-xl border border-banc-line bg-banc-grey-pale px-10 py-3 text-lg text-banc-dark-deep placeholder:text-banc-muted-readable focus:border-banc-sky focus:outline-none"
              />
            </div>
          </div>

          {/* Monthly Outgoings */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-banc-muted-readable">
              <CreditCard className="h-4 w-4" />
              Monthly Debt Payments
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 text-lg text-banc-muted-readable -translate-y-1/2">£</span>
              <input
                type="text"
                value={outgoings}
                onChange={formatInput(setOutgoings)}
                onBlur={() => formatCurrencyDisplay(outgoings, setOutgoings)}
                placeholder="e.g. £500"
                className="w-full rounded-xl border border-banc-line bg-banc-grey-pale px-10 py-3 text-lg text-banc-dark-deep placeholder:text-banc-muted-readable focus:border-banc-sky focus:outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-banc-muted-readable">Loans, credit cards, car finance, etc.</p>
          </div>

          {/* Deposit */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-banc-muted-readable">
              <PiggyBank className="h-4 w-4" />
              Deposit Available
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 text-lg text-banc-muted-readable -translate-y-1/2">£</span>
              <input
                type="text"
                value={deposit}
                onChange={formatInput(setDeposit)}
                onBlur={() => formatCurrencyDisplay(deposit, setDeposit)}
                placeholder="e.g. £50,000"
                className="w-full rounded-xl border border-banc-line bg-banc-grey-pale px-10 py-3 text-lg text-banc-dark-deep placeholder:text-banc-muted-readable focus:border-banc-sky focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Income Multiplier */}
        <div className="mt-6">
          <label className="mb-2 block text-sm text-banc-muted-readable">
            Income Multiplier:
            <span className="ml-2 text-banc-focus">{multiplier}x</span>
          </label>
          <input
            type="range"
            min="3"
            max="5.5"
            step="0.1"
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-banc-grey-pale accent-banc-sky"
          />
          <div className="mt-1 flex justify-between text-xs text-banc-muted-readable">
            <span>3x (Conservative)</span>
            <span>4.5x (Typical)</span>
            <span>5.5x (Maximum)</span>
          </div>
          <p className="mt-2 text-xs text-banc-muted-readable">
            Lenders typically offer 4-4.5x your income, but this can vary based on credit score and circumstances.
          </p>
        </div>
      </div>

      {/* Results Section */}
      {totalIncome > 0 && (
        <>
          {/* Main Results */}
          <div className="rounded-2xl bg-gradient-to-br from-banc-sky/20 to-banc-sky/5 p-6 text-center">
            <p className="text-banc-muted-readable">Maximum Property Budget</p>
            <p className="my-2 text-4xl font-bold text-banc-focus">
              {formatCurrency(result.estimatedBudget)}
            </p>
            <p className="text-sm text-banc-muted-readable">
              Based on {formatCurrency(totalIncome)} income at {multiplier}x multiplier
            </p>
          </div>

          {/* Key Figures */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-banc-line bg-white p-5 text-center">
              <p className="text-sm text-banc-muted-readable">Maximum Borrowing</p>
              <p className="my-1 text-2xl font-bold text-banc-dark-deep">
                {formatCurrency(result.maxBorrowing)}
              </p>
              <p className="text-xs text-banc-muted-readable">{multiplier}x income</p>
            </div>
            <div className="rounded-2xl border border-banc-line bg-white p-5 text-center">
              <p className="text-sm text-banc-muted-readable">Your Deposit</p>
              <p className="my-1 text-2xl font-bold text-banc-dark-deep">
                {formatCurrency(result.depositAmount)}
              </p>
              <p className="text-xs text-banc-muted-readable">
                {result.estimatedBudget > 0
                  ? ((result.depositAmount / result.estimatedBudget) * 100).toFixed(1)
                  : 0}% of budget
              </p>
            </div>
            <div className="rounded-2xl border border-banc-line bg-white p-5 text-center">
              <p className="text-sm text-banc-muted-readable">Total Income</p>
              <p className="my-1 text-2xl font-bold text-banc-dark-deep">{formatCurrency(totalIncome)}</p>
              <p className="text-xs text-banc-muted-readable">{income2Num > 0 ? "Combined" : "Single"} income</p>
            </div>
          </div>

          {/* Debt Warning */}
          {debtToIncome > 20 && (
            <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-400">High Debt-to-Income Ratio</p>
                <p className="text-sm text-banc-muted-readable">
                  Your monthly debt payments represent {debtToIncome.toFixed(1)}% of your income. 
                  Lenders may offer lower multipliers with high existing debt.
                </p>
              </div>
            </div>
          )}

          {/* LTV Options */}
          <div className="rounded-2xl border border-banc-line bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-banc-dark-deep">
              <Home className="h-5 w-5 text-banc-focus" />
              Loan-to-Value Options
            </h3>
            <p className="mb-4 text-sm text-banc-muted-readable">
              Based on your deposit of {formatCurrency(result.depositAmount)}, here are your LTV options:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-banc-line">
                    <th className="py-3 text-left text-sm font-medium text-banc-muted-readable">LTV</th>
                    <th className="py-3 text-right text-sm font-medium text-banc-muted-readable">Min Deposit</th>
                    <th className="py-3 text-right text-sm font-medium text-banc-muted-readable">Max Property Price</th>
                    <th className="py-3 text-center text-sm font-medium text-banc-muted-readable">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.ltvOptions.map((option) => {
                    const canAfford = result.depositAmount >= option.minDeposit;
                    return (
                      <tr
                        key={option.ltv}
                        className={cn(
                          "border-b border-banc-line",
                          canAfford && "bg-banc-sky/5"
                        )}
                      >
                        <td className="py-3 text-sm font-medium text-banc-dark-deep">{option.ltv}% LTV</td>
                        <td className="py-3 text-right text-sm text-banc-muted-readable">
                          {formatCurrency(option.minDeposit)}
                        </td>
                        <td className="py-3 text-right text-sm text-banc-muted-readable">
                          {formatCurrency(option.maxPropertyPrice)}
                        </td>
                        <td className="py-3 text-center text-sm">
                          {canAfford ? (
                            <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                              Available
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-400">
              Need {formatCurrency(option.minDeposit - result.depositAmount)} more
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Estimates */}
          <div className="rounded-2xl border border-banc-line bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-banc-dark-deep">
              <TrendingUp className="h-5 w-5 text-banc-focus" />
              Estimated Monthly Payments
            </h3>
            <p className="mb-4 text-sm text-banc-muted-readable">
              Based on borrowing {formatCurrency(result.maxBorrowing)} over 25 years at different rates:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {rateEstimates.map((estimate) => (
                <div
                  key={estimate.rate}
                  className="rounded-xl border border-banc-line bg-banc-grey-pale p-4 text-center"
                >
                  <p className="text-sm text-banc-muted-readable">{estimate.rate}% rate</p>
                  <p className="my-1 text-xl font-bold text-banc-focus">
                    {formatCurrency(estimate.monthlyPayment)}
                  </p>
                  <p className="text-xs text-banc-muted-readable">per month</p>
                </div>
              ))}
            </div>
          </div>

          {/* Affordability Guidelines */}
          <div className="rounded-2xl border border-banc-line bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-banc-dark-deep">Affordability Guidelines</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-banc-grey-pale p-4">
                <p className="font-medium text-banc-dark-deep">The 28% Rule</p>
                <p className="text-sm text-banc-muted-readable">
                  Your monthly mortgage payment should not exceed 28% of your gross monthly income.
                </p>
                <p className="mt-2 text-sm text-banc-focus">
                  Your max: {formatCurrency(totalIncome / 12 * 0.28)}/month
                </p>
              </div>
              <div className="rounded-xl bg-banc-grey-pale p-4">
                <p className="font-medium text-banc-dark-deep">The 36% Rule</p>
                <p className="text-sm text-banc-muted-readable">
                  Total debt payments (including mortgage) should not exceed 36% of income.
                </p>
                <p className="mt-2 text-sm text-banc-focus">
                  Your max: {formatCurrency(totalIncome / 12 * 0.36 - outgoingsNum)}/month mortgage
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/contact">
              <Button className="w-full bg-banc-focus text-white hover:bg-banc-focus-hover sm:w-auto">
                Speak to an Advisor
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full border-banc-line text-banc-dark-deep hover:bg-banc-grey-pale sm:w-auto"
              onClick={() => {
                const data = {
                  income1: income1Num,
                  income2: income2Num,
                  outgoings: outgoingsNum,
                  deposit: depositNum,
                  maxBorrowing: result.maxBorrowing,
                  estimatedBudget: result.estimatedBudget,
                  date: new Date().toISOString(),
                };
                localStorage.setItem("affordabilityCalculation", JSON.stringify(data));
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

export default AffordabilityCalculator;
