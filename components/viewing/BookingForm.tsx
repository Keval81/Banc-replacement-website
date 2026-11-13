"use client";

import React, { useState } from "react";
import { User, Mail, Phone, MessageSquare, Check } from "lucide-react";
import { ViewingBookingRequest } from "@/types/portal";
import { actionPrimary, fieldControl, fieldError, fieldLabel, fieldTextarea, formPanel } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

interface BookingFormProps {
  propertyId: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSubmit: (data: ViewingBookingRequest) => void;
  isSubmitting?: boolean;
}

export default function BookingForm({
  propertyId,
  selectedDate,
  selectedTime,
  onSubmit,
  isSubmitting = false,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
    isRegisteredUser: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.name.trim().length < 2) {
      newErrors.name = "Please enter your full name";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedDate || !selectedTime) return;

    const bookingData: ViewingBookingRequest = {
      propertyId,
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialRequests: formData.specialRequests,
      isRegisteredUser: formData.isRegisteredUser,
    };

    onSubmit(bookingData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const isComplete = selectedDate && selectedTime;

  const leadingIcon = "pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-banc-muted-readable";

  return (
    <div className={formPanel}>
      <div className="mb-6 border-b border-banc-dark/15 pb-5">
        <h3 className="font-heading font-semibold text-banc-dark-deep">
          Your Details
        </h3>
        {!isComplete && (
          <p className="text-sm text-banc-muted-readable mt-1">
            Please select a date and time above
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className={fieldLabel}>
            Full Name <span className="text-red-700">*</span>
          </label>
          <div className="relative">
            <User className={leadingIcon} />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isComplete || isSubmitting}
              placeholder="Enter your full name"
              className={cn(fieldControl, "pl-11", errors.name && "border-red-700")}
            />
          </div>
          {errors.name && (
            <p className={fieldError}>{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className={fieldLabel}>
            Email Address <span className="text-red-700">*</span>
          </label>
          <div className="relative">
            <Mail className={leadingIcon} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isComplete || isSubmitting}
              placeholder="your@email.com"
              className={cn(fieldControl, "pl-11", errors.email && "border-red-700")}
            />
          </div>
          {errors.email && (
            <p className={fieldError}>{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className={fieldLabel}>
            Phone Number <span className="text-red-700">*</span>
          </label>
          <div className="relative">
            <Phone className={leadingIcon} />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isComplete || isSubmitting}
              placeholder="+44 123 456 7890"
              className={cn(fieldControl, "pl-11", errors.phone && "border-red-700")}
            />
          </div>
          {errors.phone && (
            <p className={fieldError}>{errors.phone}</p>
          )}
        </div>

        {/* Special Requests */}
        <div>
          <label className={fieldLabel}>
            Special Requests (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-banc-muted-readable" />
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              disabled={!isComplete || isSubmitting}
              placeholder="Any special requirements or questions..."
              rows={3}
              className={cn(fieldControl, fieldTextarea, "h-auto resize-none pl-11")}
            />
          </div>
        </div>

        {/* Terms */}
        <div>
          <label className="flex min-h-11 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (errors.terms) {
                  setErrors((prev) => ({ ...prev, terms: "" }));
                }
              }}
              disabled={!isComplete || isSubmitting}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-banc-line accent-banc-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
            />
            <span className="text-sm text-banc-muted-readable">
              I agree to Banc Property Group&apos;s{" "}
              <a href="/privacy" className="text-banc-focus underline underline-offset-2">
                Privacy Policy
              </a>{" "}
              and consent to being contacted regarding this viewing request.
            </span>
          </label>
          {errors.terms && (
            <p className={fieldError}>{errors.terms}</p>
          )}
        </div>

        {/* Selected Date/Time Summary */}
        {isComplete && (
          <div className="border-t border-banc-dark/15 pt-5">
            <p className="text-sm text-banc-muted-readable">Selected Viewing:</p>
            <p className="font-medium text-banc-dark-deep">
              {selectedDate.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              at {selectedTime}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isComplete || isSubmitting}
          className={actionPrimary}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Send viewing request
            </>
          )}
        </button>

        {!isComplete && (
          <p className="text-sm text-banc-muted-readable">
            Please select a date and time to continue
          </p>
        )}
      </form>
    </div>
  );
}
