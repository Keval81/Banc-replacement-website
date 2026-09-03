"use client";

import Link from "next/link";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import PortalNav from "./PortalNav";
import { PortalUser } from "@/types/portal";
import { Bell, Menu, X, User, ChevronDown } from "lucide-react";

interface PortalLayoutProps {
  children: React.ReactNode;
  user: PortalUser;
  notifications?: number;
}

export default function PortalLayout({
  children,
  user,
  notifications = 0,
}: PortalLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  const getPortalTitle = () => {
    if (pathname.includes("/vendor")) return "Vendor Portal";
    if (pathname.includes("/applicant")) return "Buyer Portal";
    if (pathname.includes("/landlord")) return "Landlord Portal";
    return "Portal";
  };

  return (
    <div className="min-h-screen bg-banc-grey-pale">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-banc-line shadow-sm">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          {/* Left: Menu button + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-banc-grey-pale transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6 text-banc-dark-deep" />
              ) : (
                <Menu className="w-6 h-6 text-banc-dark-deep" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-banc-sky rounded-lg flex items-center justify-center">
                <span className="text-banc-dark-deep font-bold text-sm">B</span>
              </div>
              <div>
                <p className="font-heading font-semibold text-banc-dark-deep text-lg leading-tight">
                  Banc Property
                </p>
                <p className="text-xs text-banc-muted-readable">{getPortalTitle()}</p>
              </div>
            </div>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg hover:bg-banc-grey-pale transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-banc-muted-readable" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-banc-focus text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {notifications > 9 ? "9+" : notifications}
                </span>
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-banc-grey-pale transition-colors"
              >
                <div className="w-8 h-8 bg-banc-sky-dark rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-banc-dark-deep leading-tight">
                    {user.name}
                  </p>
                  <p className="text-xs text-banc-muted-readable capitalize">{user.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-banc-muted-readable hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-banc-line z-50 overflow-hidden">
                    <div className="p-4 border-b border-banc-line">
                      <p className="font-medium text-banc-dark-deep">{user.name}</p>
                      <p className="text-sm text-banc-muted-readable">{user.email}</p>
                    </div>
                    <nav className="p-2">
                      <a
                        href="/portal/settings"
                        className="block px-4 py-2 text-sm text-banc-dark-deep hover:bg-banc-grey-pale rounded-lg transition-colors"
                      >
                        Settings
                      </a>
                      <a
                        href="/portal/help"
                        className="block px-4 py-2 text-sm text-banc-dark-deep hover:bg-banc-grey-pale rounded-lg transition-colors"
                      >
                        Help & Support
                      </a>
                      <hr className="my-2 border-banc-line" />
                      <Link
                        href="/api/auth/signout"
                        prefetch={false}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Sign Out
                      </Link>
                    </nav>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white border-r border-banc-line transform transition-transform duration-300 ease-in-out lg:transform-none ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <PortalNav userRole={user.role} onNavigate={() => setIsSidebarOpen(false)} />
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
