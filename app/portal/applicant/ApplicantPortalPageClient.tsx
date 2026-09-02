"use client";

import Link from "next/link";

import React from "react";
import PortalLayout from "@/components/portal/PortalLayout";
import { DemoBanner } from "@/components/ui/DemoBanner";
import OfferStatus from "@/components/offers/OfferStatus";
import {
  PortalUser,
  SavedProperty,
  Viewing,
  PropertyOffer,
  PropertyAlert,
} from "@/types/portal";
import {
  Heart,
  Calendar,
  MessageSquare,
  Bell,
  Eye,
  Bed,
  Bath,
  ArrowUpRight,
  MapPin,
  PoundSterling,
  Home,
} from "lucide-react";

// Mock data
const mockUser: PortalUser = {
  id: "user-2",
  name: "Michael Chen",
  email: "michael.c@example.com",
  phone: "+44 7700 900456",
  role: "applicant",
  joinedDate: "2023-11-20",
};

const mockSavedProperties: SavedProperty[] = [
  {
    id: "saved-1",
    propertyId: "prop-123",
    address: "12 The Ridings, Cuffley, EN6 4JL",
    price: "£925,000",
    image: "/images/property-1.jpg",
    bedrooms: 4,
    bathrooms: 2,
    savedAt: "2024-01-20",
    notes: "Great garden, need to check school catchment",
  },
  {
    id: "saved-2",
    propertyId: "prop-124",
    address: "8 Oaklands Avenue, Potters Bar, EN6 2RY",
    price: "£675,000",
    image: "/images/property-2.jpg",
    bedrooms: 3,
    bathrooms: 1,
    savedAt: "2024-01-18",
  },
  {
    id: "saved-3",
    propertyId: "prop-125",
    address: "25 Station Road, Brookmans Park, AL9 7QS",
    price: "£1,150,000",
    image: "/images/property-3.jpg",
    bedrooms: 5,
    bathrooms: 3,
    savedAt: "2024-01-15",
    notes: "Perfect location for commute",
  },
];

const mockViewings: Viewing[] = [
  {
    id: "view-1",
    propertyId: "prop-123",
    propertyAddress: "12 The Ridings, Cuffley",
    propertyImage: "/images/property-1.jpg",
    date: "2024-01-30",
    time: "14:30",
    duration: 30,
    status: "confirmed",
    agentName: "Sarah Williams",
    agentPhone: "+44 1707 123456",
  },
  {
    id: "view-2",
    propertyId: "prop-124",
    propertyAddress: "8 Oaklands Avenue, Potters Bar",
    propertyImage: "/images/property-2.jpg",
    date: "2024-01-25",
    time: "11:00",
    duration: 30,
    status: "completed",
    feedbackSubmitted: true,
  },
];

const mockOffers: PropertyOffer[] = [
  {
    id: "offer-1",
    propertyId: "prop-123",
    propertyAddress: "12 The Ridings, Cuffley",
    propertyImage: "/images/property-1.jpg",
    amount: 900000,
    position: "mortgage_in_principle",
    timescale: "2_months",
    status: "under_review",
    submittedAt: "2024-01-22",
    updatedAt: "2024-01-22",
  },
];

const mockAlerts: PropertyAlert[] = [
  {
    id: "alert-1",
    name: "Cuffley & Brookmans Park",
    locations: ["Cuffley", "Brookmans Park"],
    minPrice: 600000,
    maxPrice: 1200000,
    minBeds: 3,
    maxBeds: 5,
    propertyTypes: ["detached", "semi_detached"],
    emailFrequency: "daily",
    active: true,
    createdAt: "2023-12-01",
  },
];

