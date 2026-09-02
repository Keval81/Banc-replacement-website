"use client";

import Link from "next/link";
import Image from "next/image";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import CalendarPicker from "@/components/viewing/CalendarPicker";
import TimeSlots from "@/components/viewing/TimeSlots";
import BookingForm from "@/components/viewing/BookingForm";
import { useLiveProperty } from "@/hooks/useLiveProperty";
import { BANC_CONTACT } from "@/lib/banc-contact";
import { buildViewingEnquiry, submitContactEnquiry } from "@/lib/property-enquiry";
import { buildPropertyHref } from "@/lib/property-view";
import {
  TimeSlot,
  ViewingBookingRequest,
} from "@/types/portal";
import {
  ChevronLeft,
  Home,
  Bed,
  Bath,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Preferred-time options. These are requested times, not confirmed
// availability — the office confirms every appointment by phone or email.
const PREFERRED_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

const PREFERRED_SLOTS: TimeSlot[] = PREFERRED_TIMES.map((time, index) => ({
  id: `slot-${index}`,
  time,
  available: true,
  duration: 30,
}));

export default function BookViewingPage() {
  const params = useParams();
  const propertyId = typeof params.propertyId === "string" ? params.propertyId : "";
  const propertyState = useLiveProperty(propertyId);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
  };

  const handleSubmit = async (data: ViewingBookingRequest) => {
    if (propertyState.phase !== "ready") return;
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = buildViewingEnquiry(propertyState.property, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      date: data.date,
      time: data.time,
      specialRequests: data.specialRequests,
    });
    const result = await submitContactEnquiry(fetch, payload);

    setIsSubmitting(false);
    if (result.ok) {
      setIsSuccess(true);
    } else {
      setSubmitError(result.error);
    }
  };

  const getSelectedTime = () => {
    const slot = PREFERRED_SLOTS.find((s) => s.id === selectedSlot);
    return slot?.time || null;
  };

  if (propertyState.phase === "loading") {
    return (
      <div className="min-h-screen bg-[#F4F3F1] py-8 px-4">
        <div
          className="max-w-6xl mx-auto flex min-h-[50vh] flex-col items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#4AC8E8] motion-reduce:animate-none" aria-hidden="true" />
          <p className="text-[#8A8880]">Loading property…</p>
        </div>
      </div>
    );
  }

  if (propertyState.phase === "notfound") {
    return (
      <div className="min-h-screen bg-[#F4F3F1] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-[#E0DFDC] p-8 text-center">
            <h1 className="text-2xl font-heading font-bold text-[#1A1917] mb-3">
              We couldn&apos;t find that property
            </h1>
            <p className="text-[#8A8880] mb-6">
              It may have been sold, let or withdrawn from the market. You can
              browse our current listings or call the office on{" "}
              <a href={BANC_CONTACT.callHref} className="text-[#4AC8E8] hover:underline">
                {BANC_CONTACT.displayPhone}
              </a>
              .
            </p>
            <Link
              href="/sales/properties"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4AC8E8] text-white rounded-lg font-medium hover:bg-[#1A9BBF] transition-colors"
            >
              Browse properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const property = propertyState.property;
  const propertyHref = buildPropertyHref(property.department, property.id);
  const heroImage = property.images[0];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F4F3F1] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-[#E0DFDC] p-8 text-center" role="status">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-[#1A1917] mb-3">
              Viewing request sent
            </h2>
            <p className="text-[#8A8880] mb-6">
              We&apos;ve received your request to view{" "}
              <strong>{property.title}</strong> on{" "}
              <strong>
                {selectedDate?.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </strong>{" "}
              at <strong>{getSelectedTime()}</strong>.
            </p>
            <div className="bg-[#F4F3F1] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#8A8880]">
                You&apos;ll receive a confirmation email shortly. Our team will
                contact you to confirm the appointment time.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={propertyHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4AC8E8] text-white rounded-lg font-medium hover:bg-[#1A9BBF] transition-colors"
              >
                Back to the property
              </Link>
              <Link
                href="/sales/properties"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#E0DFDC] text-[#1A1917] rounded-lg font-medium hover:bg-[#F4F3F1] transition-colors"
              >
                Browse More Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F3F1] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          href={propertyHref}
          className="inline-flex items-center gap-2 text-[#8A8880] hover:text-[#4AC8E8] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back to property
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#1A1917]">
            Book a Viewing
          </h1>
          <p className="text-[#8A8880] mt-2">
            Select your preferred date and time to view this property
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-[#E0DFDC] overflow-hidden sticky top-4">
              <div className="relative h-48 w-full bg-[#F4F3F1]">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={`${property.title}, ${property.address}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="p-5">
                <h2 className="font-heading font-semibold text-[#1A1917]">
                  {property.title}
                </h2>
                <p className="text-[#8A8880] text-sm">{property.address}</p>
                {property.postcode ? (
                  <p className="text-[#8A8880] text-sm">{property.postcode}</p>
                ) : null}
                <p className="text-xl font-bold text-[#4AC8E8] mt-2">
                  {property.price}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-[#8A8880]">
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" aria-hidden="true" />
                    {property.stats.beds} beds
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" aria-hidden="true" />
                    {property.stats.baths} baths
                  </span>
                </div>
                <Link
                  href={propertyHref}
                  className="text-sm text-[#4AC8E8] hover:underline mt-3 inline-block"
                >
                  View full details →
                </Link>

                {/* Office Info */}
                <div className="mt-5 pt-5 border-t border-[#E0DFDC]">
                  <p className="text-sm text-[#8A8880] mb-2">Your agent</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#4AC8E8]/10 rounded-full flex items-center justify-center">
                      <Home className="w-5 h-5 text-[#4AC8E8]" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1917]">
                        Banc Property Group
                      </p>
                      <a
                        href={BANC_CONTACT.callHref}
                        className="text-sm text-[#8A8880] hover:text-[#4AC8E8]"
                      >
                        {BANC_CONTACT.displayPhone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Calendar */}
            <div>
              <h2 className="text-lg font-semibold text-[#1A1917] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#4AC8E8] text-white rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                Select a Date
              </h2>
              <CalendarPicker
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                minDate={new Date()}
              />
            </div>

            {/* Step 2: Time Slots */}
            {selectedDate && (
              <div>
                <h2 className="text-lg font-semibold text-[#1A1917] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#4AC8E8] text-white rounded-full flex items-center justify-center text-sm">
                    2
                  </span>
                  Select a Preferred Time
                </h2>
                <TimeSlots
                  slots={PREFERRED_SLOTS}
                  selectedSlot={selectedSlot}
                  onSelectSlot={handleSlotSelect}
                  date={selectedDate}
                />
              </div>
            )}

            {/* Step 3: Contact Details */}
            {selectedDate && (
              <div>
                <h2 className="text-lg font-semibold text-[#1A1917] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#4AC8E8] text-white rounded-full flex items-center justify-center text-sm">
                    3
                  </span>
                  Your Details
                </h2>
                {submitError && (
                  <div
                    role="alert"
                    className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                  >
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <p>{submitError}</p>
                  </div>
                )}
                <BookingForm
                  propertyId={property.id}
                  selectedDate={selectedDate}
                  selectedTime={getSelectedTime()}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
