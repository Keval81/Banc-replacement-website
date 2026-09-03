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
        return "bg-banc-sky";
      case "offer":
        return "bg-green-500";
      case "message":
        return "bg-banc-sky-dark";
      case "marketing":
        return "bg-purple-500";
      case "milestone":
        return "bg-banc-sky-mid";
      default:
        return "bg-banc-grey";
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
          styles[status] || "bg-banc-grey-pale text-banc-dark"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-banc-line overflow-hidden">
      <div className="px-5 py-4 border-b border-banc-line flex items-center justify-between">
        <h3 className="font-heading font-semibold text-banc-dark-deep">Activity Feed</h3>
        <span className="text-sm text-banc-muted-readable">
          {activities.length} activities
        </span>
      </div>

      <div className="divide-y divide-banc-line">
        {displayActivities.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <div className="w-12 h-12 bg-banc-grey-pale rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-banc-muted-readable" />
            </div>
            <p className="text-banc-muted-readable">No recent activity</p>
            <p className="text-sm text-banc-muted-readable mt-1">
              Activities will appear here as they happen
            </p>
          </div>
        ) : (
          displayActivities.map((activity) => (
            <div
              key={activity.id}
              className="px-5 py-4 hover:bg-banc-grey-pale/50 transition-colors"
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
                      <p className="font-medium text-banc-dark-deep">
                        {activity.title}
                      </p>
                      <p className="text-sm text-banc-muted-readable mt-0.5">
                        {activity.description}
                      </p>

                      {/* Metadata based on type */}
                      {activity.metadata && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {activity.metadata.viewingTime && (
                            <span className="text-sm text-banc-focus">
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
                            <span className="text-sm text-banc-muted-readable">
                              From: {activity.metadata.senderName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-banc-muted-readable flex-shrink-0">
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
        <div className="px-5 py-3 border-t border-banc-line bg-banc-grey-pale/50">
          <a
            href="#"
            className="text-sm font-medium text-banc-focus hover:text-banc-sky-dark transition-colors"
          >
            View all activity →
          </a>
        </div>
      )}
    </div>
  );
}
