"use client";

import React, { useState, useEffect } from "react";
import { Notification, getRelativeTime } from "@/types/portal";
import {
  Bell,
  X,
  Eye,
  FileText,
  MessageSquare,
  CheckCircle,
  PoundSterling,
  Trash2,
} from "lucide-react";

interface NotificationSystemProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationSystem({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
}: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".notification-dropdown")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "viewing":
        return <Eye className="w-4 h-4 text-white" />;
      case "offer":
        return <PoundSterling className="w-4 h-4 text-white" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-white" />;
      case "document":
        return <FileText className="w-4 h-4 text-white" />;
      case "milestone":
        return <CheckCircle className="w-4 h-4 text-white" />;
      default:
        return <Bell className="w-4 h-4 text-white" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "viewing":
        return "bg-[#4AC8E8]";
      case "offer":
        return "bg-green-500";
      case "message":
        return "bg-[#1A9BBF]";
      case "document":
        return "bg-purple-500";
      case "milestone":
        return "bg-amber-500";
      default:
        return "bg-[#8A8880]";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative notification-dropdown">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[#F4F3F1] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-[#8A8880]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#4AC8E8] text-white text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-[#E0DFDC] z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#E0DFDC] flex items-center justify-between">
              <h3 className="font-heading font-semibold text-[#1A1917]">
                Notifications
              </h3>
              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  onClick={() => {
                    onMarkAllAsRead();
                  }}
                  className="text-xs text-[#4AC8E8] hover:text-[#1A9BBF] transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-10 h-10 text-[#E0DFDC] mx-auto mb-3" />
                  <p className="text-[#8A8880]">No notifications</p>
                  <p className="text-sm text-[#8A8880]">
                    You&apos;re all caught up!
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-[#E0DFDC] last:border-b-0 cursor-pointer transition-colors ${
                      notification.read
                        ? "bg-white"
                        : "bg-[#4AC8E8]/5 hover:bg-[#4AC8E8]/10"
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1" onClick={() => handleNotificationClick(notification)}>
                            <p className="font-medium text-[#1A1917] text-sm">
                              {notification.title}
                            </p>
                            <p className="text-sm text-[#8A8880] mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[#8A8880] mt-1">
                              {getRelativeTime(notification.timestamp)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1">
                            {!notification.read && onMarkAsRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarkAsRead(notification.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-[#F4F3F1] text-[#8A8880] hover:text-[#4AC8E8] transition-colors"
                                title="Mark as read"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(notification.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-[#8A8880] hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="flex justify-end mt-2">
                        <span className="w-2 h-2 bg-[#4AC8E8] rounded-full" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#E0DFDC] bg-[#F4F3F1]/50">
              <a
                href="/portal/notifications"
                className="block text-center text-sm text-[#4AC8E8] hover:text-[#1A9BBF] transition-colors"
              >
                View all notifications →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
