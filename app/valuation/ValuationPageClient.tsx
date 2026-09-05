"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/select";
import {
  CheckCircle,
  Home,
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  MessageSquare,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BANC_CONTACT } from "@/lib/banc-contact";

const propertyTypes = [
  "Detached House",
  "Semi-Detached House",
  "Terraced House",
  "Bungalow",
  "Flat / Apartment",
  "Maisonette",
  "Cottage",
  "Other",
];

const bedrooms = ["Studio", "1", "2", "3", "4", "5", "6+"];

const timeframes = [
  "As soon as possible",
  "Within 1 month",
  "Within 3 months",
  "Within 6 months",
  "Just curious",
];

const steps = [
  { id: 1, title: "Address", icon: MapPin },
  { id: 2, title: "Property", icon: Home },
  { id: 3, title: "Contact", icon: User },
  { id: 4, title: "Results", icon: CheckCircle },
];

export default function ValuationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postcode: "",
    propertyType: "",
    bedrooms: "",
    timeframe: "",
    message: "",
  });
  const [consent, setConsent] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.address.trim() || !formData.postcode.trim()) {
          setError("Please enter your property address and postcode.");
          return false;
        }
        return true;
      case 2:
        return true; // Property details are optional
      case 3:
        if (!formData.firstName.trim() || !formData.email.trim() || !formData.phone.trim()) {
          setError("Please fill in your name, email, and phone number.");
          return false;
        }
        if (!consent) {
          setError("Please confirm you are happy for us to contact you via phone and email.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        handleSubmit();
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, 4));
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Failed to submit request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <main className="px-4 py-8 pb-24 lg:px-8 lg:py-12 lg:pb-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-3 font-display text-3xl font-semibold text-banc-dark lg:text-4xl">
              Request a Free Valuation
            </h1>
            <p className="text-banc-muted-readable">
              Discover the true value of your property in 3 simple steps
            </p>
          </motion.div>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                          isCompleted
                            ? "bg-banc-focus text-white"
                            : isActive
                            ? "bg-banc-focus text-white ring-4 ring-banc-sky/20"
                            : "bg-white text-banc-muted-readable border border-banc-grey/30"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium hidden sm:block ${
                          isActive || isCompleted ? "text-banc-dark" : "text-banc-muted-readable"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`mx-2 h-0.5 flex-1 transition-colors duration-300 ${
                          currentStep > step.id ? "bg-banc-sky" : "bg-banc-grey/20"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-red-700"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <div className="rounded-2xl bg-white p-6 shadow-lg lg:p-10">
            <AnimatePresence mode="wait">
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-banc-dark">
                      <MapPin className="h-5 w-5 text-banc-focus" />
                      Where is your property?
                    </h2>
                    <p className="mt-1 text-sm text-banc-muted-readable">
                      Enter the address of the property you&apos;d like valued
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="address" className="block text-sm font-medium text-banc-dark">
                        Property Address *
                      </label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        className="min-h-[100px]"
                        placeholder="123 Station Road, Cuffley, Hertfordshire..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="postcode" className="block text-sm font-medium text-banc-dark">
                        Postcode *
                      </label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => handleChange("postcode", e.target.value)}
                        placeholder="EN6 4HU"
                        className="max-w-xs"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Property Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-banc-dark">
                      <Home className="h-5 w-5 text-banc-focus" />
                      Tell us about your property
                    </h2>
                    <p className="mt-1 text-sm text-banc-muted-readable">
                      These details help us provide a more accurate valuation
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-banc-dark">Property Type</label>
                      <NativeSelect
                        value={formData.propertyType}
                        onChange={(e) => handleChange("propertyType", e.target.value)}
                      >
                        <option value="">Select type</option>
                        {propertyTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </NativeSelect>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-banc-dark">Bedrooms</label>
                      <div className="flex flex-wrap gap-2">
                        {bedrooms.map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleChange("bedrooms", num)}
                            className={`rounded-[6px] border px-5 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer min-h-[44px] ${
                              formData.bedrooms === num
                                ? "border-banc-sky bg-banc-focus text-white"
                                : "border-banc-grey/20 text-banc-dark hover:border-banc-sky"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-banc-dark">
                        <Calendar className="mb-0.5 mr-1 inline h-4 w-4 text-banc-focus" />
                        Looking to sell in...
                      </label>
                      <NativeSelect
                        value={formData.timeframe}
                        onChange={(e) => handleChange("timeframe", e.target.value)}
                      >
                        <option value="">Select timeframe</option>
                        {timeframes.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </NativeSelect>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-banc-dark">
                      <User className="h-5 w-5 text-banc-focus" />
                      Your contact details
                    </h2>
                    <p className="mt-1 text-sm text-banc-muted-readable">
                      We&apos;ll use these to send your valuation report
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-medium text-banc-dark">
                          First Name *
                        </label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleChange("firstName", e.target.value)}
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-medium text-banc-dark">
                          Last Name
                        </label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleChange("lastName", e.target.value)}
                          placeholder="Smith"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-banc-dark">
                        <Mail className="mb-0.5 mr-1 inline h-4 w-4 text-banc-focus" />
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-banc-dark">
                        <Phone className="mb-0.5 mr-1 inline h-4 w-4 text-banc-focus" />
                        Phone Number *
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder={BANC_CONTACT.displayPhone}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="block text-sm font-medium text-banc-dark">
                        <MessageSquare className="mb-0.5 mr-1 inline h-4 w-4 text-banc-focus" />
                        Additional Information (Optional)
                      </label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        className="min-h-[80px]"
                        placeholder="Anything else we should know..."
                      />
                    </div>

                    <label htmlFor="consent" className="flex items-start gap-3 text-sm text-banc-muted-readable cursor-pointer">
                      <input
                        id="consent"
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => {
                          setConsent(e.target.checked);
                          setError(null);
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-banc-grey/40 accent-banc-sky"
                      />
                      <span>
                        Please tick this box if you are happy for us to contact you via phone and email. *
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Results */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="py-8 text-center"
                >
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-banc-sky/10">
                    <CheckCircle className="h-10 w-10 text-banc-focus" />
                  </div>
                  <h2 className="mb-4 text-2xl font-semibold text-banc-dark font-serif lg:text-3xl">
                    Thank You!
                  </h2>
                  <p className="mb-2 text-banc-muted-readable max-w-md mx-auto">
                    Your valuation request for <span className="font-medium text-banc-dark">{formData.postcode}</span> has been received.
                  </p>
                  <p className="mb-8 text-banc-muted-readable max-w-md mx-auto">
                    One of our property experts will contact you within 24 hours to arrange your free, no-obligation valuation.
                  </p>

                  <div className="rounded-xl bg-banc-grey-pale p-6 mb-8 max-w-sm mx-auto text-left">
                    <h3 className="text-sm font-semibold text-banc-dark mb-3">What happens next?</h3>
                    <ul className="space-y-2">
                      {[
                        "We review your property details",
                        "A local expert calls to book a visit",
                        "We provide a detailed market appraisal",
                        "You decide — no obligation",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-banc-muted-readable">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-banc-focus" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => (window.location.href = "/")}
                    className="bg-banc-focus px-8 py-5 text-white hover:bg-banc-sky-dark"
                  >
                    Return to Homepage
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="mt-8 flex items-center justify-between border-t border-banc-grey/10 pt-6">
                {currentStep > 1 ? (
                  <Button variant="ghost" onClick={prevStep} className="text-banc-muted-readable">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  onClick={nextStep}
                  disabled={isSubmitting}
                  className="bg-banc-focus px-8 py-5 text-white hover:bg-banc-focus-hover disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : currentStep === 3 ? (
                    "Submit Request"
                  ) : (
                    <span className="flex items-center gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Privacy note */}
          {currentStep < 4 && (
            <p className="mt-4 text-center text-sm text-banc-muted-readable">
              By submitting, you agree to our{" "}
              <a href="/privacy" className="text-banc-focus hover:underline">Privacy Policy</a>.
              We never share your details with third parties.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
