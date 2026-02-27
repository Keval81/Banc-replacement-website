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
        return "bg-[#1DBFDD]";
      case "offer":
        return "bg-green-500";
      case "message":
        return "bg-[#0E8CAB]";
      case "document":
        return "bg-purple-500";
      case "milestone":
        return "bg-amber-500";
      default:
        return "bg-[#6B6E72]";
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
        className="relative p-2 rounded-lg hover:bg-[#F0F0ED] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-[#6B6E72]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1DBFDD] text-white text-xs font-medium rounded-full flex items-center justify-center">
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
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-[#C8C9CB] z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#C8C9CB] flex items-center justify-between">
              <h3 className="font-heading font-semibold text-[#2C2F33]">
                Notifications
              </h3>
              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  onClick={() => {
                    onMarkAllAsRead();
                  }}
                  className="text-xs text-[#1DBFDD] hover:text-[#0E8CAB] transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-10 h-10 text-[#C8C9CB] mx-auto mb-3" />
                  <p className="text-[#6B6E72]">No notifications</p>
                  <p className="text-sm text-[#6B6E72]">
                    You&apos;re all caught up!
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-[#C8C9CB] last:border-b-0 cursor-pointer transition-colors ${
                      notification.read
                        ? "bg-white"
                        : "bg-[#1DBFDD]/5 hover:bg-[#1DBFDD]/10"
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
                            <p className="font-medium text-[#2C2F33] text-sm">
                              {notification.title}
                            </p>
                            <p className="text-sm text-[#6B6E72] mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[#6B6E72] mt-1">
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
                                className="p-1.5 rounded-lg hover:bg-[#F0F0ED] text-[#6B6E72] hover:text-[#1DBFDD] transition-colors"
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
                                className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B6E72] hover:text-red-500 transition-colors"
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
                        <span className="w-2 h-2 bg-[#1DBFDD] rounded-full" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#C8C9CB] bg-[#F0F0ED]/50">
              <a
                href="/portal/notifications"
                className="block text-center text-sm text-[#1DBFDD] hover:text-[#0E8CAB] transition-colors"
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
