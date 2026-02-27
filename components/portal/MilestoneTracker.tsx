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
          <div className="w-8 h-8 bg-[#1DBFDD] rounded-full flex items-center justify-center ring-4 ring-[#1DBFDD]/20">
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
          <div className="w-8 h-8 bg-[#C8C9CB] rounded-full flex items-center justify-center">
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
        return "text-[#1DBFDD]";
      case "blocked":
        return "text-red-600";
      case "pending":
      default:
        return "text-[#6B6E72]";
    }
  };

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const progress = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="bg-white rounded-xl border border-[#C8C9CB] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#C8C9CB]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-semibold text-[#2C2F33]">
            Sale Progress
          </h3>
          <span className="text-sm font-medium text-[#1DBFDD]">
            {completedCount} of {milestones.length} completed
          </span>
        </div>
        <div className="w-full h-2 bg-[#F0F0ED] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1DBFDD] to-[#4DD4F0] rounded-full transition-all duration-500"
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
                      : "bg-[#C8C9CB]"
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
                            ? "text-[#2C2F33]"
                            : milestone.status === "in_progress"
                            ? "text-[#2C2F33]"
                            : "text-[#6B6E72]"
                        }`}
                      >
                        {milestone.title}
                      </p>
                      {showDetails && milestone.description && (
                        <p className="text-sm text-[#6B6E72] mt-0.5">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        milestone.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : milestone.status === "in_progress"
                          ? "bg-[#1DBFDD]/10 text-[#0E8CAB]"
                          : milestone.status === "blocked"
                          ? "bg-red-100 text-red-700"
                          : "bg-[#F0F0ED] text-[#6B6E72]"
                      }`}
                    >
                      {getStatusLabel(milestone.status)}
                    </span>
                  </div>

                  {/* Dates */}
                  {(milestone.completedDate || milestone.estimatedDate) && (
                    <div className="mt-2 text-xs text-[#6B6E72]">
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
