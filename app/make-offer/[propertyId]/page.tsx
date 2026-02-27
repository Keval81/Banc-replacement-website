"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import OfferForm from "@/components/offers/OfferForm";
import { OfferSubmission } from "@/types/portal";
import {
  ChevronLeft,
  Home,
  MapPin,
  Bed,
  Bath,
  Square,
  CheckCircle,
} from "lucide-react";

// Mock property data - would come from API
const mockProperty = {
  id: "prop-123",
  address: "12 The Ridings, Cuffley",
  postcode: "EN6 4JL",
  price: 925000,
  displayPrice: "£925,000",
  bedrooms: 4,
  bathrooms: 2,
  sqft: 1850,
  image: "/images/property-1.jpg",
  agent: {
    name: "Sarah Williams",
    phone: "+44 1707 123456",
  },
  description:
    "A stunning four-bedroom detached family home situated in a highly sought-after location in Cuffley. The property benefits from a spacious living room, modern kitchen/diner, and a beautiful south-facing garden.",
};

export default function MakeOfferPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedAmount, setSubmittedAmount] = useState(0);

  const handleSubmit = async (data: OfferSubmission) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In real app, submit to API
    console.log("Offer submitted:", data);

    setSubmittedAmount(data.amount);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F0F0ED] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-[#C8C9CB] p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-[#2C2F33] mb-3">
              Offer Submitted Successfully!
            </h1>
            <p className="text-[#6B6E72] mb-6">
              Your offer of{" "}
              <strong>
                £{submittedAmount.toLocaleString()}
              </strong>{" "}
              for <strong>{mockProperty.address}</strong> has been submitted.
            </p>
            <div className="bg-[#F0F0ED] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#6B6E72]">
                The vendor will be notified and will review your offer within 24
                hours. You&apos;ll receive an email notification once they respond.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> This offer is not legally binding
                until contracts are exchanged. The property remains on the
                market until an offer is accepted.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/portal/applicant"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1DBFDD] text-white rounded-lg font-medium hover:bg-[#0E8CAB] transition-colors"
              >
                Track Your Offer
              </a>
              <a
                href="/sales/properties"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#C8C9CB] text-[#2C2F33] rounded-lg font-medium hover:bg-[#F0F0ED] transition-colors"
              >
                Browse More Properties
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0ED] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <a
          href={`/sales/properties/${propertyId}`}
          className="inline-flex items-center gap-2 text-[#6B6E72] hover:text-[#1DBFDD] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to property
        </a>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#2C2F33]">
            Make an Offer
          </h1>
          <p className="text-[#6B6E72] mt-2">
            Submit your offer for this property. The vendor will review and
            respond within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-[#C8C9CB] overflow-hidden sticky top-4">
              <img
                src={mockProperty.image}
                alt={mockProperty.address}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h2 className="font-heading font-semibold text-[#2C2F33]">
                  {mockProperty.address}
                </h2>
                <p className="text-[#6B6E72] text-sm">{mockProperty.postcode}</p>
                <p className="text-xl font-bold text-[#1DBFDD] mt-2">
                  {mockProperty.displayPrice}
                </p>
                <p className="text-sm text-[#6B6E72] mt-1">Asking Price</p>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#C8C9CB] text-sm text-[#6B6E72]">
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {mockProperty.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    {mockProperty.bathrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Square className="w-4 h-4" />
                    {mockProperty.sqft} sq ft
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-[#C8C9CB]">
                  <p className="text-sm text-[#6B6E72] line-clamp-3">
                    {mockProperty.description}
                  </p>
                  <a
                    href={`/sales/properties/${propertyId}`}
                    className="text-sm text-[#1DBFDD] hover:underline mt-2 inline-block"
                  >
                    View full details →
                  </a>
                </div>

                {/* Agent Info */}
                <div className="mt-4 pt-4 border-t border-[#C8C9CB]">
                  <p className="text-sm text-[#6B6E72] mb-2">Listing Agent</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1DBFDD]/10 rounded-full flex items-center justify-center">
                      <Home className="w-5 h-5 text-[#1DBFDD]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2C2F33]">
                        {mockProperty.agent.name}
                      </p>
                      <p className="text-sm text-[#6B6E72]">
                        {mockProperty.agent.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Offer Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-[#C8C9CB] p-6">
              <h2 className="text-xl font-heading font-semibold text-[#2C2F33] mb-6">
                Your Offer Details
              </h2>
              <OfferForm
                propertyId={propertyId}
                askingPrice={mockProperty.price}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-medium text-blue-900 mb-2">
                What happens next?
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                    1
                  </span>
                  Your offer will be sent to the vendor and their agent
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                    2
                  </span>
                  The vendor will review your offer and financial position
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                    3
                  </span>
                  You&apos;ll receive a response within 24 hours
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                    4
                  </span>
                  If accepted, you&apos;ll proceed to instruct solicitors
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
