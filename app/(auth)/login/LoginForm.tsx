"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import { actionPrimary, fieldControl, fieldLabel, formPanel } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  // Middleware sends users here with ?reason=unavailable when accounts are not configured.
  const accountsUnavailable = searchParams.get("reason") === "unavailable";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      // Redirect to callback URL or account page
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <main>
        <PageBand eyebrow="Your account" title="Welcome Back" lede="Sign in to access your account" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(formPanel, "max-w-xl")}
          >
            {accountsUnavailable && (
              <div
                role="status"
                className="mb-6 rounded-[var(--radius-md)] border border-banc-line bg-banc-grey-pale p-4 text-sm text-banc-dark-deep"
              >
                Accounts are not available yet. Please check back soon, or{" "}
                <Link href="/contact" className="text-banc-focus underline underline-offset-4 hover:text-banc-focus-hover">
                  contact us
                </Link>{" "}
                for help.
              </div>
            )}

            {error && (
              <div role="alert" className="mb-6 rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className={fieldLabel}>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className={fieldControl}
                />
              </div>

              <div>
                <Label htmlFor="password" className={fieldLabel}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className={fieldControl}
                />
              </div>

              {/* No password reset exists yet — there is no token, no expiry and
                  no reset mail — so the link only led to a 404. Until the flow
                  is built, the office resets accounts by hand. */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <label className="flex min-h-11 items-center">
                  <input type="checkbox" className="h-4 w-4 rounded border-banc-line accent-[var(--banc-focus)]" />
                  <span className="ml-2 text-sm text-banc-muted-readable">Remember me</span>
                </label>
                <p className="text-sm text-banc-muted-readable">
                  Forgotten your password?{" "}
                  <Link href="/contact" className="text-banc-focus underline underline-offset-4 hover:text-banc-focus-hover">
                    Ask the team
                  </Link>
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className={cn(actionPrimary, "shadow-none sm:w-full")}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 border-t border-banc-dark/15 pt-6 text-sm text-banc-muted-readable">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-banc-focus underline underline-offset-4 hover:text-banc-focus-hover">
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
