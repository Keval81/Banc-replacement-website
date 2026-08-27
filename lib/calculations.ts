// Shared calculation functions for all calculators

// ==================== STAMP DUTY CALCULATIONS ====================

export type BuyerType = "first-time" | "home-mover" | "additional-property";
export type Location = "england" | "scotland" | "wales";

interface TaxBand {
  min: number;
  max: number | null;
  rate: number;
}

// Rates verified against gov.uk / revenue.scot / gov.wales, 2026-08-27.
// Band `min` is the exclusive lower boundary: tax applies to the portion above it.

// England & NI SDLT bands (from 1 April 2025)
const englandBands: TaxBand[] = [
  { min: 0, max: 125000, rate: 0 },
  { min: 125000, max: 250000, rate: 0.02 },
  { min: 250000, max: 925000, rate: 0.05 },
  { min: 925000, max: 1500000, rate: 0.10 },
  { min: 1500000, max: null, rate: 0.12 },
];

// England first-time buyer bands (relief up to £500,000)
const ftbBands: TaxBand[] = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 500000, rate: 0.05 },
];

// Scotland LBTT bands (from 1 April 2021)
const scotlandBands: TaxBand[] = [
  { min: 0, max: 145000, rate: 0 },
  { min: 145000, max: 250000, rate: 0.02 },
  { min: 250000, max: 325000, rate: 0.05 },
  { min: 325000, max: 750000, rate: 0.10 },
  { min: 750000, max: null, rate: 0.12 },
];

// Scotland first-time buyer bands (nil rate band raised to £175,000)
const scotlandFtbBands: TaxBand[] = [
  { min: 0, max: 175000, rate: 0 },
  { min: 175000, max: 250000, rate: 0.02 },
  { min: 250000, max: 325000, rate: 0.05 },
  { min: 325000, max: 750000, rate: 0.10 },
  { min: 750000, max: null, rate: 0.12 },
];

// Wales LTT main residential bands (from 10 October 2022)
const walesBands: TaxBand[] = [
  { min: 0, max: 225000, rate: 0 },
  { min: 225000, max: 400000, rate: 0.06 },
  { min: 400000, max: 750000, rate: 0.075 },
  { min: 750000, max: 1500000, rate: 0.10 },
  { min: 1500000, max: null, rate: 0.12 },
];

// Wales LTT higher residential rates (from 11 December 2024) — its own band table,
// not the main bands plus a flat surcharge
const walesHigherBands: TaxBand[] = [
  { min: 0, max: 180000, rate: 0.05 },
  { min: 180000, max: 250000, rate: 0.085 },
  { min: 250000, max: 400000, rate: 0.10 },
  { min: 400000, max: 750000, rate: 0.125 },
  { min: 750000, max: 1500000, rate: 0.15 },
  { min: 1500000, max: null, rate: 0.17 },
];

export interface BandBreakdown {
  band: string;
  rate: number;
  amountInBand: number;
  tax: number;
}

export interface StampDutyResult {
  totalTax: number;
  effectiveRate: number;
  breakdown: BandBreakdown[];
}

export function calculateStampDuty(
  price: number,
  buyerType: BuyerType,
  location: Location
): StampDutyResult {
  if (price <= 0) {
    return { totalTax: 0, effectiveRate: 0, breakdown: [] };
  }

  let bands: TaxBand[];
  let surcharge = 0;

  // Select appropriate bands
  if (location === "england") {
    if (buyerType === "first-time" && price <= 500000) {
      // First-time buyer relief is lost entirely above £500k
      bands = ftbBands;
    } else {
      bands = englandBands;
    }
  } else if (location === "scotland") {
    bands = buyerType === "first-time" ? scotlandFtbBands : scotlandBands;
  } else {
    bands = buyerType === "additional-property" ? walesHigherBands : walesBands;
  }

  // Additional property surcharge (England +5% per band; Scotland ADS 8% of price,
  // applied per band which sums to the same; Wales uses its own higher-rate bands)
  if (buyerType === "additional-property") {
    if (location === "england") {
      surcharge = 0.05;
    } else if (location === "scotland") {
      surcharge = 0.08;
    }
  }

  const breakdown: BandBreakdown[] = [];
  let totalTax = 0;

  for (const band of bands) {
    if (price > band.min) {
      const bandMax = band.max ?? price;
      const amountInBand = Math.min(price, bandMax) - band.min;
      const rate = band.rate + surcharge;
      const tax = amountInBand * rate;

      if (amountInBand > 0) {
        breakdown.push({
          band: band.max
            ? `£${band.min.toLocaleString()} - £${band.max.toLocaleString()}`
            : `Over £${band.min.toLocaleString()}`,
          rate: rate,
          amountInBand,
          tax,
        });
        totalTax += tax;
      }
    }
  }

  const effectiveRate = (totalTax / price) * 100;

  return {
    totalTax,
    effectiveRate,
    breakdown,
  };
}

// ==================== MORTGAGE CALCULATIONS ====================

export type RepaymentType = "repayment" | "interest-only";

export interface MortgageResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  ltv: number;
  loanAmount: number;
}

