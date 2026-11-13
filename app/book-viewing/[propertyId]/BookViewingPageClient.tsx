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
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildViewingEnquiry, submitContactEnquiry } from "@/lib/property-enquiry";
import { buildPropertyHref } from "@/lib/property-view";
import { PageBand } from "@/components/PageBand";
import { actionPrimary, actionSecondary, formPanel } from "@/components/ui/form-styles";
import {
  TimeSlot,
  ViewingBookingRequest,
} from "@/types/portal";
import {
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
      <div className="min-h-screen bg-banc-grey-pale px-4 py-12">
        <div
          className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-banc-focus motion-reduce:animate-none" aria-hidden="true" />
          <p className="text-banc-muted-readable">Loading property…</p>
        </div>
      </div>
    );
  }

  if (propertyState.phase === "notfound") {
    return (
      <div className="min-h-screen bg-banc-grey-pale px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className={formPanel}>
            <h1 className="mb-3 font-display text-3xl font-light leading-[1.08] tracking-[-0.02em] text-banc-dark">
              We couldn&apos;t find that property
            </h1>
            <p className="mb-6 text-banc-muted-readable">
              It may have been sold, let or withdrawn from the market. You can
              browse our current listings or call the office on{" "}
              <a href={BANC_CONTACT.callHref} className="text-banc-focus underline underline-offset-2">
                {BANC_CONTACT.displayPhone}
              </a>
              .
            </p>
            <Link href="/sales/properties" className={actionPrimary}>
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
      <div className="min-h-screen bg-banc-grey-pale px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className={formPanel} role="status">
            <CheckCircle className="mb-5 h-10 w-10 text-green-700" aria-hidden="true" />
            <h2 className="mb-3 font-display text-3xl font-light leading-[1.08] tracking-[-0.02em] text-banc-dark">
              Viewing request sent
            </h2>
            <p className="text-banc-muted-readable">
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
            <p className="mt-6 border-t border-banc-dark/15 pt-6 text-sm text-banc-muted-readable">
              This is your preferred slot, not a confirmed appointment. One of
              the team will come back to you to arrange it, and we&apos;ve
              emailed you a copy of what you sent.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={propertyHref} className={actionPrimary}>
                Back to the property
              </Link>
              <Link href="/sales/properties" className={actionSecondary}>
                Browse More Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stepHeading =
    "mb-6 flex items-baseline gap-3 font-display text-2xl font-light leading-[1.08] tracking-[-0.02em] text-banc-dark";
  const stepNumber = "font-sans text-sm font-semibold tabular-nums text-banc-focus";

  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />
      <PageBand
        eyebrow="Arrange a visit"
        title="Request a Viewing"
        lede="Tell us the date and time that suit you. Nothing is booked until one of the team confirms it with you."
        back={{ href: propertyHref, label: "Back to the property" }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-banc-line bg-white lg:sticky lg:top-28">
              <div className="relative h-48 w-full bg-banc-grey-pale">
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
                <h2 className="font-heading font-semibold text-banc-dark-deep">
                  {property.title}
                </h2>
                <p className="text-banc-muted-readable text-sm">{property.address}</p>
                {property.postcode ? (
                  <p className="text-banc-muted-readable text-sm">{property.postcode}</p>
                ) : null}
                <p className="text-xl font-bold text-banc-focus mt-2">
                  {property.price}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-banc-muted-readable">
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
                  className="mt-2 inline-flex min-h-11 items-center text-sm text-banc-focus underline-offset-2 hover:underline"
                >
                  View full details →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="space-y-12 lg:col-span-2">
            {/* Step 1: Calendar */}
            <div>
              <h2 className={stepHeading}>
                <span className={stepNumber}>1</span>
                Choose a Preferred Date
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
                <h2 className={stepHeading}>
                  <span className={stepNumber}>2</span>
                  Choose a Preferred Time
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
                <h2 className={stepHeading}>
                  <span className={stepNumber}>3</span>
                  Your Details
                </h2>
                {submitError && (
                  <div
                    role="alert"
                    className="mb-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 text-sm text-red-800"
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
      <Footer />
    </div>
  );
}
