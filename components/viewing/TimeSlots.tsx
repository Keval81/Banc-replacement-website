"use client";

import React from "react";
import { Clock, Check, AlertCircle } from "lucide-react";
import { TimeSlot } from "@/types/portal";
import { choiceChip, formPanel } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

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
    <div className={formPanel}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-banc-dark/15 pb-5">
        <div>
          <h3 className="font-heading font-semibold text-banc-dark-deep">
            Available Times
          </h3>
          <p className="text-sm text-banc-muted-readable mt-0.5">
            {date.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-banc-muted-readable">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-banc-focus rounded-full" />
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-banc-line rounded-full" />
            Booked
          </span>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="py-4">
          <Clock className="mb-3 h-8 w-8 text-banc-muted-readable" />
          <p className="text-banc-muted-readable">No time slots available</p>
          <p className="text-sm text-banc-muted-readable mt-1">
            Please select a different date
          </p>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="py-4">
          <AlertCircle className="mb-3 h-8 w-8 text-banc-muted-readable" />
          <p className="text-banc-muted-readable">All slots booked for this date</p>
          <p className="text-sm text-banc-muted-readable mt-1">
            Please select a different date
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {slots.map((slot) => {
            const isSelected = selectedSlot === slot.id;
            const isAvailable = slot.available;

            return (
              <button
                key={slot.id}
                onClick={() => isAvailable && onSelectSlot(slot.id)}
                disabled={!isAvailable}
                className={cn(
                  choiceChip(isSelected),
                  "relative w-full flex-col gap-0 py-2",
                  !isAvailable && "cursor-not-allowed bg-banc-grey-pale opacity-50 hover:border-banc-line",
                )}
              >
                <span className="block font-semibold">
                  {formatTime(slot.time)}
                </span>
                <span className={`mt-0.5 block text-xs ${isSelected ? "text-white/80" : "text-banc-muted-readable"}`}>
                  {slot.duration} mins
                </span>
                {isSelected && (
                  <span className="absolute top-1 right-1">
                    <Check className="w-4 h-4 text-white" />
                  </span>
                )}
                {!isAvailable && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-banc-muted-readable bg-white/80 px-2 py-0.5 rounded">
                      Booked
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {unavailableCount > 0 && availableSlots.length > 0 && (
        <p className="mt-5 border-t border-banc-dark/15 pt-4 text-xs text-banc-muted-readable">
          {unavailableCount} slot{unavailableCount !== 1 ? "s" : ""} already booked
        </p>
      )}
    </div>
  );
}
