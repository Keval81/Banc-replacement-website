"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export default function CalendarPicker({
  selectedDate,
  onSelectDate,
  availableDates = [],
  minDate = new Date(),
  maxDate,
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isDateAvailable = (date: Date) => {
    if (availableDates.length === 0) return true;
    return availableDates.some(
      (d) =>
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    );
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    if (!isDateDisabled(date)) {
      onSelectDate(date);
    }
  };

  // Generate calendar grid
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthButton =
    "inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-banc-grey-pale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus";

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-banc-line bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-banc-line px-2 py-2">
        <button
          onClick={handlePrevMonth}
          className={monthButton}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-banc-muted-readable" />
        </button>
        <h3 className="font-heading font-semibold text-banc-dark-deep">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={handleNextMonth}
          className={monthButton}
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-banc-muted-readable" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-0 border-b border-banc-line">
        {dayNames.map((day) => (
          <div
            key={day}
            className="grid place-items-center py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-banc-muted-readable"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 p-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-11 sm:h-14" />;
          }

          const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
          );
          const disabled = isDateDisabled(date);
          const selected = isSelected(date);
          const available = isDateAvailable(date);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              className={`
                relative flex min-h-11 items-center justify-center rounded-md text-sm
                transition-colors sm:h-14
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2
                ${disabled ? "text-banc-line cursor-not-allowed" : ""}
                ${
                  selected
                    ? "bg-banc-focus text-white font-semibold"
                    : !disabled
                    ? "hover:bg-banc-grey-pale text-banc-dark-deep"
                    : ""
                }
              `}
            >
              {day}
              {/* Available indicator dot */}
              {!disabled && available && !selected && (
                <span className="absolute bottom-1 w-1 h-1 bg-banc-focus rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
