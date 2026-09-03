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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Offer Amount */}
      <div className="bg-white rounded-xl border border-banc-line p-5">
        <label className="block text-sm font-medium text-banc-dark-deep mb-3">
          Your Offer Amount
        </label>
        <div className="relative">
          <PoundSterling className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-banc-muted-readable" />
          <input
            type="text"
            value={formData.amount ? formData.amount.toLocaleString() : ""}
            onChange={(e) => handleAmountChange(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter offer amount"
            className={`
              w-full pl-12 pr-4 py-3 text-2xl font-semibold rounded-lg border bg-white
              focus:outline-none focus:ring-2 focus:ring-banc-sky focus:border-banc-sky
              disabled:bg-banc-grey-pale disabled:cursor-not-allowed
              ${errors.amount ? "border-red-500" : "border-banc-line"}
            `}
          />
        </div>
        {errors.amount && (
          <p className="mt-2 text-sm text-red-500">{errors.amount}</p>
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
                  difference > 0 ? "text-green-600" : "text-amber-600"
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
              className="px-3 py-1.5 text-sm bg-banc-grey-pale hover:bg-banc-sky/10 text-banc-muted-readable hover:text-banc-sky rounded-lg transition-colors disabled:opacity-50"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Your Details */}
      <div className="bg-white rounded-xl border border-banc-line p-5">
        <p className="block text-sm font-medium text-banc-dark-deep mb-3">
          Your Details <span className="text-red-500">*</span>
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="offer-name" className="block text-sm text-banc-muted-readable mb-1.5">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-banc-muted-readable" aria-hidden="true" />
              <input
                id="offer-name"
                type="text"
                name="name"
                autoComplete="name"
                value={contact.name}
                onChange={handleContactChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.name)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-banc-sky focus:border-banc-sky disabled:bg-banc-grey-pale disabled:cursor-not-allowed ${errors.name ? "border-red-500" : "border-banc-line"}`}
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="offer-email" className="block text-sm text-banc-muted-readable mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-banc-muted-readable" aria-hidden="true" />
              <input
                id="offer-email"
                type="email"
                name="email"
                autoComplete="email"
                value={contact.email}
                onChange={handleContactChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-banc-sky focus:border-banc-sky disabled:bg-banc-grey-pale disabled:cursor-not-allowed ${errors.email ? "border-red-500" : "border-banc-line"}`}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="offer-phone" className="block text-sm text-banc-muted-readable mb-1.5">
              Phone number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-banc-muted-readable" aria-hidden="true" />
              <input
                id="offer-phone"
                type="tel"
                name="phone"
                autoComplete="tel"
                value={contact.phone}
                onChange={handleContactChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.phone)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-banc-sky focus:border-banc-sky disabled:bg-banc-grey-pale disabled:cursor-not-allowed ${errors.phone ? "border-red-500" : "border-banc-line"}`}
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Buying Position */}
      <div className="bg-white rounded-xl border border-banc-line p-5">
        <label className="block text-sm font-medium text-banc-dark-deep mb-3">
          Your Buying Position <span className="text-red-500">*</span>
        </label>
        {errors.position && (
          <p className="mb-3 text-sm text-red-500">{errors.position}</p>
        )}
        <div className="space-y-3">
          {buyerPositions.map((pos) => (
            <label
              key={pos.value}
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${
                  formData.position === pos.value
                    ? "border-banc-sky bg-banc-sky/5"
                    : "border-banc-line hover:border-banc-sky/50"
                }
                ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
              `}
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
                className="mt-0.5 w-4 h-4 text-banc-focus focus:ring-banc-sky"
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
      <div className="bg-white rounded-xl border border-banc-line p-5">
        <label className="block text-sm font-medium text-banc-dark-deep mb-3">
          Preferred Timescale <span className="text-red-500">*</span>
        </label>
        {errors.timescale && (
          <p className="mb-3 text-sm text-red-500">{errors.timescale}</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {timescales.map((time) => (
            <label
              key={time.value}
              className={`
                flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all
                ${
                  formData.timescale === time.value
                    ? "border-banc-sky bg-banc-sky/5"
                    : "border-banc-line hover:border-banc-sky/50"
                }
                ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
              `}
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
              <Clock className="w-5 h-5 text-banc-focus mb-2" />
              <span className="font-medium text-banc-dark-deep text-sm">
                {time.label}
              </span>
              <span className="text-xs text-banc-muted-readable">{time.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className="bg-white rounded-xl border border-banc-line p-5 space-y-4">
        <h4 className="font-medium text-banc-dark-deep">Additional Information</h4>

        <label className="flex items-center gap-3 cursor-pointer">
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
            className="w-4 h-4 rounded border-banc-line text-banc-focus focus:ring-banc-sky"
          />
          <span className="text-banc-dark-deep">
            I have a Mortgage Agreement in Principle
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.chainFree}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, chainFree: e.target.checked }))
            }
            disabled={isSubmitting}
            className="w-4 h-4 rounded border-banc-line text-banc-focus focus:ring-banc-sky"
          />
          <span className="text-banc-dark-deep">I am chain-free</span>
        </label>
      </div>

      {/* Proof of Funds Upload */}
      <div className="bg-white rounded-xl border border-banc-line p-5">
        <label className="block text-sm font-medium text-banc-dark-deep mb-3">
          Proof of Funds (Optional)
        </label>
        <p className="text-sm text-banc-muted-readable mb-3">
          Upload bank statement or mortgage agreement in principle to strengthen
          your offer
        </p>

        <div className="border-2 border-dashed border-banc-line rounded-lg p-6 text-center">
          {proofOfFundsFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-banc-dark-deep">
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
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <Upload className="w-8 h-8 text-banc-muted-readable mx-auto mb-2" />
              <p className="text-sm text-banc-dark-deep">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-banc-muted-readable mt-1">
                PDF, JPG, PNG up to 10MB
              </p>
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
      <div className="bg-white rounded-xl border border-banc-line p-5">
        <label className="block text-sm font-medium text-banc-dark-deep mb-3">
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
          className="
            w-full px-4 py-3 rounded-lg border border-banc-line bg-white
            focus:outline-none focus:ring-2 focus:ring-banc-sky focus:border-banc-sky
            disabled:bg-banc-grey-pale disabled:cursor-not-allowed resize-none
          "
        />
      </div>

      {/* Terms */}
      <div className="bg-banc-grey-pale rounded-xl p-5">
        <label className="flex items-start gap-3 cursor-pointer">
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
            className="mt-1 w-4 h-4 rounded border-banc-line text-banc-focus focus:ring-banc-sky"
          />
          <div>
            <span className="text-banc-dark-deep">
              I confirm this is a genuine offer and I understand that providing
              false information may result in legal action.
            </span>
            <p className="text-sm text-banc-muted-readable mt-1">
              I agree to the{" "}
              <a href="/terms" className="text-banc-focus hover:underline">
                Terms of Business
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-banc-focus hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </label>
        {errors.terms && (
          <p className="mt-2 text-sm text-red-500">{errors.terms}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all
          flex items-center justify-center gap-2
          ${
            isSubmitting
              ? "bg-banc-line cursor-not-allowed"
              : "bg-banc-sky hover:bg-banc-sky-dark"
          }
          text-white
        `}
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

      <p className="text-center text-sm text-banc-muted-readable">
        Your offer will be reviewed and the vendor will be notified within 24
        hours.
      </p>
    </form>
  );
}
