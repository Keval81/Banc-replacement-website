"use client";

import React from "react";
import { useParams } from "next/navigation";
import DocumentVault from "@/components/portal/DocumentVault";
import {
  SalesProgress,
  SalesStage,
  SalesStageInfo,
  Stakeholder,
  StoredDocument,
  formatCurrency,
  formatDate,
} from "@/types/portal";
import {
  ChevronLeft,
  CheckCircle,
  Clock,
  Hourglass,
  AlertCircle,
  FileText,
  Home,
  Users,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

// Mock data
const mockProgress: SalesProgress = {
  transactionId: "txn-12345",
  propertyAddress: "15 Oakwood Drive, Cuffley, EN6 4JL",
  propertyImage: "/images/property-hero.jpg",
  agreedPrice: 850000,
  currentStage: "conveyancing",
  estimatedCompletion: "2024-03-15",
  stages: [
    {
      id: "instruction_received",
      title: "Instruction Received",
      description: "Property instruction confirmed",
      status: "completed",
      completedDate: "2024-01-15",
    },
    {
      id: "marketing_live",
      title: "Marketing Live",
      description: "Property listed on portals",
      status: "completed",
      completedDate: "2024-01-18",
    },
    {
      id: "offer_accepted",
      title: "Offer Accepted",
      description: "Sale price agreed at £850,000",
      status: "completed",
      completedDate: "2024-01-25",
    },
    {
      id: "conveyancing",
      title: "Conveyancing",
      description: "Legal process underway",
      status: "in_progress",
      estimatedDate: "2024-02-20",
    },
    {
      id: "survey",
      title: "Survey",
      description: "Buyer survey arranged",
      status: "pending",
    },
    {
      id: "mortgage_offer",
      title: "Mortgage Offer",
      description: "Mortgage approval confirmed",
      status: "pending",
    },
    {
      id: "contracts_exchanged",
      title: "Contracts Exchanged",
      description: "Legally binding agreement",
      status: "pending",
    },
    {
      id: "completion",
      title: "Completion",
      description: "Sale completed, keys handed over",
      status: "pending",
    },
  ],
  stakeholders: [
    {
      id: "stake-1",
      name: "Sarah Mitchell",
      role: "agent",
      company: "Banc Property Group",
      phone: "+44 1707 123456",
      email: "sarah@bancproperty.com",
    },
    {
      id: "stake-2",
      name: "James & Rebecca Wilson",
      role: "buyer",
    },
    {
      id: "stake-3",
      name: "Taylor & Co Solicitors",
      role: "seller_solicitor",
      phone: "+44 1707 654321",
      email: "conveyancing@taylorco.co.uk",
    },
  ],
  documents: [
    {
      id: "doc-1",
      name: "Memorandum of Sale.pdf",
      type: "contract",
      size: 1048576,
      uploadedAt: "2024-01-26",
      uploadedBy: "Banc Property",
      url: "#",
    },
    {
      id: "doc-2",
      name: "Property Information Form.pdf",
      type: "other",
      size: 2097152,
      uploadedAt: "2024-01-28",
      uploadedBy: "Seller",
      url: "#",
    },
    {
      id: "doc-3",
      name: "Fittings and Contents Form.pdf",
      type: "other",
      size: 1572864,
      uploadedAt: "2024-01-28",
      uploadedBy: "Seller",
      url: "#",
    },
  ],
  chain: [
    {
      id: "chain-1",
      address: "45 Station Road, Cuffley",
      status: "sold",
      position: "above",
    },
    {
      id: "chain-2",
      address: "15 Oakwood Drive, Cuffley",
      status: "under_offer",
      position: "this",
    },
    {
      id: "chain-3",
      address: "Unknown",
      status: "unknown",
      position: "below",
    },
  ],
  notes: [
    "Buyer survey scheduled for 5th February",
    "Solicitors have requested additional information about the extension",
    "No chain for buyer - cash purchase",
  ],
};

const getStageIcon = (status: SalesStageInfo["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    case "in_progress":
      return <Clock className="w-6 h-6 text-[#4AC8E8]" />;
    case "blocked":
      return <AlertCircle className="w-6 h-6 text-red-500" />;
    case "pending":
    default:
      return <Hourglass className="w-6 h-6 text-[#E0DFDC]" />;
  }
};

const getRoleLabel = (role: Stakeholder["role"]) => {
  const labels: Record<string, string> = {
    agent: "Estate Agent",
    buyer_solicitor: "Buyer\'s Solicitor",
    seller_solicitor: "Seller\'s Solicitor",
    buyer: "Buyer",
    seller: "Seller",
    lender: "Lender",
  };
  return labels[role] || role;
};

export default function ProgressTrackerPage() {
  const params = useParams();
  const transactionId = params.transactionId as string;

  const completedStages = mockProgress.stages.filter(
    (s) => s.status === "completed"
  ).length;
  const progressPercentage = Math.round(
    (completedStages / mockProgress.stages.length) * 100
  );
  const currentStage = mockProgress.stages.find(
    (s) => s.status === "in_progress"
  );

  return (
    <div className="min-h-screen bg-[#F4F3F1] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <a
          href="/portal/vendor"
          className="inline-flex items-center gap-2 text-[#8A8880] hover:text-[#4AC8E8] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to portal
        </a>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-[#1A1917]">
                Sale Progress
              </h1>
              <p className="text-[#8A8880] mt-1">
                Transaction ID: {transactionId}
              </p>
            </div>
            <span className="inline-flex items-center px-4 py-2 bg-[#4AC8E8]/10 text-[#1A9BBF] rounded-full font-medium">
              <Clock className="w-4 h-4 mr-2" />
              In Progress
            </span>
          </div>
        </div>

        {/* Property Summary */}
        <div className="bg-white rounded-xl border border-[#E0DFDC] overflow-hidden mb-6">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/4">
              <img
                src={mockProgress.propertyImage}
                alt={mockProgress.propertyAddress}
                className="w-full h-48 lg:h-full object-cover"
              />
            </div>
            <div className="p-5 lg:w-3/4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-[#1A1917]">
                    {mockProgress.propertyAddress}
                  </h2>
                  <p className="text-2xl font-bold text-[#4AC8E8] mt-1">
                    {formatCurrency(mockProgress.agreedPrice)}
                  </p>
                  <p className="text-sm text-[#8A8880]">Agreed Price</p>
                </div>
                {mockProgress.estimatedCompletion && (
                  <div className="md:text-right">
                    <p className="text-sm text-[#8A8880]">Est. Completion</p>
                    <p className="text-xl font-semibold text-[#1A1917]">
                      {formatDate(mockProgress.estimatedCompletion)}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#8A8880]">
                    Overall Progress
                  </span>
                  <span className="text-sm font-medium text-[#4AC8E8]">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="w-full h-3 bg-[#F4F3F1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4AC8E8] to-[#9ADFF2] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-xl border border-[#E0DFDC] p-6">
              <h2 className="text-xl font-heading font-semibold text-[#1A1917] mb-6">
                Milestone Timeline
              </h2>
              <div className="space-y-0">
                {mockProgress.stages.map((stage, index) => (
                  <div key={stage.id} className="relative">
                    {/* Connector Line */}
                    {index < mockProgress.stages.length - 1 && (
                      <div
                        className={`absolute left-3 top-10 w-0.5 h-[calc(100%+1rem)] ${
                          stage.status === "completed"
                            ? "bg-green-500"
                            : "bg-[#E0DFDC]"
                        }`}
                      />
                    )}

                    {/* Stage Item */}
                    <div className="flex gap-4 pb-8 last:pb-0">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            stage.status === "completed"
                              ? "bg-green-500"
                              : stage.status === "in_progress"
                              ? "bg-[#4AC8E8]"
                              : stage.status === "blocked"
                              ? "bg-red-500"
                              : "bg-[#E0DFDC]"
                          }`}
                        >
                          {stage.status === "completed" ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : stage.status === "in_progress" ? (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          ) : null}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3
                              className={`font-medium ${
                                stage.status === "in_progress"
                                  ? "text-[#4AC8E8]"
                                  : stage.status === "completed"
                                  ? "text-[#1A1917]"
                                  : "text-[#8A8880]"
                              }`}
                            >
                              {stage.title}
                            </h3>
                            <p
                              className={`text-sm mt-0.5 ${
                                stage.status === "in_progress"
                                  ? "text-[#8A8880]"
                                  : "text-[#8A8880]"
                              }`}
                            >
                              {stage.description}
                            </p>

                            {/* Dates */}
                            {stage.completedDate && (
                              <p className="text-xs text-green-600 mt-2">
                                Completed: {formatDate(stage.completedDate)}
                              </p>
                            )}
                            {stage.estimatedDate && stage.status === "in_progress" && (
                              <p className="text-xs text-[#4AC8E8] mt-2">
                                Est. completion: {formatDate(stage.estimatedDate)}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                              stage.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : stage.status === "in_progress"
                                ? "bg-[#4AC8E8]/10 text-[#1A9BBF]"
                                : stage.status === "blocked"
                                ? "bg-red-100 text-red-700"
                                : "bg-[#F4F3F1] text-[#8A8880]"
                            }`}
                          >
                            {stage.status === "completed"
                              ? "Completed"
                              : stage.status === "in_progress"
                              ? "In Progress"
                              : stage.status === "blocked"
                              ? "Blocked"
                              : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-[#E0DFDC] p-6">
              <h2 className="text-xl font-heading font-semibold text-[#1A1917] mb-4">
                Recent Updates
              </h2>
              <ul className="space-y-3">
                {mockProgress.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#4AC8E8] rounded-full mt-2 flex-shrink-0" />
                    <p className="text-[#1A1917]">{note}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Property Chain */}
            {mockProgress.chain && (
              <div className="bg-white rounded-xl border border-[#E0DFDC] p-6">
                <h2 className="text-xl font-heading font-semibold text-[#1A1917] mb-4">
                  Property Chain
                </h2>
                <div className="space-y-4">
                  {mockProgress.chain.map((property) => (
                    <div
                      key={property.id}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        property.position === "this"
                          ? "bg-[#4AC8E8]/10 border-2 border-[#4AC8E8]"
                          : "bg-[#F4F3F1]"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          property.position === "this"
                            ? "bg-[#4AC8E8]"
                            : "bg-white"
                        }`}
                      >
                        <Home
                          className={`w-5 h-5 ${
                            property.position === "this"
                              ? "text-white"
                              : "text-[#8A8880]"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            property.position === "this"
                              ? "text-[#1A1917]"
                              : "text-[#8A8880]"
                          }`}
                        >
                          {property.address}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              property.status === "sold"
                                ? "bg-green-100 text-green-700"
                                : property.status === "under_offer"
                                ? "bg-[#4AC8E8]/10 text-[#1A9BBF]"
                                : "bg-[#E0DFDC] text-[#8A8880]"
                            }`}
                          >
                            {property.status === "sold"
                              ? "Sold"
                              : property.status === "under_offer"
                              ? "Under Offer"
                              : "Unknown"}
                          </span>
                          {property.position === "above" && (
                            <span className="text-xs text-[#8A8880]">
                              You are buying this
                            </span>
                          )}
                          {property.position === "below" && (
                            <span className="text-xs text-[#8A8880]">
                              Your buyer is selling
                            </span>
                          )}
                          {property.position === "this" && (
                            <span className="text-xs text-[#4AC8E8] font-medium">
                              Your Property
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            <DocumentVault documents={mockProgress.documents} allowUpload={true} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Stage Card */}
            {currentStage && (
              <div className="bg-[#4AC8E8] rounded-xl p-5 text-white">
                <h3 className="font-heading font-semibold mb-2">
                  Current Stage
                </h3>
                <p className="text-xl font-medium">{currentStage.title}</p>
                <p className="text-sm text-white/80 mt-1">
                  {currentStage.description}
                </p>
                {currentStage.estimatedDate && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-sm text-white/80">Est. completion</p>
                    <p className="font-medium">
                      {formatDate(currentStage.estimatedDate)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Stakeholders */}
            <div className="bg-white rounded-xl border border-[#E0DFDC] p-5">
              <h3 className="font-heading font-semibold text-[#1A1917] mb-4">
                Your Team
              </h3>
              <div className="space-y-4">
                {mockProgress.stakeholders.map((stakeholder) => (
                  <div
                    key={stakeholder.id}
                    className="p-3 bg-[#F4F3F1] rounded-lg"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#4AC8E8]/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#4AC8E8]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1917]">
                          {stakeholder.name}
                        </p>
                        <p className="text-xs text-[#8A8880]">
                          {getRoleLabel(stakeholder.role)}
                        </p>
                      </div>
                    </div>
                    {stakeholder.phone && (
                      <a
                        href={`tel:${stakeholder.phone}`}
                        className="flex items-center gap-2 text-sm text-[#4AC8E8] hover:underline"
                      >
                        <Phone className="w-4 h-4" />
                        {stakeholder.phone}
                      </a>
                    )}
                    {stakeholder.email && (
                      <a
                        href={`mailto:${stakeholder.email}`}
                        className="flex items-center gap-2 text-sm text-[#4AC8E8] hover:underline mt-1"
                      >
                        <Mail className="w-4 h-4" />
                        {stakeholder.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-[#E0DFDC] p-5">
              <h3 className="font-heading font-semibold text-[#1A1917] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <a
                  href="/portal/vendor/messages"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F4F3F1] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#4AC8E8]" />
                    <span className="text-[#1A1917]">Message Team</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#8A8880]" />
                </a>
                <a
                  href="/portal/vendor/documents"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F4F3F1] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#4AC8E8]" />
                    <span className="text-[#1A1917]">Upload Document</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#8A8880]" />
                </a>
                <a
                  href="/contact"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F4F3F1] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#4AC8E8]" />
                    <span className="text-[#1A1917]">Call Agent</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#8A8880]" />
                </a>
              </div>
            </div>

            {/* Help */}
            <div className="bg-[#1A9BBF] rounded-xl p-5 text-white">
              <h3 className="font-heading font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-white/80 mb-4">
                Our team is here to guide you through every step of the selling
                process.
              </p>
              <a
                href="/contact"
                className="block w-full py-2 px-4 bg-white text-[#1A9BBF] text-center rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
