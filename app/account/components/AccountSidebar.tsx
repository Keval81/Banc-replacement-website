"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  Heart,
  Bell,
  Settings,
  SlidersHorizontal,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface AccountSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { name: "Overview", href: "/account", icon: User },
  { name: "Favorites", href: "/favorites", icon: Heart },
  { name: "Property Alerts", href: "/alerts", icon: Bell },
  { name: "Requirements", href: "/account/requirements", icon: SlidersHorizontal },
  { name: "Settings", href: "/account/settings", icon: Settings },
];

export default function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-28 space-y-6">
        {/* User Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-banc-sky/20 text-banc-sky">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="font-semibold text-white">
                {user.name || "Welcome"}
              </p>
              <p className="text-sm text-white/60">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-banc-sky/10 text-banc-sky"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </nav>
      </div>
    </aside>
  );
}