export function calculateMortgage(
  propertyPrice: number,
  deposit: number,
  interestRate: number,
  termYears: number,
  repaymentType: RepaymentType
): MortgageResult {
  const loanAmount = propertyPrice - deposit;
  const ltv = (loanAmount / propertyPrice) * 100;

  if (loanAmount <= 0 || interestRate < 0 || termYears <= 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalCost: deposit,
      ltv,
      loanAmount,
    };
  }

  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = termYears * 12;

  let monthlyPayment: number;
  let totalCost: number;

  if (repaymentType === "interest-only") {
    monthlyPayment = loanAmount * monthlyRate;
    totalCost = monthlyPayment * totalPayments + loanAmount;
  } else {
    // Capital & Interest (Repayment)
    if (interestRate === 0) {
      monthlyPayment = loanAmount / totalPayments;
    } else {
      monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }
    totalCost = monthlyPayment * totalPayments;
  }

  const totalInterest = totalCost - loanAmount;

  return {
    monthlyPayment,
    totalInterest,
    totalCost,
    ltv,
    loanAmount,
  };
}

// Generate amortization schedule
export interface AmortizationEntry {
  year: number;
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function generateAmortizationSchedule(
  loanAmount: number,
  interestRate: number,
  termYears: number
): AmortizationEntry[] {
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = termYears * 12;
  const schedule: AmortizationEntry[] = [];

  if (interestRate === 0) {
    const monthlyPayment = loanAmount / totalPayments;
    let balance = loanAmount;

    for (let i = 1; i <= totalPayments; i++) {
      const principal = monthlyPayment;
      balance -= principal;

      schedule.push({
        year: Math.ceil(i / 12),
        month: i,
        payment: monthlyPayment,
        principal,
        interest: 0,
        balance: Math.max(0, balance),
      });
    }
  } else {
    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    let balance = loanAmount;

    for (let i = 1; i <= totalPayments; i++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;

      schedule.push({
        year: Math.ceil(i / 12),
        month: i,
        payment: monthlyPayment,
        principal,
        interest,
        balance: Math.max(0, balance),
      });
    }
  }

  return schedule;
}

// ==================== AFFORDABILITY CALCULATIONS ====================

export interface AffordabilityResult {
  maxBorrowing: number;
  estimatedBudget: number;
  depositAmount: number;
  ltvOptions: {
    ltv: number;
    minDeposit: number;
    maxPropertyPrice: number;
  }[];
}

export function calculateAffordability(
  income1: number,
  income2: number,
  monthlyOutgoings: number,
  deposit: number,
  multiplier: number = 4.5
): AffordabilityResult {
  const totalIncome = income1 + income2;
  const maxBorrowing = totalIncome * multiplier;
  const estimatedBudget = maxBorrowing + deposit;

  // Calculate LTV options
  const ltvOptions = [60, 75, 80, 85, 90, 95].map((ltv) => {
    const maxPropertyPrice = (deposit / (100 - ltv)) * 100;
    const minDeposit = (estimatedBudget * (100 - ltv)) / 100;

    return {
      ltv,
      minDeposit: Math.max(deposit, minDeposit),
      maxPropertyPrice,
    };
  });

  return {
    maxBorrowing,
    estimatedBudget,
    depositAmount: deposit,
    ltvOptions,
  };
}

// Estimate monthly payments at different rates
export function estimatePaymentsAtRates(
  loanAmount: number,
  termYears: number,
  rates: number[] = [3, 4, 5, 6]
): { rate: number; monthlyPayment: number }[] {
  return rates.map((rate) => {
    const monthlyRate = rate / 100 / 12;
    const totalPayments = termYears * 12;

    if (rate === 0) {
      return {
        rate,
        monthlyPayment: loanAmount / totalPayments,
      };
    }

    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    return {
      rate,
      monthlyPayment,
    };
  });
}

// ==================== YIELD CALCULATIONS ====================

export interface YieldResult {
  grossYield: number;
  netYield: number;
  annualRent: number;
  annualCosts: number;
  netIncome: number;
  roi?: number;
  cashFlow?: number;
}

export function calculateYield(
  propertyPrice: number,
  monthlyRent: number,
  annualCosts: number,
  mortgageAmount?: number,
  mortgageRate?: number
): YieldResult {
  const annualRent = monthlyRent * 12;
  const grossYield = (annualRent / propertyPrice) * 100;
  const netIncome = annualRent - annualCosts;
  const netYield = (netIncome / propertyPrice) * 100;

  let roi: number | undefined;
  let cashFlow: number | undefined;

  if (mortgageAmount && mortgageRate !== undefined) {
    const deposit = propertyPrice - mortgageAmount;
    const annualMortgageCost = mortgageAmount * (mortgageRate / 100);
    const totalAnnualCosts = annualCosts + annualMortgageCost;
    cashFlow = annualRent - totalAnnualCosts;

    if (deposit > 0) {
      roi = (cashFlow / deposit) * 100;
    }
  }

  return {
    grossYield,
    netYield,
    annualRent,
    annualCosts,
    netIncome,
    roi,
    cashFlow,
  };
}

// ==================== UTILITY FUNCTIONS ====================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function parseCurrencyInput(value: string): number {
  // Remove currency symbols, commas, and spaces
  const cleaned = value.replace(/[£,\s]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
