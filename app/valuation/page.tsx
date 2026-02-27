"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/select";
import { CheckCircle, Home, Phone, Mail, User, MapPin, Calendar, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: -50, x: "-50%" }}
      className={`fixed left-1/2 top-24 z-50 flex items-center gap-3 rounded-xl px-6 py-4 shadow-2xl ${
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="sr-only">Close</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

export default function ValuationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setToast({ 
          message: data.error || data.details?.[0]?.message || "Something went wrong. Please try again.", 
          type: "error" 
        });
      }
    } catch (error) {
      setToast({ message: "Failed to submit request. Please try again later.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F0F0ED]">
        <Header />
        <div className="h-[57px] lg:h-[94px]" />
        <main className="flex min-h-[calc(100vh-57px-300px)] items-center justify-center px-4 py-16 lg:min-h-[calc(100vh-94px-300px)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl lg:p-12"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1DBFDD]/10">
              <CheckCircle className="h-10 w-10 text-[#1DBFDD]" />
            </div>
            <h1 className="mb-4 text-2xl font-semibold text-[#2C2F33] lg:text-3xl">
              Thank You!
            </h1>
            <p className="mb-6 text-[#6B6E72]">
              Your valuation request has been received. One of our property experts will contact you within 24 hours to arrange your free, no-obligation valuation.
            </p>
            <Button
              onClick={() => window.location.href = "/"}
              className="bg-[#1DBFDD] px-8 py-5 text-white hover:bg-[#0E8CAB]"
            >
              Return to Homepage
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0ED]">
      <Header />
      <div className="h-[57px] lg:h-[94px]" />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
      
      <main className="px-4 py-8 pb-24 lg:px-8 lg:py-12 lg:pb-12">
        <div className="mx-auto max-w-6xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center lg:mb-12"
          >
            <h1 className="mb-4 text-3xl font-semibold text-[#2C2F33] lg:text-4xl">
              Request a Free Valuation
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[#6B6E72]">
              Discover the true value of your property with our expert, no-obligation valuation service
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl bg-white p-6 shadow-lg lg:p-10"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2C2F33]">
                    <User className="h-5 w-5 text-[#1DBFDD]" />
                    Your Details
                  </h2>
                  
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-sm font-medium text-[#2C2F33]">
                        First Name *
                      </label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        className="border-[#C8C9CB] focus:border-[#1DBFDD] focus:ring-[#1DBFDD]"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-medium text-[#2C2F33]">
                        Last Name *
                      </label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        className="border-[#C8C9CB] focus:border-[#1DBFDD] focus:ring-[#1DBFDD]"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-[#2C2F33]">
                        <Mail className="mb-0.5 mr-1 inline h-4 w-4 text-[#1DBFDD]" />
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="border-[#C8C9CB] focus:border-[#1DBFDD] focus:ring-[#1DBFDD]"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-[#2C2F33]">
                        <Phone className="mb-0.5 mr-1 inline h-4 w-4 text-[#1DBFDD]" />
                        Phone Number *
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="border-[#C8C9CB] focus:border-[#1DBFDD] focus:ring-[#1DBFDD]"
                        placeholder="01707 877781"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#C8C9CB]" />

                {/* Property Details */}
                <div className="space-y-4">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2C2F33]">
                    <Home className="h-5 w-5 text-[#1DBFDD]" />
                    Property Details
                  </h2>

                  <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-medium text-[#2C2F33]">
                      <MapPin className="mb-0.5 mr-1 inline h-4 w-4 text-[#1DBFDD]" />
                      Property Address *
                    </label>
                    <Textarea
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="min-h-[80px] border-[#C8C9CB] focus:border-[#1DBFDD] focus:ring-[#1DBFDD]"
                      placeholder="123 Station Road, Cuffley..."
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="postcode" className="block text-sm font-medium text-[#2C2F33]">
                        Postcode *
                      </label>
                      <Input
                        id="postcode"
                        required
                        value={formData.postcode}
                        onChange={(e) => handleChange("postcode", e.target.value)}
                        className="border-[#C8C9CB] focus:border-[#1DBFDD] focus:ring-[#1DBFDD]"
                        placeholder="EN6 4HU"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#2C2F33]">Property Type</label>
                      <NativeSelect
                        value={formData.propertyType}
                        onChange={(e) => handleChange("propertyType", e.target.value)}
                      >
                        <option value="">Select type</option>
                        {propertyTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#2C2F33]">Bedrooms</label>
                      <NativeSelect
                        value={formData.bedrooms}
                        onChange={(e) => handleChange("bedrooms", e.target.value)}
                      >
                        <option value="">Select bedrooms</option>
                        {bedrooms.map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#2C2F33]">
                        <Calendar className="mb-0.5 mr-1 inline h-4 w-4 text-[#1DBFDD]" />
                        Looking to sell in...
                      </label>
                      <NativeSelect
                        value={formData.timeframe}
                        onChange={(e) => handleChange("timeframe", e.target.value)}
                      >
                        <option value="">Select timeframe</option>
                        {timeframes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#C8C9CB]" />

                {/* Additional Message */}
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-[#2C2F33]">
                    <MessageSquare className="mb-0.5 mr-1 inline h-4 w-4 text-[#1DBFDD]" />
                    Additional Information (Optional)
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className="min-h-[100px] border-[#C8C9CB] focus:border-[#1DBFDD] focus:ring-[#1DBFDD]"
                    placeholder="Tell us anything else about your property or requirements..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1DBFDD] py-6 text-lg font-semibold text-white hover:bg-[#0E8CAB] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Request Free Valuation"
                  )}
                </Button>

                <p className="text-center text-sm text-[#6B6E72]">
                  By submitting this form, you agree to our{" "}
                  <a href="/privacy" className="text-[#1DBFDD] hover:underline">
                    Privacy Policy
                  </a>
                  . We will never share your details with third parties.
                </p>
              </form>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Why Choose Us */}
              <div className="rounded-2xl bg-[#2C2F33] p-6 text-white lg:p-8">
                <h3 className="mb-4 text-xl font-semibold">Why Choose Banc?</h3>
                <ul className="space-y-4">
                  {[
                    "Free, no-obligation valuation",
                    "Local market expertise",
                    "Premium marketing package",
                    "Dedicated account manager",
                    "94% of asking price achieved",
                    "Average 21 days to sell",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1DBFDD]" />
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Card */}
              <div className="rounded-2xl bg-white p-6 shadow-lg lg:p-8">
                <h3 className="mb-4 text-lg font-semibold text-[#2C2F33]">
                  Prefer to Call?
                </h3>
                <p className="mb-4 text-[#6B6E72]">
                  Speak directly with our valuations team
                </p>
                <a
                  href="tel:01707877781"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#1DBFDD]/10 py-4 text-lg font-semibold text-[#1DBFDD] transition-colors hover:bg-[#1DBFDD]/20"
                >
                  <Phone className="h-5 w-5" />
                  01707 877781
                </a>
                <p className="mt-4 text-center text-sm text-[#6B6E72]">
                  Mon-Fri: 9am - 6pm<br />Sat: 9am - 4pm
                </p>
              </div>

              {/* Trust Badges */}
              <div className="rounded-2xl bg-white p-6 shadow-lg lg:p-8">
                <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-[#6B6E72]">
                  Accredited & Trusted
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#F0F0ED]">
                    <span className="text-xs font-bold text-[#2C2F33]">NAEA</span>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#F0F0ED]">
                    <span className="text-xs font-bold text-[#2C2F33]">ARLA</span>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#F0F0ED]">
                    <span className="text-xs font-bold text-[#2C2F33]">TPO</span>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#F0F0ED]">
                    <span className="text-xs font-bold text-[#2C2F33]">The Guild</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
