"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Home, Phone, Mail, User, MapPin, Calendar, MessageSquare } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

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

export default function ValuationPage() {
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend/email service
    setSubmitted(true);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      
      <main className="px-4 py-8 lg:px-8 lg:py-12">
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
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-[#2C2F33]">
                        First Name *
                      </Label>
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
                      <Label htmlFor="lastName" className="text-[#2C2F33]">
                        Last Name *
                      </Label>
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

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#2C2F33]">
                        <Mail className="mb-0.5 mr-1 inline h-4 w-4 text-[#1DBFDD]" />
                        Email Address *
                      </Label>
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
                      <Label htmlFor="phone" className="text-[#2C2F33]">
                        <Phone className="mb-0.5 mr-1 inline h-4 w-4 text-[#1DBFDD]" />
                        Phone Number *
                      </Label>
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
                    <Label htmlFor="address" className="text-[#2C2F33]">
                      <MapPin className="mb-0.5 mr-1 inline h-4 w-4 text-[#1DBFDD]" />
                      Property Address *
                    </Label>
                    <Textarea
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="min-h-[80px] border-[#C8C9CB] focus:border-[#1DBFDD] focus:ring-[#1DBFDD]"
                      placeholder="123 Station Road, Cuffley..."
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="postcode" className="text-[#2C2F33]">
                        Postcode *
                      </Label>
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
                      <Label className="text-[#2C2F33]">Property Type</Label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => handleChange("propertyType", e.target.value)}
                        className="w-full rounded-md border border-[#C8C9CB] bg-white px-3 py-2 text-sm focus:border-[#1DBFDD] focus:outline-none focus:ring-1 focus:ring-[#1DBFDD]"
                      >
                        <option value="">Select type</option>
                        {propertyTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-[#2C2F33]">Bedrooms</Label>
                      <select
                        value={formData.bedrooms}
                        onChange={(e) => handleChange("bedrooms", e.target.value)}
                        className="w-full rounded-md border border-[#C8C9CB] bg-white px-3 py-2 text-sm focus:border-[#1DBFDD] focus:outline-none focus:ring-1 focus:ring-[#1DBFDD]"
                      >
                        <option value="">Select bedrooms</option>
                        {bedrooms.map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#2C2F33]">
                        <Calendar className="mb-0.5 mr-1 inline h-4 w-4 text-[#1DBFDD]" />
                        Looking to sell in...
                      </Label>
                      <select
                        value={formData.timeframe}
                        onChange={(e) => handleChange("timeframe", e.target.value)}
                        className="w-full rounded-md border border-[#C8C9CB] bg-white px-3 py-2 text-sm focus:border-[#1DBFDD] focus:outline-none focus:ring-1 focus:ring-[#1DBFDD]"
                      >
                        <option value="">Select timeframe</option>
                        {timeframes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#C8C9CB]" />

                {/* Additional Message */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-[#2C2F33]">
                    <MessageSquare className="mb-0.5 mr-1 inline h-4 w-4 text-[#1DBFDD]" />
                    Additional Information (Optional)
                  </Label>
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
                  className="w-full bg-[#1DBFDD] py-6 text-lg font-semibold text-white hover:bg-[#0E8CAB]"
                >
                  Request Free Valuation
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
