"use client";

import React from "react";
import { Clock, Check, AlertCircle } from "lucide-react";
import { TimeSlot } from "@/types/portal";

interface TimeSlotsProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  date: Date;
}

export default function TimeSlots({
  slots,
  selectedSlot,
  onSelectSlot,
  date,
}: TimeSlotsProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const availableSlots = slots.filter((slot) => slot.available);
  const unavailableCount = slots.filter((slot) => !slot.available).length;

  return (
    <div className="bg-white rounded-xl border border-banc-line overflow-hidden">
      <div className="px-5 py-4 border-b border-banc-line">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-semibold text-banc-dark-deep">
              Available Times
            </h3>
            <p className="text-sm text-banc-grey mt-0.5">
              {date.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-banc-grey">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-banc-sky rounded-full" />
              Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-banc-line rounded-full" />
              Booked
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        {slots.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="w-10 h-10 text-banc-line mx-auto mb-3" />
            <p className="text-banc-grey">No time slots available</p>
            <p className="text-sm text-banc-grey mt-1">
              Please select a different date
            </p>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="w-10 h-10 text-banc-line mx-auto mb-3" />
            <p className="text-banc-grey">All slots booked for this date</p>
            <p className="text-sm text-banc-grey mt-1">
              Please select a different date
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.map((slot) => {
              const isSelected = selectedSlot === slot.id;
              const isAvailable = slot.available;

              return (
                <button
                  key={slot.id}
                  onClick={() => isAvailable && onSelectSlot(slot.id)}
                  disabled={!isAvailable}
                  className={`
                    relative p-3 rounded-lg border-2 text-center transition-all
                    ${
                      isSelected
                        ? "border-banc-sky bg-banc-sky/5"
                        : isAvailable
                        ? "border-banc-line hover:border-banc-sky hover:bg-banc-grey-pale"
                        : "border-banc-grey-pale bg-banc-grey-pale opacity-50 cursor-not-allowed"
                    }
                  `}
                >
                  <span
                    className={`block font-medium ${
                      isSelected
                        ? "text-banc-sky"
                        : isAvailable
                        ? "text-banc-dark-deep"
                        : "text-banc-grey"
                    }`}
                  >
                    {formatTime(slot.time)}
                  </span>
                  <span className="block text-xs text-banc-grey mt-0.5">
                    {slot.duration} mins
                  </span>
                  {isSelected && (
                    <span className="absolute top-1 right-1">
                      <Check className="w-4 h-4 text-banc-sky" />
                    </span>
                  )}
                  {!isAvailable && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-banc-grey bg-white/80 px-2 py-0.5 rounded">
                        Booked
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {unavailableCount > 0 && availableSlots.length > 0 && (
        <div className="px-5 py-3 border-t border-banc-line bg-banc-grey-pale/50">
          <p className="text-xs text-banc-grey text-center">
            {unavailableCount} slot{unavailableCount !== 1 ? "s" : ""} already booked
          </p>
        </div>
      )}
    </div>
  );
}
