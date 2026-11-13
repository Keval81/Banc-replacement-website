"use client";

import React from "react";
import { PropertyOffer, formatCurrency, formatDate, getBuyerPositionLabel } from "@/types/portal";
import { Clock, CheckCircle, XCircle, AlertCircle, Hourglass } from "lucide-react";
import { actionPrimary, actionSecondary } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

interface OfferStatusProps {
  offer: PropertyOffer;
  showPropertyDetails?: boolean;
}

export default function OfferStatus({ offer, showPropertyDetails = true }: OfferStatusProps) {
  const getStatusConfig = (status: PropertyOffer["status"]) => {
    switch (status) {
      case "accepted":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-100",
          iconColor: "text-green-700",
          textColor: "text-green-800",
          label: "Offer Accepted",
          description: "Congratulations! The vendor has accepted your offer.",
        };
      case "declined":
        return {
          icon: XCircle,
          bgColor: "bg-red-100",
          iconColor: "text-red-700",
          textColor: "text-red-800",
          label: "Offer Declined",
          description: "The vendor has declined your offer. You may submit a revised offer.",
        };
      case "countered":
        return {
          icon: AlertCircle,
          bgColor: "bg-amber-100",
          iconColor: "text-amber-700",
          textColor: "text-amber-800",
          label: "Counter Offer Received",
          description: "The vendor has made a counter offer. Please review and respond.",
        };
      case "under_review":
        return {
          icon: Hourglass,
          bgColor: "bg-blue-100",
          iconColor: "text-blue-700",
          textColor: "text-blue-800",
          label: "Under Review",
          description: "Your offer is being reviewed by the vendor.",
        };
      case "submitted":
        return {
          icon: Clock,
          bgColor: "bg-banc-grey-pale",
          iconColor: "text-banc-focus",
          textColor: "text-banc-focus",
          label: "Submitted",
          description: "Your offer has been submitted and will be reviewed shortly.",
        };
      case "withdrawn":
        return {
          icon: XCircle,
          bgColor: "bg-banc-grey-pale",
          iconColor: "text-banc-muted-readable",
          textColor: "text-banc-dark",
          label: "Withdrawn",
          description: "You have withdrawn this offer.",
        };
      default:
        return {
          icon: Clock,
          bgColor: "bg-banc-grey-pale",
          iconColor: "text-banc-muted-readable",
          textColor: "text-banc-dark",
          label: status,
          description: "Your offer is being processed.",
        };
    }
  };

  const config = getStatusConfig(offer.status);
  const StatusIcon = config.icon;

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-banc-line bg-white">
      {/* Status Banner */}
      <div className={`px-5 py-4 ${config.bgColor}`}>
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-6 h-6 ${config.iconColor}`} />
          <div>
            <p className={`font-semibold ${config.textColor}`}>{config.label}</p>
            <p className={`text-sm ${config.textColor} opacity-80`}>
              {config.description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Property Info */}
        {showPropertyDetails && (
          <div className="flex gap-4 mb-5 pb-5 border-b border-banc-line">
            <img
              src={offer.propertyImage}
              alt={offer.propertyAddress}
              className="h-24 w-24 shrink-0 rounded-md object-cover"
            />
            <div>
              <h4 className="font-medium text-banc-dark-deep">
                {offer.propertyAddress}
              </h4>
              <a
                href={`/sales/properties/${offer.propertyId}`}
                className="inline-flex min-h-11 items-center text-sm text-banc-focus underline-offset-2 hover:underline"
              >
                View Property →
              </a>
            </div>
          </div>
        )}

        {/* Offer Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-banc-muted-readable">Offer Amount</span>
            <span className="text-2xl font-bold text-banc-dark-deep">
              {formatCurrency(offer.amount)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-banc-muted-readable">Your Position</span>
            <span className="font-medium text-banc-dark-deep">
              {getBuyerPositionLabel(offer.position)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-banc-muted-readable">Preferred Timescale</span>
            <span className="font-medium text-banc-dark-deep capitalize">
              {offer.timescale.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-banc-muted-readable">Submitted</span>
            <span className="text-banc-dark-deep">
              {formatDate(offer.submittedAt)}
            </span>
          </div>

          {offer.updatedAt !== offer.submittedAt && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-banc-muted-readable">Last Updated</span>
              <span className="text-banc-dark-deep">
                {formatDate(offer.updatedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        {offer.notes && (
          <div className="mt-5 pt-5 border-t border-banc-line">
            <p className="text-sm text-banc-muted-readable mb-1">Notes:</p>
            <p className="text-banc-dark-deep">{offer.notes}</p>
          </div>
        )}

        {/* Proof of Funds */}
        {offer.proofOfFunds && (
          <div className="mt-5 pt-5 border-t border-banc-line">
            <p className="text-sm text-banc-muted-readable mb-2">Proof of Funds:</p>
            <a
              href={offer.proofOfFunds.url}
              className={actionSecondary}
            >
              <CheckCircle className="w-4 h-4 text-green-700" />
              Document Uploaded
            </a>
          </div>
        )}

        {/* Actions */}
        {(offer.status === "submitted" || offer.status === "under_review") && (
          <div className="mt-5 flex flex-col gap-3 border-t border-banc-line pt-5 sm:flex-row">
            <button
              disabled
              className={cn(actionPrimary, "sm:flex-1")}
            >
              Revise Offer
            </button>
            <button
              disabled
              className={cn(actionSecondary, "cursor-not-allowed text-red-700 opacity-60 sm:flex-1")}
            >
              Withdraw
            </button>
          </div>
        )}

        {offer.status === "countered" && (
          <div className="mt-5 flex flex-col gap-3 border-t border-banc-line pt-5 sm:flex-row">
            <button
              disabled
              className={cn(actionPrimary, "sm:flex-1")}
            >
              Accept Counter
            </button>
            <button
              disabled
              className={cn(actionSecondary, "cursor-not-allowed opacity-60 sm:flex-1")}
            >
              Make New Offer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
