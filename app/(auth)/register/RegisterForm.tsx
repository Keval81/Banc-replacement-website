"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import { actionPrimary, actionSecondary, eyebrow, fieldControl, fieldLabel, formPanel } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Account", description: "Your details" },
  { id: 2, title: "Requirements", description: "What you need" },
  { id: 3, title: "Timeline", description: "When & more" },
  { id: 4, title: "Confirm", description: "Review & finish" },
];

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    transactionType: "buy",
    propertyTypes: [] as string[],
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill in all required fields");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-banc-grey-pale">
        <PageBand eyebrow="Create your account" title={steps[currentStep - 1].title} lede={steps[currentStep - 1].description} />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(formPanel, "max-w-xl")}
          >
            <div className="mb-6">
              <p className={eyebrow}>
                Step {currentStep} of {steps.length}
              </p>
              <div
                className="mt-3 h-0.5 w-full bg-banc-line"
                role="progressbar"
                aria-label="Registration progress"
                aria-valuemin={1}
                aria-valuemax={steps.length}
                aria-valuenow={currentStep}
              >
                <div
                  className="h-full bg-banc-focus transition-[width] duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="mb-6 rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <Label className={fieldLabel}>Full Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => updateFormData("name", e.target.value)}
                        className={fieldControl}
                      />
                    </div>
                    <div>
                      <Label className={fieldLabel}>Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        className={fieldControl}
                      />
                    </div>
                    <div>
                      <Label className={fieldLabel}>Password</Label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                        className={fieldControl}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} className={cn(actionSecondary, "sm:flex-1")}>
                  Back
                </Button>
              )}
              {currentStep < 4 ? (
                <Button onClick={handleNext} className={cn(actionPrimary, "shadow-none sm:flex-1")}>
                  Continue
                </Button>
              ) : (
                <Button onClick={handleSubmit} className={cn(actionPrimary, "shadow-none sm:flex-1")}>
                  Create Account
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
