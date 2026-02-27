"use client";

import React from "react";
import { PropertyOffer, formatCurrency, formatDate, getBuyerPositionLabel } from "@/types/portal";
import { Clock, CheckCircle, XCircle, AlertCircle, Hourglass } from "lucide-react";

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
          iconColor: "text-green-600",
          textColor: "text-green-800",
          label: "Offer Accepted",
          description: "Congratulations! The vendor has accepted your offer.",
        };
      case "declined":
        return {
          icon: XCircle,
          bgColor: "bg-red-100",
          iconColor: "text-red-600",
          textColor: "text-red-800",
          label: "Offer Declined",
          description: "The vendor has declined your offer. You may submit a revised offer.",
        };
      case "countered":
        return {
          icon: AlertCircle,
          bgColor: "bg-amber-100",
          iconColor: "text-amber-600",
          textColor: "text-amber-800",
          label: "Counter Offer Received",
          description: "The vendor has made a counter offer. Please review and respond.",
        };
      case "under_review":
        return {
          icon: Hourglass,
          bgColor: "bg-blue-100",
          iconColor: "text-blue-600",
          textColor: "text-blue-800",
          label: "Under Review",
          description: "Your offer is being reviewed by the vendor.",
        };
      case "submitted":
        return {
          icon: Clock,
          bgColor: "bg-[#1DBFDD]/10",
          iconColor: "text-[#1DBFDD]",
          textColor: "text-[#0E8CAB]",
          label: "Submitted",
          description: "Your offer has been submitted and will be reviewed shortly.",
        };
      case "withdrawn":
        return {
          icon: XCircle,
          bgColor: "bg-gray-100",
          iconColor: "text-gray-600",
          textColor: "text-gray-800",
          label: "Withdrawn",
          description: "You have withdrawn this offer.",
        };
      default:
        return {
          icon: Clock,
          bgColor: "bg-gray-100",
          iconColor: "text-gray-600",
          textColor: "text-gray-800",
          label: status,
          description: "Your offer is being processed.",
        };
    }
  };

  const config = getStatusConfig(offer.status);
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-[#C8C9CB] overflow-hidden">
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
          <div className="flex gap-4 mb-5 pb-5 border-b border-[#C8C9CB]">
            <img
              src={offer.propertyImage}
              alt={offer.propertyAddress}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div>
              <h4 className="font-medium text-[#2C2F33]">
                {offer.propertyAddress}
              </h4>
              <a
                href={`/sales/properties/${offer.propertyId}`}
                className="text-sm text-[#1DBFDD] hover:underline mt-1 inline-block"
              >
                View Property →
              </a>
            </div>
          </div>
        )}

        {/* Offer Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[#6B6E72]">Offer Amount</span>
            <span className="text-2xl font-bold text-[#2C2F33]">
              {formatCurrency(offer.amount)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#6B6E72]">Your Position</span>
            <span className="font-medium text-[#2C2F33]">
              {getBuyerPositionLabel(offer.position)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#6B6E72]">Preferred Timescale</span>
            <span className="font-medium text-[#2C2F33] capitalize">
              {offer.timescale.replace("_", " ")}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#6B6E72]">Submitted</span>
            <span className="text-[#2C2F33]">
              {formatDate(offer.submittedAt)}
            </span>
          </div>

          {offer.updatedAt !== offer.submittedAt && (
            <div className="flex justify-between items-center">
              <span className="text-[#6B6E72]">Last Updated</span>
              <span className="text-[#2C2F33]">
                {formatDate(offer.updatedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        {offer.notes && (
          <div className="mt-5 pt-5 border-t border-[#C8C9CB]">
            <p className="text-sm text-[#6B6E72] mb-1">Notes:</p>
            <p className="text-[#2C2F33]">{offer.notes}</p>
          </div>
        )}

        {/* Proof of Funds */}
        {offer.proofOfFunds && (
          <div className="mt-5 pt-5 border-t border-[#C8C9CB]">
            <p className="text-sm text-[#6B6E72] mb-2">Proof of Funds:</p>
            <a
              href={offer.proofOfFunds.url}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F0F0ED] rounded-lg text-[#2C2F33] hover:bg-[#1DBFDD]/10 transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              Document Uploaded
            </a>
          </div>
        )}

        {/* Actions */}
        {(offer.status === "submitted" || offer.status === "under_review") && (
          <div className="mt-5 pt-5 border-t border-[#C8C9CB] flex gap-3">
            <button
              disabled
              className="flex-1 py-2 px-4 bg-[#C8C9CB] text-white rounded-lg cursor-not-allowed"
            >
              Revise Offer
            </button>
            <button
              disabled
              className="flex-1 py-2 px-4 border border-red-300 text-red-600 rounded-lg cursor-not-allowed"
            >
              Withdraw
            </button>
          </div>
        )}

        {offer.status === "countered" && (
          <div className="mt-5 pt-5 border-t border-[#C8C9CB] flex gap-3">
            <button
              disabled
              className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg cursor-not-allowed"
            >
              Accept Counter
            </button>
            <button
              disabled
              className="flex-1 py-2 px-4 bg-[#1DBFDD] text-white rounded-lg cursor-not-allowed"
            >
              Make New Offer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
