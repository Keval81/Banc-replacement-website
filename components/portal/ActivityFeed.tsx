"use client";

import React from "react";
import {
  PropertyActivity,
  getRelativeTime,
} from "@/types/portal";
import {
  Eye,
  FileText,
  MessageSquare,
  Megaphone,
  CheckCircle,
  PoundSterling,
} from "lucide-react";

interface ActivityFeedProps {
  activities: PropertyActivity[];
  maxItems?: number;
  showViewAll?: boolean;
}

export default function ActivityFeed({
  activities,
  maxItems = 10,
  showViewAll = true,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: PropertyActivity["type"]) => {
    switch (type) {
      case "viewing":
        return <Eye className="w-4 h-4 text-white" />;
      case "offer":
        return <PoundSterling className="w-4 h-4 text-white" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-white" />;
      case "marketing":
        return <Megaphone className="w-4 h-4 text-white" />;
      case "milestone":
        return <CheckCircle className="w-4 h-4 text-white" />;
      default:
        return <FileText className="w-4 h-4 text-white" />;
    }
  };

  const getActivityColor = (type: PropertyActivity["type"]) => {
    switch (type) {
      case "viewing":
        return "bg-[#1DBFDD]";
      case "offer":
        return "bg-green-500";
      case "message":
        return "bg-[#0E8CAB]";
      case "marketing":
        return "bg-purple-500";
      case "milestone":
        return "bg-[#4DD4F0]";
      default:
        return "bg-[#6B6E72]";
    }
  };

  const getOfferStatusBadge = (status?: string) => {
    if (!status) return null;
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      countered: "bg-blue-100 text-blue-800",
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-[#C8C9CB] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#C8C9CB] flex items-center justify-between">
        <h3 className="font-heading font-semibold text-[#2C2F33]">Activity Feed</h3>
        <span className="text-sm text-[#6B6E72]">
          {activities.length} activities
        </span>
      </div>

      <div className="divide-y divide-[#C8C9CB]">
        {displayActivities.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <div className="w-12 h-12 bg-[#F0F0ED] rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-[#6B6E72]" />
            </div>
            <p className="text-[#6B6E72]">No recent activity</p>
            <p className="text-sm text-[#6B6E72] mt-1">
              Activities will appear here as they happen
            </p>
          </div>
        ) : (
          displayActivities.map((activity) => (
            <div
              key={activity.id}
              className="px-5 py-4 hover:bg-[#F0F0ED]/50 transition-colors"
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-[#2C2F33]">
                        {activity.title}
                      </p>
                      <p className="text-sm text-[#6B6E72] mt-0.5">
                        {activity.description}
                      </p>

                      {/* Metadata based on type */}
                      {activity.metadata && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {activity.metadata.viewingTime && (
                            <span className="text-sm text-[#0E8CAB]">
                              {activity.metadata.viewingTime}
                            </span>
                          )}
                          {activity.metadata.offerAmount && (
                            <span className="text-sm font-medium text-green-600">
                              £{activity.metadata.offerAmount.toLocaleString()}
                            </span>
                          )}
                          {getOfferStatusBadge(activity.metadata.offerStatus)}
                          {activity.metadata.senderName && (
                            <span className="text-sm text-[#6B6E72]">
                              From: {activity.metadata.senderName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-[#6B6E72] flex-shrink-0">
                      {getRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showViewAll && activities.length > maxItems && (
        <div className="px-5 py-3 border-t border-[#C8C9CB] bg-[#F0F0ED]/50">
          <a
            href="#"
            className="text-sm font-medium text-[#1DBFDD] hover:text-[#0E8CAB] transition-colors"
          >
            View all activity →
          </a>
        </div>
      )}
    </div>
  );
}
