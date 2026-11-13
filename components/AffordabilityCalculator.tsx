"use client";

import { useState, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateAffordability,
  estimatePaymentsAtRates,
  formatCurrency,
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
} from "@/components/ui/form-styles";
import Link from "next/link";

const figure = "font-display font-light leading-none tracking-[-0.02em] text-banc-dark-deep";
const panelHeading = "mb-4 text-lg font-semibold text-banc-dark-deep";
const panelBlock = "mt-6 border-t border-banc-dark/15 pt-6";
const poundSign = "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-banc-muted-readable";

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
      <div className={cn(formPanel, className)}>
        <div className="space-y-5">
          <div>
            <label className={fieldLabel}>Your Income</label>
            <div className="relative">
              <span className={poundSign}>£</span>
              <input
                type="text"
                value={income1}
                onChange={formatInput(setIncome1)}
                onBlur={() => formatCurrencyDisplay(income1, setIncome1)}
                placeholder="e.g. £50,000"
                className={cn(fieldControl, "pl-9")}
              />
            </div>
          </div>

          <div>
            <label className={fieldLabel}>Deposit Available</label>
            <div className="relative">
              <span className={poundSign}>£</span>
              <input
                type="text"
                value={deposit}
                onChange={formatInput(setDeposit)}
                onBlur={() => formatCurrencyDisplay(deposit, setDeposit)}
                placeholder="e.g. £50,000"
                className={cn(fieldControl, "pl-9")}
              />
            </div>
          </div>

          {totalIncome > 0 && (
            <div className="border-t border-banc-dark/15 pt-5">
              <p className={eyebrow}>Max Property Budget</p>
              <p className={cn(figure, "mt-3 text-4xl")}>
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
      <div className={formPanel}>
        <h3 className="mb-6 text-lg font-semibold text-banc-dark-deep">Your Finances</h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Income 1 */}
          <div>
            <label className={fieldLabel}>Your Annual Income</label>
            <div className="relative">
              <span className={poundSign}>£</span>
              <input
                type="text"
                value={income1}
                onChange={formatInput(setIncome1)}
                onBlur={() => formatCurrencyDisplay(income1, setIncome1)}
                placeholder="e.g. £50,000"
                className={cn(fieldControl, "pl-9")}
              />
            </div>
          </div>

          {/* Income 2 */}
          <div>
            <label className={fieldLabel}>Partner&apos;s Income (Optional)</label>
            <div className="relative">
              <span className={poundSign}>£</span>
              <input
                type="text"
                value={income2}
                onChange={formatInput(setIncome2)}
                onBlur={() => formatCurrencyDisplay(income2, setIncome2)}
                placeholder="e.g. £40,000"
                className={cn(fieldControl, "pl-9")}
              />
            </div>
          </div>

          {/* Monthly Outgoings */}
          <div>
            <label className={fieldLabel}>Monthly Debt Payments</label>
            <div className="relative">
              <span className={poundSign}>£</span>
              <input
                type="text"
                value={outgoings}
                onChange={formatInput(setOutgoings)}
                onBlur={() => formatCurrencyDisplay(outgoings, setOutgoings)}
                placeholder="e.g. £500"
                className={cn(fieldControl, "pl-9")}
              />
            </div>
            <p className={fieldHelp}>Loans, credit cards, car finance, etc.</p>
          </div>

          {/* Deposit */}
          <div>
            <label className={fieldLabel}>Deposit Available</label>
            <div className="relative">
              <span className={poundSign}>£</span>
              <input
                type="text"
                value={deposit}
                onChange={formatInput(setDeposit)}
                onBlur={() => formatCurrencyDisplay(deposit, setDeposit)}
                placeholder="e.g. £50,000"
                className={cn(fieldControl, "pl-9")}
              />
            </div>
          </div>
        </div>

        {/* Income Multiplier */}
        <div className="mt-6">
          <label className={fieldLabel}>
            Income Multiplier:
            <span className="ml-2 normal-case text-banc-dark-deep">{multiplier}x</span>
          </label>
          <input
            type="range"
            min="3"
            max="5.5"
            step="0.1"
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            className="h-11 w-full cursor-pointer accent-banc-focus"
          />
          <div className="flex justify-between gap-2 text-xs text-banc-muted-readable">
            <span>3x (Conservative)</span>
            <span>4.5x (Typical)</span>
            <span>5.5x (Maximum)</span>
          </div>
          <p className={fieldHelp}>
            Lenders typically offer 4-4.5x your income, but this can vary based on credit score and circumstances.
          </p>
        </div>
      </div>

      {/* Results Section */}
      {totalIncome > 0 && (
        <>
          <div className={formPanel}>
            {/* Main Results */}
            <p className={eyebrow}>Maximum Property Budget</p>
            <p className={cn(figure, "mt-3 text-[clamp(44px,11vw,64px)]")}>
              {formatCurrency(result.estimatedBudget)}
            </p>
            <p className={fieldHelp}>
              Based on {formatCurrency(totalIncome)} income at {multiplier}x multiplier
            </p>

            {/* Key Figures */}
            <dl className="mt-6 grid border-t border-banc-dark/15 sm:grid-cols-3 sm:gap-x-8">
              <div className="border-b border-banc-dark/15 py-4 sm:border-b-0 sm:pb-0">
                <dt className="text-sm text-banc-muted-readable">Maximum Borrowing</dt>
                <dd className="mt-1 text-xl font-medium text-banc-dark-deep">
                  {formatCurrency(result.maxBorrowing)}
                </dd>
                <dd className="text-xs text-banc-muted-readable">{multiplier}x income</dd>
              </div>
              <div className="border-b border-banc-dark/15 py-4 sm:border-b-0 sm:pb-0">
                <dt className="text-sm text-banc-muted-readable">Your Deposit</dt>
                <dd className="mt-1 text-xl font-medium text-banc-dark-deep">
                  {formatCurrency(result.depositAmount)}
                </dd>
                <dd className="text-xs text-banc-muted-readable">
                  {result.estimatedBudget > 0
                    ? ((result.depositAmount / result.estimatedBudget) * 100).toFixed(1)
                    : 0}% of budget
                </dd>
              </div>
              <div className="pt-4">
                <dt className="text-sm text-banc-muted-readable">Total Income</dt>
                <dd className="mt-1 text-xl font-medium text-banc-dark-deep">{formatCurrency(totalIncome)}</dd>
                <dd className="text-xs text-banc-muted-readable">{income2Num > 0 ? "Combined" : "Single"} income</dd>
              </div>
            </dl>

            {/* Debt Warning */}
            {debtToIncome > 20 && (
              <div className={cn(panelBlock, "flex items-start gap-3")}>
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-700" />
                <div>
                  <p className="font-medium text-banc-dark-deep">High Debt-to-Income Ratio</p>
                  <p className="mt-1 text-sm text-banc-muted-readable">
                    Your monthly debt payments represent {debtToIncome.toFixed(1)}% of your income. 
                    Lenders may offer lower multipliers with high existing debt.
                  </p>
                </div>
              </div>
            )}

            {/* LTV Options */}
            <div className={panelBlock}>
              <h3 className={panelHeading}>Loan-to-Value Options</h3>
              <p className="mb-4 text-sm text-banc-muted-readable">
                Based on your deposit of {formatCurrency(result.depositAmount)}, here are your LTV options:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-banc-dark/15">
                      <th className="py-3 text-left text-sm font-medium text-banc-muted-readable">LTV</th>
                      <th className="py-3 pl-3 text-right text-sm font-medium text-banc-muted-readable">Min Deposit</th>
                      <th className="py-3 pl-3 text-right text-sm font-medium text-banc-muted-readable">Max Property Price</th>
                      <th className="py-3 pl-3 text-right text-sm font-medium text-banc-muted-readable">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.ltvOptions.map((option) => {
                      const canAfford = result.depositAmount >= option.minDeposit;
                      return (
                        <tr key={option.ltv} className="border-b border-banc-dark/15">
                          <td className="whitespace-nowrap py-3 text-sm font-medium text-banc-dark-deep">{option.ltv}% LTV</td>
                          <td className="py-3 pl-3 text-right text-sm text-banc-muted-readable">
                            {formatCurrency(option.minDeposit)}
                          </td>
                          <td className="py-3 pl-3 text-right text-sm text-banc-muted-readable">
                            {formatCurrency(option.maxPropertyPrice)}
                          </td>
                          <td className="py-3 pl-3 text-right text-sm">
                            {canAfford ? (
                              <span className="font-medium text-green-700">
                                Available
                              </span>
                            ) : (
                              <span className="text-red-700">
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
            <div className={panelBlock}>
              <h3 className={panelHeading}>Estimated Monthly Payments</h3>
              <p className="mb-4 text-sm text-banc-muted-readable">
                Based on borrowing {formatCurrency(result.maxBorrowing)} over 25 years at different rates:
              </p>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-5 lg:grid-cols-4">
                {rateEstimates.map((estimate) => (
                  <div key={estimate.rate}>
                    <dt className="text-sm text-banc-muted-readable">{estimate.rate}% rate</dt>
                    <dd className="mt-1 text-xl font-medium text-banc-dark-deep">
                      {formatCurrency(estimate.monthlyPayment)}
                    </dd>
                    <dd className="text-xs text-banc-muted-readable">per month</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Affordability Guidelines */}
            <div className={panelBlock}>
              <h3 className={panelHeading}>Affordability Guidelines</h3>
              <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
                <div>
                  <p className="font-medium text-banc-dark-deep">The 28% Rule</p>
                  <p className="mt-1 text-sm text-banc-muted-readable">
                    Your monthly mortgage payment should not exceed 28% of your gross monthly income.
                  </p>
                  <p className="mt-2 text-sm font-medium text-banc-focus">
                    Your max: {formatCurrency(totalIncome / 12 * 0.28)}/month
                  </p>
                </div>
                <div>
                  <p className="font-medium text-banc-dark-deep">The 36% Rule</p>
                  <p className="mt-1 text-sm text-banc-muted-readable">
                    Total debt payments (including mortgage) should not exceed 36% of income.
                  </p>
                  <p className="mt-2 text-sm font-medium text-banc-focus">
                    Your max: {formatCurrency(totalIncome / 12 * 0.36 - outgoingsNum)}/month mortgage
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className={actionPrimary}>
              Speak to an Advisor
            </Link>
            <button
              className={actionSecondary}
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
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AffordabilityCalculator;