export default function ApplicantPortalPage() {
  const upcomingViewings = mockViewings.filter(
    (v) => v.status === "confirmed" || v.status === "pending"
  );
  const pastViewings = mockViewings.filter(
    (v) => v.status === "completed" || v.status === "cancelled"
  );

  return (
    <PortalLayout user={mockUser} notifications={1}>
      <div className="space-y-6">
        <DemoBanner />
        {/* Header */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-banc-dark-deep">
            Welcome back, {mockUser.name.split(" ")[0]}
          </h1>
          <p className="text-banc-grey mt-1">
            Track your property search and viewings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-banc-line p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-banc-dark-deep">
              {mockSavedProperties.length}
            </p>
            <p className="text-sm text-banc-grey">Saved Properties</p>
          </div>

          <div className="bg-white rounded-xl border border-banc-line p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-banc-sky/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-banc-sky" />
              </div>
            </div>
            <p className="text-2xl font-bold text-banc-dark-deep">
              {upcomingViewings.length}
            </p>
            <p className="text-sm text-banc-grey">Upcoming Viewings</p>
          </div>

          <div className="bg-white rounded-xl border border-banc-line p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <PoundSterling className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-banc-dark-deep">
              {mockOffers.length}
            </p>
            <p className="text-sm text-banc-grey">Active Offers</p>
          </div>

          <div className="bg-white rounded-xl border border-banc-line p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-banc-dark-deep">
              {mockAlerts.length}
            </p>
            <p className="text-sm text-banc-grey">Property Alerts</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Saved Properties & Viewings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Properties */}
            <div className="bg-white rounded-xl border border-banc-line overflow-hidden">
              <div className="px-5 py-4 border-b border-banc-line flex items-center justify-between">
                <h3 className="font-heading font-semibold text-banc-dark-deep">
                  Saved Properties
                </h3>
                <a
                  href="/portal/applicant/saved"
                  className="text-sm text-banc-sky hover:text-banc-sky-dark transition-colors"
                >
                  View All →
                </a>
              </div>
              <div className="divide-y divide-banc-line">
                {mockSavedProperties.slice(0, 3).map((property) => (
                  <div
                    key={property.id}
                    className="p-4 hover:bg-banc-grey-pale/50 transition-colors"
                  >
                    <div className="flex gap-4">
                      <img
                        src={property.image}
                        alt={property.address}
                        className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-banc-dark-deep truncate">
                              {property.address}
                            </h4>
                            <p className="text-lg font-semibold text-banc-sky">
                              {property.price}
                            </p>
                          </div>
                          <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Heart className="w-5 h-5 fill-current" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-banc-grey">
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            {property.bedrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {property.bathrooms}
                          </span>
                        </div>
                        {property.notes && (
                          <p className="mt-2 text-sm text-banc-grey italic">
                            &ldquo;{property.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Viewings */}
            <div className="bg-white rounded-xl border border-banc-line overflow-hidden">
              <div className="px-5 py-4 border-b border-banc-line flex items-center justify-between">
                <h3 className="font-heading font-semibold text-banc-dark-deep">
                  Upcoming Viewings
                </h3>
                <a
                  href="/portal/applicant/viewings"
                  className="text-sm text-banc-sky hover:text-banc-sky-dark transition-colors"
                >
                  View All →
                </a>
              </div>
              <div className="divide-y divide-banc-line">
                {upcomingViewings.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-banc-line mx-auto mb-3" />
                    <p className="text-banc-grey">No upcoming viewings</p>
                    <Link
                      href="/sales/properties"
                      className="inline-block mt-3 text-banc-sky hover:underline"
                    >
                      Browse Properties →
                    </Link>
                  </div>
                ) : (
                  upcomingViewings.map((viewing) => (
                    <div
                      key={viewing.id}
                      className="p-4 hover:bg-banc-grey-pale/50 transition-colors"
                    >
                      <div className="flex gap-4">
                        <img
                          src={viewing.propertyImage}
                          alt={viewing.propertyAddress}
                          className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Confirmed
                            </span>
                          </div>
                          <h4 className="font-medium text-banc-dark-deep">
                            {viewing.propertyAddress}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-banc-grey">
                              <Calendar className="w-4 h-4" />
                              {new Date(viewing.date).toLocaleDateString("en-GB", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                            <span className="flex items-center gap-1 text-banc-sky">
                              <Eye className="w-4 h-4" />
                              {viewing.time}
                            </span>
                          </div>
                          {viewing.agentName && (
                            <p className="mt-2 text-sm text-banc-grey">
                              Agent: {viewing.agentName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Offers & Alerts */}
          <div className="space-y-6">
            {/* Active Offers */}
            {mockOffers.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold text-banc-dark-deep mb-3">
                  Your Offers
                </h3>
                {mockOffers.map((offer) => (
                  <OfferStatus key={offer.id} offer={offer} />
                ))}
              </div>
            )}

            {/* Property Alerts */}
            <div className="bg-white rounded-xl border border-banc-line p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-banc-dark-deep">
                  Property Alerts
                </h3>
                <a
                  href="/portal/applicant/alerts"
                  className="text-sm text-banc-sky hover:text-banc-sky-dark"
                >
                  Manage →
                </a>
              </div>
              <div className="space-y-3">
                {mockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-banc-grey-pale rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-banc-dark-deep">
                        {alert.name}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          alert.active ? "bg-green-500" : "bg-banc-line"
                        }`}
                      />
                    </div>
                    <p className="text-sm text-banc-grey">
                      {alert.locations.join(", ")}
                    </p>
                    <p className="text-sm text-banc-grey">
                      £{(alert.minPrice || 0).toLocaleString()} - £
                      {(alert.maxPrice || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 px-4 border border-banc-sky text-banc-sky rounded-lg hover:bg-banc-sky/5 transition-colors text-sm font-medium">
                + Create New Alert
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-banc-line p-5">
              <h3 className="font-heading font-semibold text-banc-dark-deep mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/sales/properties"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-banc-grey-pale transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-banc-sky" />
                    <span className="text-banc-dark-deep">Browse Properties</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-banc-grey" />
                </Link>
                <a
                  href="/sales/buyers-guide"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-banc-grey-pale transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-banc-sky" />
                    <span className="text-banc-dark-deep">Buyer&apos;s Guide</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-banc-grey" />
                </a>
                <a
                  href="/contact"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-banc-grey-pale transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-banc-sky" />
                    <span className="text-banc-dark-deep">Contact Agent</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-banc-grey" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
