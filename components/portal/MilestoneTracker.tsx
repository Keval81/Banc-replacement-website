"use client";

import React from "react";
import { Milestone } from "@/types/portal";
import { Check, Clock, Hourglass, AlertCircle } from "lucide-react";

interface MilestoneTrackerProps {
  milestones: Milestone[];
  showDetails?: boolean;
}

export default function MilestoneTracker({
  milestones,
  showDetails = true,
}: MilestoneTrackerProps) {
  const getStatusIcon = (status: Milestone["status"]) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        );
      case "in_progress":
        return (
          <div className="w-8 h-8 bg-banc-sky rounded-full flex items-center justify-center ring-4 ring-banc-sky/20">
            <Clock className="w-4 h-4 text-white" />
          </div>
        );
      case "blocked":
        return (
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
        );
      case "pending":
      default:
        return (
          <div className="w-8 h-8 bg-banc-line rounded-full flex items-center justify-center">
            <Hourglass className="w-4 h-4 text-white" />
          </div>
        );
    }
  };

  const getStatusLabel = (status: Milestone["status"]) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "blocked":
        return "Blocked";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const getStatusColor = (status: Milestone["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-banc-sky";
      case "blocked":
        return "text-red-600";
      case "pending":
      default:
        return "text-banc-grey";
    }
  };

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const progress = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="bg-white rounded-xl border border-banc-line overflow-hidden">
      <div className="px-5 py-4 border-b border-banc-line">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-semibold text-banc-dark-deep">
            Sale Progress
          </h3>
          <span className="text-sm font-medium text-banc-sky">
            {completedCount} of {milestones.length} completed
          </span>
        </div>
        <div className="w-full h-2 bg-banc-grey-pale rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-banc-sky to-banc-sky-mid rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-0">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              {/* Connector Line */}
              {index < milestones.length - 1 && (
                <div
                  className={`absolute left-4 top-8 w-0.5 h-[calc(100%+1rem)] ${
                    milestone.status === "completed"
                      ? "bg-green-500"
                      : "bg-banc-line"
                  }`}
                />
              )}

              {/* Milestone Item */}
              <div className="flex gap-4 pb-6 last:pb-0">
                <div className="flex-shrink-0">{getStatusIcon(milestone.status)}</div>
                <div className="flex-1 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={`font-medium ${
                          milestone.status === "completed"
                            ? "text-banc-dark-deep"
                            : milestone.status === "in_progress"
                            ? "text-banc-dark-deep"
                            : "text-banc-grey"
                        }`}
                      >
                        {milestone.title}
                      </p>
                      {showDetails && milestone.description && (
                        <p className="text-sm text-banc-grey mt-0.5">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        milestone.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : milestone.status === "in_progress"
                          ? "bg-banc-sky/10 text-banc-sky-dark"
                          : milestone.status === "blocked"
                          ? "bg-red-100 text-red-700"
                          : "bg-banc-grey-pale text-banc-grey"
                      }`}
                    >
                      {getStatusLabel(milestone.status)}
                    </span>
                  </div>

                  {/* Dates */}
                  {(milestone.completedDate || milestone.estimatedDate) && (
                    <div className="mt-2 text-xs text-banc-grey">
                      {milestone.completedDate ? (
                        <span className="text-green-600">
                          Completed: {new Date(milestone.completedDate).toLocaleDateString("en-GB")}
                        </span>
                      ) : milestone.estimatedDate ? (
                        <span>
                          Est. completion: {new Date(milestone.estimatedDate).toLocaleDateString("en-GB")}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
