"use client";

import React, { useState } from "react";
import { User, Mail, Phone, MessageSquare, Check } from "lucide-react";
import { ViewingBookingRequest } from "@/types/portal";

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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
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

  return (
    <div className="bg-white rounded-xl border border-[#C8C9CB] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#C8C9CB]">
        <h3 className="font-heading font-semibold text-[#2C2F33]">
          Your Details
        </h3>
        {!isComplete && (
          <p className="text-sm text-[#6B6E72] mt-1">
            Please select a date and time above
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[#2C2F33] mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6E72]" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isComplete || isSubmitting}
              placeholder="Enter your full name"
              className={`
                w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white
                focus:outline-none focus:ring-2 focus:ring-[#1DBFDD] focus:border-[#1DBFDD]
                disabled:bg-[#F0F0ED] disabled:cursor-not-allowed
                ${errors.name ? "border-red-500" : "border-[#C8C9CB]"}
              `}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#2C2F33] mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6E72]" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isComplete || isSubmitting}
              placeholder="your@email.com"
              className={`
                w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white
                focus:outline-none focus:ring-2 focus:ring-[#1DBFDD] focus:border-[#1DBFDD]
                disabled:bg-[#F0F0ED] disabled:cursor-not-allowed
                ${errors.email ? "border-red-500" : "border-[#C8C9CB]"}
              `}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-[#2C2F33] mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6E72]" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isComplete || isSubmitting}
              placeholder="+44 123 456 7890"
              className={`
                w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white
                focus:outline-none focus:ring-2 focus:ring-[#1DBFDD] focus:border-[#1DBFDD]
                disabled:bg-[#F0F0ED] disabled:cursor-not-allowed
                ${errors.phone ? "border-red-500" : "border-[#C8C9CB]"}
              `}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-[#2C2F33] mb-1.5">
            Special Requests (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-[#6B6E72]" />
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              disabled={!isComplete || isSubmitting}
              placeholder="Any special requirements or questions..."
              rows={3}
              className="
                w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#C8C9CB] bg-white
                focus:outline-none focus:ring-2 focus:ring-[#1DBFDD] focus:border-[#1DBFDD]
                disabled:bg-[#F0F0ED] disabled:cursor-not-allowed resize-none
              "
            />
          </div>
        </div>

        {/* Terms */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
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
              className="mt-1 w-4 h-4 rounded border-[#C8C9CB] text-[#1DBFDD] focus:ring-[#1DBFDD]"
            />
            <span className="text-sm text-[#6B6E72]">
              I agree to Banc Property Group&apos;s{" "}
              <a href="/privacy" className="text-[#1DBFDD] hover:underline">
                Privacy Policy
              </a>{" "}
              and consent to being contacted regarding this viewing request.
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-500">{errors.terms}</p>
          )}
        </div>

        {/* Selected Date/Time Summary */}
        {isComplete && (
          <div className="p-4 bg-[#F0F0ED] rounded-lg">
            <p className="text-sm text-[#6B6E72]">Selected Viewing:</p>
            <p className="font-medium text-[#2C2F33]">
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
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-all
            flex items-center justify-center gap-2
            ${
              isComplete && !isSubmitting
                ? "bg-[#1DBFDD] text-white hover:bg-[#0E8CAB]"
                : "bg-[#C8C9CB] text-white cursor-not-allowed"
            }
          `}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Confirm Booking Request
            </>
          )}
        </button>

        {!isComplete && (
          <p className="text-center text-sm text-[#6B6E72]">
            Please select a date and time to continue
          </p>
        )}
      </form>
    </div>
  );
}
