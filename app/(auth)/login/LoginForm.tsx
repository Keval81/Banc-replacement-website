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
    <div className="min-h-screen bg-gradient-to-br from-banc-dark-deep via-[#1a1d21] to-[#0f1113]">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-white/60">
                Sign in to access your account
              </p>
            </div>

            {accountsUnavailable && (
              <div
                role="status"
                className="mb-6 p-4 bg-white/10 border border-white/20 rounded-lg text-white/80 text-sm"
              >
                Accounts are not available yet. Please check back soon, or{" "}
                <Link href="/contact" className="text-banc-gold-dark hover:text-banc-gold">
                  contact us
                </Link>{" "}
                for help.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-white/80">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-white/80">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              {/* No password reset exists yet — there is no token, no expiry and
                  no reset mail — so the link only led to a 404. Until the flow
                  is built, the office resets accounts by hand. */}
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-white/20 bg-white/5 text-banc-gold-dark" />
                  <span className="ml-2 text-sm text-white/60">Remember me</span>
                </label>
                <p className="text-sm text-white/60">
                  Forgotten your password?{" "}
                  <Link href="/contact" className="text-banc-gold hover:text-white underline underline-offset-4">
                    Ask the team
                  </Link>
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#C5A880] hover:bg-[#D4B88F] text-[#1C1C1C] font-semibold py-6"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-white/60">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-banc-gold-dark hover:text-banc-gold font-medium">
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
