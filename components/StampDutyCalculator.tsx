"use client";

import { useState, useMemo } from "react";
import { PoundSterling } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateStampDuty,
  formatCurrency,
  formatPercent,
  parseCurrencyInput,
  type BuyerType,
  type Location,
} from "@/lib/calculations";
import {
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

const LOCATION_OPTIONS: { value: Location; label: string }[] = [
  { value: "england", label: "England" },
  { value: "scotland", label: "Scotland" },
  { value: "wales", label: "Wales" },
];

const BUYER_TYPE_OPTIONS: { value: BuyerType; label: string; desc: string }[] = [
  {
    value: "first-time",
    label: "First-time Buyer",
    desc: "No previous property ownership",
  },
  {
    value: "home-mover",
    label: "Home Mover",
    desc: "Selling current home to buy new",
  },
  {
    value: "additional-property",
    label: "Additional Property",
    desc: "Buy-to-let or second home",
  },
];

const figure = "font-display font-light leading-none tracking-[-0.02em] text-banc-dark-deep";
const panelHeading = "mb-4 text-lg font-semibold text-banc-dark-deep";
const panelBlock = "mt-6 border-t border-banc-dark/15 pt-6";
const poundIcon = "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-banc-muted-readable";

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
      <div className={cn(formPanel, className)}>
        <div className="space-y-5">
          <div>
            <label className={fieldLabel}>Property Price</label>
            <div className="relative">
              <PoundSterling className={poundIcon} />
              <input
                type="text"
                value={price}
                onChange={handlePriceChange}
                onBlur={formatPriceDisplay}
                placeholder="e.g. £500,000"
                className={cn(fieldControl, "pl-11")}
              />
            </div>
          </div>

          <div className={segmented}>
            <button
              onClick={() => setBuyerType("first-time")}
              className={cn(segmentedOption(buyerType === "first-time"), "px-2")}
            >
              First-time
            </button>
            <button
              onClick={() => setBuyerType("home-mover")}
              className={cn(segmentedOption(buyerType === "home-mover"), "px-2")}
            >
              Mover
            </button>
          </div>

          {priceNum > 0 && (
            <div className="border-t border-banc-dark/15 pt-5">
              <p className={eyebrow}>Stamp Duty</p>
              <p className={cn(figure, "mt-3 text-4xl")}>
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
      <div className={formPanel}>
        <h3 className="mb-6 text-lg font-semibold text-banc-dark-deep">Calculator Settings</h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Property Price */}
          <div>
            <label className={fieldLabel}>Property Price</label>
            <div className="relative">
              <PoundSterling className={poundIcon} />
              <input
                type="text"
                value={price}
                onChange={handlePriceChange}
                onBlur={formatPriceDisplay}
                placeholder="e.g. £500,000"
                className={cn(fieldControl, "pl-11")}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={fieldLabel}>Location</label>
            <div className={segmented}>
              {LOCATION_OPTIONS.map((loc) => (
                <button
                  key={loc.value}
                  onClick={() => setLocation(loc.value)}
                  className={cn(segmentedOption(location === loc.value), "px-2")}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buyer Type */}
        <div className="mt-6">
          <label className={fieldLabel}>Buyer Type</label>
          <div className="grid gap-2 sm:grid-cols-3">
            {BUYER_TYPE_OPTIONS.map((type) => (
              <button
                key={type.value}
                onClick={() => setBuyerType(type.value)}
                className={cn(choiceChip(buyerType === type.value), "w-full")}
              >
                {type.label}
              </button>
            ))}
          </div>
          <p className={fieldHelp}>
            {BUYER_TYPE_OPTIONS.find((type) => type.value === buyerType)?.desc}
          </p>
        </div>
      </div>

      {/* Results Section */}
      {priceNum > 0 && (
        <>
          <div className={formPanel}>
            {/* Main Result */}
            <p className={eyebrow}>Stamp Duty Land Tax Due</p>
            <p className={cn(figure, "mt-3 text-[clamp(44px,11vw,64px)]")}>
              {formatCurrency(result.totalTax)}
            </p>
            <p className={fieldHelp}>
              Effective tax rate: {formatPercent(result.effectiveRate)}
            </p>

            {/* Comparison Table */}
            <div className={panelBlock}>
              <h3 className={panelHeading}>Buyer Type Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-banc-dark/15">
                      <th className="py-3 text-left text-sm font-medium text-banc-muted-readable">Buyer Type</th>
                      <th className="py-3 pl-3 text-right text-sm font-medium text-banc-muted-readable">Stamp Duty</th>
                      <th className="py-3 pl-3 text-right text-sm font-medium text-banc-muted-readable">Effective Rate</th>
                      <th className="py-3 pl-3 text-right text-sm font-medium text-banc-muted-readable">vs. Current</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: "first-time", label: "First-time Buyer", result: ftbResult },
                      { type: "home-mover", label: "Home Mover", result: moverResult },
                      { type: "additional-property", label: "Additional Property", result: investorResult },
                    ].map((row) => (
                      <tr key={row.type} className="border-b border-banc-dark/15">
                        <td
                          className={cn(
                            "py-3 text-sm text-banc-dark-deep",
                            buyerType === row.type && "font-semibold"
                          )}
                        >
                          {row.label}
                        </td>
                        <td className="py-3 pl-3 text-right text-sm font-medium text-banc-dark-deep">
                          {formatCurrency(row.result.totalTax)}
                        </td>
                        <td className="py-3 pl-3 text-right text-sm text-banc-muted-readable">
                          {formatPercent(row.result.effectiveRate)}
                        </td>
                        <td className="whitespace-nowrap py-3 pl-3 text-right text-sm">
                          {row.type === buyerType ? (
                            <span className="font-medium text-banc-focus">Current</span>
                          ) : (
                            <span
                              className={
                                row.result.totalTax > result.totalTax
                                  ? "text-red-700"
                                  : "text-green-700"
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
              <div className={panelBlock}>
                <h3 className={panelHeading}>Tax Breakdown by Band</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-banc-dark/15">
                        <th className="py-3 text-left text-sm font-medium text-banc-muted-readable">Tax Band</th>
                        <th className="py-3 pl-3 text-right text-sm font-medium text-banc-muted-readable">Rate</th>
                        <th className="py-3 pl-3 text-right text-sm font-medium text-banc-muted-readable">
                          Amount in Band
                        </th>
                        <th className="py-3 pl-3 text-right text-sm font-medium text-banc-muted-readable">Tax Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((band, index) => (
                        <tr key={index} className="border-b border-banc-dark/15">
                          <td className="py-3 text-sm text-banc-dark-deep">{band.band}</td>
                          <td className="py-3 pl-3 text-right text-sm text-banc-muted-readable">
                            {formatPercent(band.rate * 100, 0)}
                          </td>
                          <td className="py-3 pl-3 text-right text-sm text-banc-muted-readable">
                            {formatCurrency(band.amountInBand)}
                          </td>
                          <td className="py-3 pl-3 text-right text-sm font-medium text-banc-dark-deep">
                            {formatCurrency(band.tax)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td className="py-3 text-sm text-banc-dark-deep">Total</td>
                        <td className="py-3"></td>
                        <td className="py-3"></td>
                        <td className="py-3 pl-3 text-right text-sm text-banc-dark-deep">
                          {formatCurrency(result.totalTax)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Visual Band Chart */}
            <div className={panelBlock}>
              <h3 className={panelHeading}>
                Tax Rate Bands ({location === "england" ? "England & NI" : location === "scotland" ? "Scotland" : "Wales"})
              </h3>
              <div className="space-y-4">
                {result.breakdown.map((band, index) => {
                  const maxAmount = result.breakdown[0]?.amountInBand || 1;
                  const width = Math.min((band.amountInBand / priceNum) * 100 * 3, 100);
                  return (
                    <div key={index}>
                      <div className="flex items-baseline justify-between gap-4 text-sm">
                        <span className="text-banc-muted-readable">{band.band}</span>
                        <span className="text-banc-dark-deep">{formatCurrency(band.tax)}</span>
                      </div>
                      <div className="mt-2 h-6 rounded-full bg-banc-grey-pale">
                        <div
                          className="flex h-full items-center justify-end rounded-full bg-banc-focus px-2 text-xs text-white transition-all"
                          style={{ width: `${Math.max(width, 5)}%` }}
                        >
                          {formatPercent(band.rate * 100, 0)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row">
            <button
              className={actionSecondary}
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
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default StampDutyCalculator;
