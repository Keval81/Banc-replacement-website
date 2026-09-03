"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  TrendingUp,
  Users,
  Briefcase,
  Heart,
  PoundSterling,
  BarChart3,
  Wrench,
} from "lucide-react";

interface PortalNavProps {
  userRole: "vendor" | "applicant" | "landlord" | "admin";
  onNavigate?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export default function PortalNav({ userRole, onNavigate }: PortalNavProps) {
  const pathname = usePathname();

  const getNavItems = (): NavItem[] => {
    switch (userRole) {
      case "vendor":
        return [
          { label: "Dashboard", href: "/portal/vendor", icon: LayoutDashboard },
          { label: "My Property", href: "/portal/vendor/property", icon: Home },
          { label: "Viewings", href: "/portal/vendor/viewings", icon: Calendar },
          { label: "Offers", href: "/portal/vendor/offers", icon: FileText },
          { label: "Documents", href: "/portal/vendor/documents", icon: FileText },
          { label: "Messages", href: "/portal/vendor/messages", icon: MessageSquare },
          { label: "Progress", href: "/portal/vendor/progress", icon: TrendingUp },
        ];
      case "applicant":
        return [
          { label: "Dashboard", href: "/portal/applicant", icon: LayoutDashboard },
          { label: "Saved Properties", href: "/portal/applicant/saved", icon: Heart },
          { label: "Viewings", href: "/portal/applicant/viewings", icon: Calendar },
          { label: "My Offers", href: "/portal/applicant/offers", icon: FileText },
          { label: "Alerts", href: "/portal/applicant/alerts", icon: Bell },
          { label: "Messages", href: "/portal/applicant/messages", icon: MessageSquare },
        ];
      case "landlord":
        return [
          { label: "Dashboard", href: "/portal/landlord", icon: LayoutDashboard },
          { label: "My Properties", href: "/portal/landlord/properties", icon: Home },
          { label: "Tenants", href: "/portal/landlord/tenants", icon: Users },
          { label: "Maintenance", href: "/portal/landlord/maintenance", icon: Wrench },
          { label: "Financials", href: "/portal/landlord/financials", icon: BarChart3 },
          { label: "Documents", href: "/portal/landlord/documents", icon: FileText },
          { label: "Compliance", href: "/portal/landlord/compliance", icon: Briefcase },
          { label: "Messages", href: "/portal/landlord/messages", icon: MessageSquare },
        ];
      default:
        return [
          { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
        ];
    }
  };

  const navItems = getNavItems();
  const secondaryItems: NavItem[] = [
    { label: "Settings", href: "/portal/settings", icon: Settings },
    { label: "Help", href: "/portal/help", icon: MessageSquare },
  ];

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (href !== "/portal/vendor" && href !== "/portal/applicant" && href !== "/portal/landlord") {
      return pathname.startsWith(href);
    }
    return false;
  };

  return (
    <div className="flex flex-col h-full py-4">
      {/* Primary Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-banc-focus text-white"
                  : "text-banc-muted-readable hover:bg-banc-grey-pale hover:text-banc-dark-deep"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    active ? "bg-white/20 text-white" : "bg-banc-focus text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="px-3 pt-4 border-t border-banc-line space-y-1">
        {secondaryItems.map((item) => {
          const active = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-banc-focus text-white"
                  : "text-banc-muted-readable hover:bg-banc-grey-pale hover:text-banc-dark-deep"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>

      {/* Help Card */}
      <div className="px-4 py-4 mt-4 mx-3 bg-banc-grey-pale rounded-xl">
        <p className="text-xs text-banc-muted-readable mb-2">Need assistance?</p>
        <a
          href="/contact"
          className="text-sm font-medium text-banc-focus hover:text-banc-sky-dark transition-colors"
        >
          Contact your agent →
        </a>
      </div>
    </div>
  );
}
