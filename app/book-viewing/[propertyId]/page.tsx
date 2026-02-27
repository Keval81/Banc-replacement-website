"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import CalendarPicker from "@/components/viewing/CalendarPicker";
import TimeSlots from "@/components/viewing/TimeSlots";
import BookingForm from "@/components/viewing/BookingForm";
import {
  TimeSlot,
  ViewingBookingRequest,
} from "@/types/portal";
import {
  ChevronLeft,
  Home,
  MapPin,
  Bed,
  Bath,
  PoundSterling,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";

// Mock property data - would come from API
const mockProperty = {
  id: "prop-123",
  address: "12 The Ridings, Cuffley",
  postcode: "EN6 4JL",
  price: "£925,000",
  bedrooms: 4,
  bathrooms: 2,
  image: "/images/property-1.jpg",
  agent: {
    name: "Sarah Williams",
    phone: "+44 1707 123456",
    image: "/images/agent-sarah.jpg",
  },
};

// Mock available slots - would come from API
const generateMockSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
  
  // Randomly mark some as unavailable
  times.forEach((time, index) => {
    slots.push({
      id: `slot-${index}`,
      time,
      available: Math.random() > 0.3,
      duration: 30,
    });
  });
  
  return slots;
};

export default function BookViewingPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    // In real app, fetch slots from API
    setAvailableSlots(generateMockSlots(date));
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
  };

  const handleSubmit = async (data: ViewingBookingRequest) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // In real app, submit to API
    console.log("Booking submitted:", data);
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const getSelectedTime = () => {
    const slot = availableSlots.find((s) => s.id === selectedSlot);
    return slot?.time || null;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F0F0ED] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-[#C8C9CB] p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-[#2C2F33] mb-3">
              Viewing Request Submitted!
            </h1>
            <p className="text-[#6B6E72] mb-6">
              We&apos;ve received your request to view{" "}
              <strong>{mockProperty.address}</strong> on{" "}
              <strong>
                {selectedDate?.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </strong>{" "}
              at <strong>{getSelectedTime()}</strong>.
            </p>
            <div className="bg-[#F0F0ED] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#6B6E72]">
                You&apos;ll receive a confirmation email shortly. The agent will
                contact you to confirm the appointment.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/portal/applicant"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1DBFDD] text-white rounded-lg font-medium hover:bg-[#0E8CAB] transition-colors"
              >
                Go to My Portal
              </a>
              <a
                href="/sales/properties"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#C8C9CB] text-[#2C2F33] rounded-lg font-medium hover:bg-[#F0F0ED] transition-colors"
              >
                Browse More Properties
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0ED] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <a
          href={`/sales/properties/${propertyId}`}
          className="inline-flex items-center gap-2 text-[#6B6E72] hover:text-[#1DBFDD] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to property
        </a>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#2C2F33]">
            Book a Viewing
          </h1>
          <p className="text-[#6B6E72] mt-2">
            Select your preferred date and time to view this property
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-[#C8C9CB] overflow-hidden sticky top-4">
              <img
                src={mockProperty.image}
                alt={mockProperty.address}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h2 className="font-heading font-semibold text-[#2C2F33]">
                  {mockProperty.address}
                </h2>
                <p className="text-[#6B6E72] text-sm">{mockProperty.postcode}</p>
                <p className="text-xl font-bold text-[#1DBFDD] mt-2">
                  {mockProperty.price}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-[#6B6E72]">
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {mockProperty.bedrooms} beds
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    {mockProperty.bathrooms} baths
                  </span>
                </div>

                {/* Agent Info */}
                <div className="mt-5 pt-5 border-t border-[#C8C9CB]">
                  <p className="text-sm text-[#6B6E72] mb-2">Your Agent</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1DBFDD]/10 rounded-full flex items-center justify-center">
                      <Home className="w-5 h-5 text-[#1DBFDD]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2C2F33]">
                        {mockProperty.agent.name}
                      </p>
                      <p className="text-sm text-[#6B6E72]">
                        {mockProperty.agent.phone}
                      </p>
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
              <h2 className="text-lg font-semibold text-[#2C2F33] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#1DBFDD] text-white rounded-full flex items-center justify-center text-sm">
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
                <h2 className="text-lg font-semibold text-[#2C2F33] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#1DBFDD] text-white rounded-full flex items-center justify-center text-sm">
                    2
                  </span>
                  Select a Time
                </h2>
                <TimeSlots
                  slots={availableSlots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={handleSlotSelect}
                  date={selectedDate}
                />
              </div>
            )}

            {/* Step 3: Contact Details */}
            {selectedDate && (
              <div>
                <h2 className="text-lg font-semibold text-[#2C2F33] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#1DBFDD] text-white rounded-full flex items-center justify-center text-sm">
                    3
                  </span>
                  Your Details
                </h2>
                <BookingForm
                  propertyId={propertyId}
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
