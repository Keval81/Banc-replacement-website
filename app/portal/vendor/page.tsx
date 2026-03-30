"use client";

import React from "react";
import PortalLayout from "@/components/portal/PortalLayout";
import ActivityFeed from "@/components/portal/ActivityFeed";
import MilestoneTracker from "@/components/portal/MilestoneTracker";
import DocumentVault from "@/components/portal/DocumentVault";
import {
  PortalUser,
  VendorProperty,
  PropertyActivity,
  Milestone,
  StoredDocument,
  PropertyPerformance,
} from "@/types/portal";
import {
  Home,
  Eye,
  PoundSterling,
  TrendingUp,
  Calendar,
  FileText,
  ArrowUpRight,
  Users,
} from "lucide-react";

// Mock data - replace with API calls
const mockUser: PortalUser = {
  id: "user-1",
  name: "Sarah Johnson",
  email: "sarah.j@example.com",
  phone: "+44 7700 900123",
  role: "vendor",
  joinedDate: "2024-01-15",
};

const mockMilestones: Milestone[] = [
  {
    id: "m1",
    title: "Instruction Received",
    description: "Property instruction confirmed",
    status: "completed",
    completedDate: "2024-01-15",
  },
  {
    id: "m2",
    title: "Marketing Live",
    description: "Property listed on portals",
    status: "completed",
    completedDate: "2024-01-18",
  },
  {
    id: "m3",
    title: "First Viewing",
    description: "First prospective buyer viewing",
    status: "completed",
    completedDate: "2024-01-22",
  },
  {
    id: "m4",
    title: "Offer Received",
    description: "Offers from interested buyers",
    status: "completed",
    completedDate: "2024-01-25",
  },
  {
    id: "m5",
    title: "Sale Agreed",
    description: "Offer accepted, solicitors instructed",
    status: "in_progress",
    estimatedDate: "2024-02-01",
  },
  {
    id: "m6",
    title: "Conveyancing",
    description: "Legal process underway",
    status: "pending",
  },
  {
    id: "m7",
    title: "Exchange",
    description: "Contracts exchanged",
    status: "pending",
  },
  {
    id: "m8",
    title: "Completion",
    description: "Sale completed",
    status: "pending",
  },
];

const mockActivities: PropertyActivity[] = [
  {
    id: "a1",
    type: "viewing",
    title: "Viewing Completed",
    description: "Prospective buyer viewed the property",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    metadata: { viewingTime: "2:30 PM" },
  },
  {
    id: "a2",
    type: "offer",
    title: "New Offer Received",
    description: "An offer has been made on your property",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    metadata: { offerAmount: 850000, offerStatus: "pending" },
  },
  {
    id: "a3",
    type: "message",
    title: "Message from Agent",
    description: "Update on marketing campaign",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    metadata: { senderName: "James Mitchell" },
  },
  {
    id: "a4",
    type: "marketing",
    title: "Featured on Rightmove",
    description: "Your property is now featured",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  },
  {
    id: "a5",
    type: "viewing",
    title: "Viewing Booked",
    description: "New viewing scheduled",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    metadata: { viewingTime: "Tomorrow, 11:00 AM" },
  },
];

const mockDocuments: StoredDocument[] = [
  {
    id: "d1",
    name: "EPC Certificate.pdf",
    type: "epc",
    size: 2457600,
    uploadedAt: "2024-01-15",
    uploadedBy: "Banc Property",
    url: "#",
  },
  {
    id: "d2",
    name: "Floor Plan.pdf",
    type: "floorplan",
    size: 1843200,
    uploadedAt: "2024-01-16",
    uploadedBy: "Banc Property",
    url: "#",
  },
  {
    id: "d3",
    name: "Property Brochure.pdf",
    type: "brochure",
    size: 4194304,
    uploadedAt: "2024-01-17",
    uploadedBy: "Banc Property",
    url: "#",
  },
];

const mockPerformance: PropertyPerformance = {
  propertyId: "prop-1",
  totalViews: 1256,
  onlineViews: 1123,
  brochureDownloads: 45,
  viewingRequests: 12,
  actualViewings: 8,
  offersReceived: 3,
  daysOnMarket: 45,
};

