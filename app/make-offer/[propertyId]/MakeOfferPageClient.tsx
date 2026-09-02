"use client";

import Link from "next/link";
import Image from "next/image";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import OfferForm from "@/components/offers/OfferForm";
import { useLiveProperty } from "@/hooks/useLiveProperty";
import { BANC_CONTACT } from "@/lib/banc-contact";
import { buildOfferEnquiry, submitContactEnquiry } from "@/lib/property-enquiry";
import { buildPropertyHref } from "@/lib/property-view";
import { OfferSubmission } from "@/types/portal";
import {
  ChevronLeft,
  Home,
  Bed,
  Bath,
  Square,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function MakeOfferPage() {
  const params = useParams();
  const propertyId = typeof params.propertyId === "string" ? params.propertyId : "";
  const propertyState = useLiveProperty(propertyId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedAmount, setSubmittedAmount] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: OfferSubmission) => {
    if (propertyState.phase !== "ready") return;
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = buildOfferEnquiry(propertyState.property, {
      name: data.contact?.name ?? "",
      email: data.contact?.email ?? "",
      phone: data.contact?.phone ?? "",
      amount: data.amount,
      position: data.position,
      timescale: data.timescale,
      mortgageInPrinciple: data.mortgageInPrinciple,
      chainFree: data.chainFree,
      additionalComments: data.additionalComments,
      proofOfFundsFileName: data.proofOfFunds?.name,
    });
    const result = await submitContactEnquiry(fetch, payload);

    setIsSubmitting(false);
    if (result.ok) {
      setSubmittedAmount(data.amount);
      setIsSuccess(true);
    } else {
      setSubmitError(result.error);
    }
  };

  if (propertyState.phase === "loading") {
    return (
      <div className="min-h-screen bg-[#F4F3F1] py-8 px-4">
        <div
          className="max-w-6xl mx-auto flex min-h-[50vh] flex-col items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#4AC8E8] motion-reduce:animate-none" aria-hidden="true" />
          <p className="text-[#8A8880]">Loading property…</p>
        </div>
      </div>
    );
  }

  if (propertyState.phase === "notfound") {
    return (
      <div className="min-h-screen bg-[#F4F3F1] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-[#E0DFDC] p-8 text-center">
            <h1 className="text-2xl font-heading font-bold text-[#1A1917] mb-3">
              We couldn&apos;t find that property
            </h1>
            <p className="text-[#8A8880] mb-6">
              It may have been sold, let or withdrawn from the market. You can
              browse our current listings or call the office on{" "}
              <a href={BANC_CONTACT.callHref} className="text-[#4AC8E8] hover:underline">
                {BANC_CONTACT.displayPhone}
              </a>
              .
            </p>
            <Link
              href="/sales/properties"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4AC8E8] text-white rounded-lg font-medium hover:bg-[#1A9BBF] transition-colors"
            >
              Browse properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const property = propertyState.property;
  const propertyHref = buildPropertyHref(property.department, property.id);
  const heroImage = property.images[0];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F4F3F1] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-[#E0DFDC] p-8 text-center" role="status">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-[#1A1917] mb-3">
              Offer sent to our team
            </h2>
            <p className="text-[#8A8880] mb-6">
              Your offer of{" "}
              <strong>
                £{submittedAmount.toLocaleString("en-GB")}
              </strong>{" "}
              for <strong>{property.title}</strong> has been received.
            </p>
            <div className="bg-[#F4F3F1] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#8A8880]">
                We&apos;ll pass your offer to the vendor and come back to you by
                phone or email. You&apos;ll receive a confirmation email shortly.
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
              <Link
                href={propertyHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4AC8E8] text-white rounded-lg font-medium hover:bg-[#1A9BBF] transition-colors"
              >
                Back to the property
              </Link>
              <Link
                href="/sales/properties"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#E0DFDC] text-[#1A1917] rounded-lg font-medium hover:bg-[#F4F3F1] transition-colors"
              >
                Browse More Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F3F1] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          href={propertyHref}
          className="inline-flex items-center gap-2 text-[#8A8880] hover:text-[#4AC8E8] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back to property
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#1A1917]">
            Make an Offer
          </h1>
          <p className="text-[#8A8880] mt-2">
            Submit your offer for this property. Our team will present it to
            the vendor and come back to you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-[#E0DFDC] overflow-hidden sticky top-4">
              <div className="relative h-48 w-full bg-[#F4F3F1]">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={`${property.title}, ${property.address}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="p-5">
                <h2 className="font-heading font-semibold text-[#1A1917]">
                  {property.title}
                </h2>
                <p className="text-[#8A8880] text-sm">{property.address}</p>
                {property.postcode ? (
                  <p className="text-[#8A8880] text-sm">{property.postcode}</p>
                ) : null}
                <p className="text-xl font-bold text-[#4AC8E8] mt-2">
                  {property.price}
                </p>
                <p className="text-sm text-[#8A8880] mt-1">
                  {property.priceQualifier || "Asking Price"}
                </p>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#E0DFDC] text-sm text-[#8A8880]">
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" aria-hidden="true" />
                    {property.stats.beds}
                    <span className="sr-only"> bedrooms</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" aria-hidden="true" />
                    {property.stats.baths}
                    <span className="sr-only"> bathrooms</span>
                  </span>
                  {property.stats.sqft !== undefined && (
                    <span className="flex items-center gap-1">
                      <Square className="w-4 h-4" aria-hidden="true" />
                      {property.stats.sqft.toLocaleString("en-GB")} sq ft
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[#E0DFDC]">
                  <p className="text-sm text-[#8A8880] line-clamp-3">
                    {property.summary}
                  </p>
                  <Link
                    href={propertyHref}
                    className="text-sm text-[#4AC8E8] hover:underline mt-2 inline-block"
                  >
                    View full details →
                  </Link>
                </div>

                {/* Office Info */}
                <div className="mt-4 pt-4 border-t border-[#E0DFDC]">
                  <p className="text-sm text-[#8A8880] mb-2">Listing agent</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#4AC8E8]/10 rounded-full flex items-center justify-center">
                      <Home className="w-5 h-5 text-[#4AC8E8]" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1917]">
                        Banc Property Group
                      </p>
                      <a
                        href={BANC_CONTACT.callHref}
                        className="text-sm text-[#8A8880] hover:text-[#4AC8E8]"
                      >
                        {BANC_CONTACT.displayPhone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Offer Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-[#E0DFDC] p-6">
              <h2 className="text-xl font-heading font-semibold text-[#1A1917] mb-6">
                Your Offer Details
              </h2>
              {submitError && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <p>{submitError}</p>
                </div>
              )}
              <OfferForm
                propertyId={property.id}
                askingPrice={property.priceNum}
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
                  Your offer is sent to our sales team, who present it to the vendor
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                    2
                  </span>
                  The vendor reviews your offer and financial position
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                    3
                  </span>
                  We come back to you by phone or email — usually within one working day
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
