"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Bell, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Favorite } from "@/types";

interface AccountOverviewProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function AccountOverview({ user }: AccountOverviewProps) {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch("/api/favorites");
        if (response.ok) {
          const data = await response.json();
          setFavoritesCount(data.length);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const quickActions = [
    {
      title: "Saved Properties",
      count: isLoading ? "..." : favoritesCount,
      icon: Heart,
      href: "/favorites",
      color: "text-red-400",
      bgColor: "bg-red-400/10",
    },
    {
      title: "Property Alerts",
      count: 0,
      icon: Bell,
      href: "/alerts",
      color: "text-banc-sky",
      bgColor: "bg-banc-sky/10",
    },
    {
      title: "Requirements",
      count: null,
      icon: Home,
      href: "/account/requirements",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-8"
      >
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user.name?.split(" ")[0] || "there"}!
        </h1>
        <p className="mt-2 text-white/60">
          Manage your property search, view your favorites, and update your requirements.
        </p>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={action.href}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.bgColor}`}
                >
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div>
                  <p className="font-medium text-white">{action.title}</p>
                  {action.count !== null && (
                    <p className="text-sm text-white/60">
                      {action.count} {action.count === 1 ? "item" : "items"}
                    </p>
                  )}
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-white/40 transition-colors group-hover:text-white" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity / Getting Started */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-8"
      >
        <h2 className="mb-4 text-lg font-semibold text-white">
          Getting Started
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-banc-sky/20 text-sm font-medium text-banc-sky">
              1
            </div>
            <div>
              <p className="font-medium text-white">Set up your property requirements</p>
              <p className="text-sm text-white/60">
                Tell us what you&apos;re looking for so we can match you with the perfect property.
              </p>
              <Link href="/account/requirements">
                <Button
                  variant="link"
                  className="mt-1 h-auto p-0 text-banc-sky hover:text-banc-sky-dark"
                >
                  Update requirements →
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white/60">
              2
            </div>
            <div>
              <p className="font-medium text-white">Browse properties</p>
              <p className="text-sm text-white/60">
                Start searching for your dream property in your preferred areas.
              </p>
              <Link href="/sales/properties">
                <Button
                  variant="link"
                  className="mt-1 h-auto p-0 text-banc-sky hover:text-banc-sky-dark"
                >
                  View properties →
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white/60">
              3
            </div>
            <div>
              <p className="font-medium text-white">Save your favorites</p>
              <p className="text-sm text-white/60">
                Heart properties you like to create your shortlist.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}