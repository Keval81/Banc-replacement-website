"use client";

import React, { useState } from "react";
import {
  PoundSterling,
  Clock,
  User,
  FileText,
  Check,
  Upload,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";
import { OfferSubmission, BuyerPosition, formatCurrency } from "@/types/portal";
import {
  actionPrimary,
  choiceChip,
  fieldControl,
  fieldError,
  fieldHelp,
  fieldLabel,
  fieldTextarea,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

interface OfferFormProps {
  propertyId: string;
  askingPrice: number;
  onSubmit: (data: OfferSubmission) => void;
  isSubmitting?: boolean;
}

const buyerPositions: { value: BuyerPosition; label: string; description: string }[] = [
  {
    value: "cash_buyer",
    label: "Cash Buyer",
    description: "No mortgage required, can complete quickly",
  },
  {
    value: "mortgage_in_principle",
    label: "Mortgage in Principle",
    description: "Pre-approved mortgage, ready to proceed",
  },
  {
    value: "mortgage_required",
    label: "Mortgage Required",
    description: "Need to apply for mortgage",
  },
  {
    value: "selling_property",
    label: "Selling Property",
    description: "Property on the market or sold subject to contract",
  },
  {
    value: "first_time_buyer",
    label: "First Time Buyer",
    description: "No property to sell, ready to proceed",
  },
];

const timescales = [
  { value: "immediate", label: "Immediate", description: "Can exchange within 4 weeks" },
  { value: "1_month", label: "1 Month", description: "Can exchange within 4-8 weeks" },
  { value: "2_months", label: "2 Months", description: "Can exchange within 8-12 weeks" },
  { value: "3_months", label: "3 Months", description: "Can exchange within 12-16 weeks" },
  { value: "flexible", label: "Flexible", description: "Timescale can be negotiated" },
];

export default function OfferForm({
  propertyId,
  askingPrice,
  onSubmit,
  isSubmitting = false,
}: OfferFormProps) {
  const [formData, setFormData] = useState<Partial<OfferSubmission>>({
    propertyId,
    amount: Math.round(askingPrice * 0.95), // Default to 95% of asking
    position: undefined,
    timescale: undefined,
    mortgageInPrinciple: false,
    chainFree: false,
    additionalComments: "",
    agreedToTerms: false,
  });
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [proofOfFundsFile, setProofOfFundsFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Please enter a valid offer amount";
    }

    if (contact.name.trim().length < 2) {
      newErrors.name = "Please enter your full name";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (contact.phone.replace(/\s/g, "").length < 10) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.position) {
      newErrors.position = "Please select your buying position";
    }

    if (!formData.timescale) {
      newErrors.timescale = "Please select your preferred timescale";
    }

    if (!formData.agreedToTerms) {
      newErrors.terms = "You must accept the terms to submit an offer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submissionData: OfferSubmission = {
      propertyId,
      amount: formData.amount!,
      position: formData.position!,
      timescale: formData.timescale!,
      mortgageInPrinciple: formData.mortgageInPrinciple,
      chainFree: formData.chainFree,
      additionalComments: formData.additionalComments,
      proofOfFunds: proofOfFundsFile || undefined,
      agreedToTerms: true,
      contact: {
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
      },
    };

    onSubmit(submissionData);
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseInt(value.replace(/[^\d]/g, ""), 10) || 0;
    setFormData((prev) => ({ ...prev, amount: numValue }));
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofOfFundsFile(e.target.files[0]);
    }
  };

  const percentageOfAsking = formData.amount
    ? Math.round((formData.amount / askingPrice) * 100)
    : 0;

  const difference = formData.amount ? formData.amount - askingPrice : 0;

  // One panel (supplied by the page): groups are separated by hairlines, not nested cards.
  const group = "border-t border-banc-dark/15 pt-6 first:border-t-0 first:pt-0";
  const leadingIcon = "pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-banc-muted-readable";
  const checkbox =
    "h-5 w-5 shrink-0 rounded border-banc-line accent-banc-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Offer Amount */}
      <div className={group}>
        <label className={fieldLabel}>
          Your Offer Amount
        </label>
        <div className="relative">
          <PoundSterling className={leadingIcon} />
          <input
            type="text"
            value={formData.amount ? formData.amount.toLocaleString() : ""}
            onChange={(e) => handleAmountChange(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter offer amount"
            className={cn(fieldControl, "h-14 pl-11 text-2xl font-semibold", errors.amount && "border-red-700")}
          />
        </div>
        {errors.amount && (
          <p className={fieldError}>{errors.amount}</p>
        )}

        {/* Comparison to asking price */}
        {formData.amount && formData.amount > 0 && (
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-banc-muted-readable">
              {percentageOfAsking}% of asking price
            </span>
            {difference !== 0 && (
              <span
                className={
                  difference > 0 ? "text-green-700" : "text-amber-700"
                }
              >
                {difference > 0 ? "+" : ""}
                {formatCurrency(difference)}
              </span>
            )}
          </div>
        )}

        {/* Quick select buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[90, 95, 97, 100, 105].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  amount: Math.round(askingPrice * (pct / 100)),
                }))
              }
              disabled={isSubmitting}
              className={cn(
                choiceChip(formData.amount === Math.round(askingPrice * (pct / 100))),
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Your Details */}
      <div className={group}>
        <p className="mb-4 font-heading font-semibold text-banc-dark-deep">
          Your Details <span className="text-red-700">*</span>
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="offer-name" className={fieldLabel}>
              Full name
            </label>
            <div className="relative">
              <User className={leadingIcon} aria-hidden="true" />
              <input
                id="offer-name"
                type="text"
                name="name"
                autoComplete="name"
                value={contact.name}
                onChange={handleContactChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.name)}
                className={cn(fieldControl, "pl-11", errors.name && "border-red-700")}
              />
            </div>
            {errors.name && <p className={fieldError}>{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="offer-email" className={fieldLabel}>
              Email address
            </label>
            <div className="relative">
              <Mail className={leadingIcon} aria-hidden="true" />
              <input
                id="offer-email"
                type="email"
                name="email"
                autoComplete="email"
                value={contact.email}
                onChange={handleContactChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                className={cn(fieldControl, "pl-11", errors.email && "border-red-700")}
              />
            </div>
            {errors.email && <p className={fieldError}>{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="offer-phone" className={fieldLabel}>
              Phone number
            </label>
            <div className="relative">
              <Phone className={leadingIcon} aria-hidden="true" />
              <input
                id="offer-phone"
                type="tel"
                name="phone"
                autoComplete="tel"
                value={contact.phone}
                onChange={handleContactChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.phone)}
                className={cn(fieldControl, "pl-11", errors.phone && "border-red-700")}
              />
            </div>
            {errors.phone && <p className={fieldError}>{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Buying Position */}
      <div className={group}>
        <label className={fieldLabel}>
          Your Buying Position <span className="text-red-700">*</span>
        </label>
        {errors.position && (
          <p className="mb-3 text-sm text-red-700">{errors.position}</p>
        )}
        <div className="space-y-3">
          {buyerPositions.map((pos) => (
            <label
              key={pos.value}
              className={cn(
                "flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border p-4 transition-colors duration-200",
                formData.position === pos.value
                  ? "border-banc-focus ring-1 ring-banc-focus"
                  : "border-banc-line hover:border-banc-focus",
                isSubmitting && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name="position"
                value={pos.value}
                checked={formData.position === pos.value}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, position: pos.value }))
                }
                disabled={isSubmitting}
                className="mt-0.5 h-5 w-5 shrink-0 accent-banc-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
              />
              <div>
                <span className="font-medium text-banc-dark-deep">{pos.label}</span>
                <p className="text-sm text-banc-muted-readable">{pos.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Timescale */}
      <div className={group}>
        <label className={fieldLabel}>
          Preferred Timescale <span className="text-red-700">*</span>
        </label>
        {errors.timescale && (
          <p className="mb-3 text-sm text-red-700">{errors.timescale}</p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {timescales.map((time) => {
            const active = formData.timescale === time.value;
            return (
              <label
                key={time.value}
                className={cn(
                  "flex min-h-11 cursor-pointer flex-col rounded-[var(--radius-md)] border p-3 transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-banc-focus has-[:focus-visible]:ring-offset-2",
                  active
                    ? "border-banc-focus bg-banc-focus text-white"
                    : "border-banc-line bg-white hover:border-banc-focus",
                  isSubmitting && "cursor-not-allowed opacity-60",
                )}
              >
                <input
                  type="radio"
                  name="timescale"
                  value={time.value}
                  checked={formData.timescale === time.value}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      timescale: time.value as OfferSubmission["timescale"],
                    }))
                  }
                  disabled={isSubmitting}
                  className="sr-only"
                />
                <Clock className={cn("mb-2 h-5 w-5", active ? "text-white" : "text-banc-focus")} />
                <span className={cn("text-sm font-medium", active ? "text-white" : "text-banc-dark-deep")}>
                  {time.label}
                </span>
                <span className={cn("text-xs", active ? "text-white/80" : "text-banc-muted-readable")}>
                  {time.description}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Additional Options */}
      <div className={group}>
        <h4 className="mb-2 font-heading font-semibold text-banc-dark-deep">Additional Information</h4>

        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={formData.mortgageInPrinciple}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                mortgageInPrinciple: e.target.checked,
              }))
            }
            disabled={isSubmitting}
            className={checkbox}
          />
          <span className="text-banc-dark-deep">
            I have a Mortgage Agreement in Principle
          </span>
        </label>

        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={formData.chainFree}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, chainFree: e.target.checked }))
            }
            disabled={isSubmitting}
            className={checkbox}
          />
          <span className="text-banc-dark-deep">I am chain-free</span>
        </label>
      </div>

      {/* Proof of Funds Upload */}
      <div className={group}>
        <label className={fieldLabel}>
          Proof of Funds (Optional)
        </label>
        <p className={cn(fieldHelp, "mb-4 mt-0")}>
          Name the document you can provide — a bank statement or a mortgage
          agreement in principle strengthens your offer. The file stays on your
          device; we tell the team it is ready and they will ask you for it.
        </p>

        <div className="rounded-[var(--radius-md)] border border-dashed border-banc-dark/30 p-4">
          {proofOfFundsFile ? (
            <div className="flex flex-wrap items-center gap-3">
              <FileText className="h-8 w-8 shrink-0 text-green-700" />
              <div className="min-w-0 flex-1">
                <p className="break-words font-medium text-banc-dark-deep">
                  {proofOfFundsFile.name}
                </p>
                <p className="text-sm text-banc-muted-readable">
                  {(proofOfFundsFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProofOfFundsFile(null)}
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-red-700 underline-offset-2 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <Upload className="h-6 w-6 shrink-0 text-banc-muted-readable" />
              <span>
                <span className="block text-sm font-medium text-banc-dark-deep">
                  Choose the file to name for the team
                </span>
                <span className="mt-1 block text-xs text-banc-muted-readable">
                  PDF, JPG, PNG up to 10MB
                </span>
              </span>
              <input
                type="file"
                onChange={handleFileChange}
                disabled={isSubmitting}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Additional Comments */}
      <div className={group}>
        <label className={fieldLabel}>
          Additional Comments (Optional)
        </label>
        <textarea
          value={formData.additionalComments}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              additionalComments: e.target.value,
            }))
          }
          disabled={isSubmitting}
          placeholder="Any additional information that might support your offer..."
          rows={4}
          className={cn(fieldControl, fieldTextarea, "h-auto resize-none")}
        />
      </div>

      {/* Terms */}
      <div className={group}>
        <label className="flex min-h-11 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                agreedToTerms: e.target.checked,
              }));
              if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
            }}
            disabled={isSubmitting}
            className={cn(checkbox, "mt-0.5")}
          />
          <div>
            <span className="text-banc-dark-deep">
              I confirm this is a genuine offer and I understand that providing
              false information may result in legal action.
            </span>
            <p className="text-sm text-banc-muted-readable mt-1">
              I agree to the{" "}
              <a href="/terms" className="text-banc-focus underline underline-offset-2">
                Terms of Business
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-banc-focus underline underline-offset-2">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </label>
        {errors.terms && (
          <p className={fieldError}>{errors.terms}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={actionPrimary}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting Offer...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            Submit Offer
          </>
        )}
      </button>

      <p className="text-sm text-banc-muted-readable">
        Your offer will be reviewed and the vendor will be notified within 24
        hours.
      </p>
    </form>
  );
}