export default function VendorPortalPage() {
  return (
    <PortalLayout user={mockUser} notifications={2}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1A1917]">
              Welcome back, {mockUser.name.split(" ")[0]}
            </h1>
            <p className="text-[#8A8880] mt-1">
              Here&apos;s what&apos;s happening with your property
            </p>
          </div>
          <a
            href="/sales/properties/prop-1"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4AC8E8] text-white rounded-lg hover:bg-[#1A9BBF] transition-colors font-medium"
          >
            <Eye className="w-4 h-4" />
            View Listing
          </a>
        </div>

        {/* Property Card */}
        <div className="bg-white rounded-xl border border-[#E0DFDC] overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/3">
              <img
                src="/images/property-hero.jpg"
                alt="Your Property"
                className="w-full h-48 lg:h-full object-cover"
              />
            </div>
            <div className="p-5 lg:w-2/3">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-[#1A1917]">
                    15 Oakwood Drive, Cuffley
                  </h2>
                  <p className="text-[#8A8880]">EN6 4JL</p>
                </div>
                <span className="px-3 py-1 bg-[#4AC8E8]/10 text-[#1A9BBF] text-sm font-medium rounded-full">
                  Under Offer
                </span>
              </div>
              <p className="text-2xl font-bold text-[#4AC8E8] mb-4">
                £875,000
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1 text-[#8A8880]">
                  <Home className="w-4 h-4" />
                  4 Bedrooms
                </span>
                <span className="flex items-center gap-1 text-[#8A8880]">
                  <TrendingUp className="w-4 h-4" />
                  {mockPerformance.daysOnMarket} days on market
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#E0DFDC] p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#4AC8E8]/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#4AC8E8]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1A1917]">
              {mockPerformance.totalViews.toLocaleString()}
            </p>
            <p className="text-sm text-[#8A8880]">Total Views</p>
          </div>

          <div className="bg-white rounded-xl border border-[#E0DFDC] p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1A1917]">
              {mockPerformance.actualViewings}
            </p>
            <p className="text-sm text-[#8A8880]">Viewings</p>
          </div>

          <div className="bg-white rounded-xl border border-[#E0DFDC] p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1A1917]">
              {mockPerformance.brochureDownloads}
            </p>
            <p className="text-sm text-[#8A8880]">Brochure Downloads</p>
          </div>

          <div className="bg-white rounded-xl border border-[#E0DFDC] p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <PoundSterling className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1A1917]">
              {mockPerformance.offersReceived}
            </p>
            <p className="text-sm text-[#8A8880]">Offers Received</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <ActivityFeed activities={mockActivities} maxItems={5} />

          {/* Milestone Tracker */}
          <MilestoneTracker milestones={mockMilestones} />
        </div>

        {/* Documents & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DocumentVault documents={mockDocuments} allowUpload={true} />
          </div>

          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-[#E0DFDC] p-5">
              <h3 className="font-heading font-semibold text-[#1A1917] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <a
                  href="/portal/vendor/viewings"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F4F3F1] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#4AC8E8]" />
                    <span className="text-[#1A1917]">View Calendar</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#8A8880]" />
                </a>
                <a
                  href="/portal/vendor/offers"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F4F3F1] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <PoundSterling className="w-5 h-5 text-[#4AC8E8]" />
                    <span className="text-[#1A1917]">Review Offers</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#8A8880]" />
                </a>
                <a
                  href="/portal/vendor/messages"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F4F3F1] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#4AC8E8]" />
                    <span className="text-[#1A1917]">Message Agent</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#8A8880]" />
                </a>
              </div>
            </div>

            {/* Agent Contact */}
            <div className="bg-[#4AC8E8] rounded-xl p-5 text-white">
              <h3 className="font-heading font-semibold mb-3">
                Your Agent
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">James Mitchell</p>
                  <p className="text-sm text-white/80">Senior Negotiator</p>
                </div>
              </div>
              <a
                href="tel:+441707000000"
                className="block w-full py-2 px-4 bg-white text-[#4AC8E8] text-center rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                Call Agent
              </a>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
