"use client";

import Link from "next/link";
import Image from "next/image";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import OfferForm from "@/components/offers/OfferForm";
import { useLiveProperty } from "@/hooks/useLiveProperty";
import { BANC_CONTACT } from "@/lib/banc-contact";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildOfferEnquiry, submitContactEnquiry } from "@/lib/property-enquiry";
import { buildPropertyHref } from "@/lib/property-view";
import { OfferSubmission } from "@/types/portal";
import { PageBand } from "@/components/PageBand";
import { actionPrimary, actionSecondary, formPanel } from "@/components/ui/form-styles";
import {
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
      <div className="min-h-screen bg-banc-grey-pale px-4 py-12">
        <div
          className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-banc-focus motion-reduce:animate-none" aria-hidden="true" />
          <p className="text-banc-muted-readable">Loading property…</p>
        </div>
      </div>
    );
  }

  if (propertyState.phase === "notfound") {
    return (
      <div className="min-h-screen bg-banc-grey-pale px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className={formPanel}>
            <h1 className="mb-3 font-display text-3xl font-light leading-[1.08] tracking-[-0.02em] text-banc-dark">
              We couldn&apos;t find that property
            </h1>
            <p className="mb-6 text-banc-muted-readable">
              It may have been sold, let or withdrawn from the market. You can
              browse our current listings or call the office on{" "}
              <a href={BANC_CONTACT.callHref} className="text-banc-focus underline underline-offset-2">
                {BANC_CONTACT.displayPhone}
              </a>
              .
            </p>
            <Link href="/sales/properties" className={actionPrimary}>
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
      <div className="min-h-screen bg-banc-grey-pale px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className={formPanel} role="status">
            <CheckCircle className="mb-5 h-10 w-10 text-green-700" aria-hidden="true" />
            <h2 className="mb-3 font-display text-3xl font-light leading-[1.08] tracking-[-0.02em] text-banc-dark">
              Offer sent to our team
            </h2>
            <p className="text-banc-muted-readable">
              Your offer of{" "}
              <strong>
                £{submittedAmount.toLocaleString("en-GB")}
              </strong>{" "}
              for <strong>{property.title}</strong> has been received.
            </p>
            <p className="mt-6 border-t border-banc-dark/15 pt-6 text-sm text-banc-muted-readable">
              We&apos;ll pass your offer to the vendor and come back to you by
              phone or email. You&apos;ll receive a confirmation email shortly.
            </p>
            <p className="mt-6 border-t border-banc-dark/15 pt-6 text-sm text-banc-dark-deep">
              <strong>Important:</strong> This offer is not legally binding
              until contracts are exchanged. The property remains on the
              market until an offer is accepted.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={propertyHref} className={actionPrimary}>
                Back to the property
              </Link>
              <Link href="/sales/properties" className={actionSecondary}>
                Browse More Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const nextSteps = [
    "Your offer is sent to our sales team, who present it to the vendor",
    "The vendor reviews your offer and financial position",
    "We come back to you by phone or email — usually within one working day",
    "If accepted, you'll proceed to instruct solicitors",
  ];

  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />
      <PageBand
        eyebrow="Put your offer forward"
        title="Make an Offer"
        lede="We present every offer to the vendor with the financial position behind it, then come back to you — usually within one working day."
        back={{ href: propertyHref, label: "Back to the property" }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-banc-line bg-white lg:sticky lg:top-28">
              <div className="relative h-48 w-full bg-banc-grey-pale">
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
                <h2 className="font-heading font-semibold text-banc-dark-deep">
                  {property.title}
                </h2>
                <p className="text-banc-muted-readable text-sm">{property.address}</p>
                {property.postcode ? (
                  <p className="text-banc-muted-readable text-sm">{property.postcode}</p>
                ) : null}
                <p className="text-xl font-bold text-banc-focus mt-2">
                  {property.price}
                </p>
                <p className="text-sm text-banc-muted-readable mt-1">
                  {property.priceQualifier || "Asking Price"}
                </p>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-banc-line text-sm text-banc-muted-readable">
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

                <div className="mt-4 pt-4 border-t border-banc-line">
                  <p className="text-sm text-banc-muted-readable line-clamp-3">
                    {property.summary}
                  </p>
                  <Link
                    href={propertyHref}
                    className="mt-1 inline-flex min-h-11 items-center text-sm text-banc-focus underline-offset-2 hover:underline"
                  >
                    View full details →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Offer Form */}
          <div className="lg:col-span-2">
            <div className={formPanel}>
              <h2 className="mb-6 font-display text-2xl font-light leading-[1.08] tracking-[-0.02em] text-banc-dark">
                Your Offer Details
              </h2>
              {submitError && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 text-sm text-red-800"
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
            <div className="mt-12 border-t border-banc-dark/15 pt-8">
              <h3 className="mb-5 font-display text-2xl font-light leading-[1.08] tracking-[-0.02em] text-banc-dark">
                What happens next?
              </h3>
              <ul className="space-y-3 text-sm text-banc-dark-deep">
                {nextSteps.map((step, index) => (
                  <li key={step} className="flex items-baseline gap-3">
                    <span className="w-4 shrink-0 font-semibold tabular-nums text-banc-focus">{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
