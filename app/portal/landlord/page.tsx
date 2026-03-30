"use client";

import React from "react";
import PortalLayout from "@/components/portal/PortalLayout";
import DocumentVault from "@/components/portal/DocumentVault";
import {
  PortalUser,
  RentalProperty,
  ComplianceItem,
  MaintenanceRequest,
  StoredDocument,
  getComplianceLabel,
  formatCurrency,
} from "@/types/portal";
import {
  Home,
  Users,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  PoundSterling,
  TrendingUp,
  ArrowUpRight,
  FileText,
  Calendar,
} from "lucide-react";

// Mock data
const mockUser: PortalUser = {
  id: "user-3",
  name: "David Thompson",
  email: "d.thompson@example.com",
  phone: "+44 7700 900789",
  role: "landlord",
  joinedDate: "2023-08-10",
};

const mockProperties: RentalProperty[] = [
  {
    id: "rent-1",
    address: "45 Station Road, Cuffley, EN6 4JA",
    image: "/images/property-1.jpg",
    tenant: {
      id: "tenant-1",
      name: "Emily & James Wilson",
      email: "wilson.family@example.com",
      phone: "+44 7700 111222",
      tenancyStart: "2023-09-01",
      tenancyEnd: "2024-08-31",
      rentAmount: 2200,
      depositAmount: 2538,
    },
    tenancyStatus: "active",
    monthlyRent: 2200,
    nextInspectionDate: "2024-03-15",
    compliance: [
      { type: "epc", status: "valid", expiryDate: "2027-08-15" },
      { type: "gas_safety", status: "expiring_soon", expiryDate: "2024-02-28" },
      { type: "electrical", status: "valid", expiryDate: "2025-06-10" },
      { type: "smoke_alarms", status: "valid", expiryDate: "2025-01-20" },
    ],
    maintenanceRequests: [
      {
        id: "maint-1",
        propertyId: "rent-1",
        title: "Leaking tap in kitchen",
        description: "Kitchen tap is dripping continuously",
        status: "in_progress",
        priority: "low",
        reportedAt: "2024-01-20",
      },
    ],
    incomeHistory: [
      { month: "Sep 2023", rent: 2200, expenses: 150, netIncome: 2050 },
      { month: "Oct 2023", rent: 2200, expenses: 200, netIncome: 2000 },
      { month: "Nov 2023", rent: 2200, expenses: 100, netIncome: 2100 },
      { month: "Dec 2023", rent: 2200, expenses: 350, netIncome: 1850 },
      { month: "Jan 2024", rent: 2200, expenses: 120, netIncome: 2080 },
    ],
  },
  {
    id: "rent-2",
    address: "8 The Drive, Brookmans Park, AL9 7QG",
    image: "/images/property-2.jpg",
    tenancyStatus: "void",
    monthlyRent: 2800,
    compliance: [
      { type: "epc", status: "valid", expiryDate: "2026-03-20" },
      { type: "gas_safety", status: "valid", expiryDate: "2024-06-15" },
      { type: "electrical", status: "valid", expiryDate: "2025-09-22" },
    ],
    maintenanceRequests: [],
    incomeHistory: [],
  },
];

const mockDocuments: StoredDocument[] = [
  {
    id: "doc-1",
    name: "Tenancy Agreement - Wilson.pdf",
    type: "contract",
    size: 5242880,
    uploadedAt: "2023-08-25",
    uploadedBy: "Banc Property",
    url: "#",
  },
  {
    id: "doc-2",
    name: "EPC Certificate.pdf",
    type: "epc",
    size: 2097152,
    uploadedAt: "2023-08-20",
    uploadedBy: "Banc Property",
    url: "#",
  },
  {
    id: "doc-3",
    name: "Gas Safety Certificate.pdf",
    type: "other",
    size: 1048576,
    uploadedAt: "2023-08-20",
    uploadedBy: "Banc Property",
    url: "#",
  },
  {
    id: "doc-4",
    name: "Inventory Report.pdf",
    type: "other",
    size: 3145728,
    uploadedAt: "2023-09-01",
    uploadedBy: "Banc Property",
    url: "#",
  },
];

const getComplianceStatusColor = (status: ComplianceItem["status"]) => {
  switch (status) {
    case "valid":
      return "bg-green-100 text-green-700";
    case "expiring_soon":
      return "bg-amber-100 text-amber-700";
    case "expired":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getMaintenanceStatusColor = (status: MaintenanceRequest["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "in_progress":
      return "bg-blue-100 text-blue-700";
    case "reported":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getPriorityColor = (priority: MaintenanceRequest["priority"]) => {
  switch (priority) {
    case "emergency":
      return "text-red-600";
    case "high":
      return "text-amber-600";
    case "medium":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};

export default function LandlordPortalPage() {
  const totalMonthlyIncome = mockProperties.reduce(
    (sum, p) => sum + (p.tenancyStatus === "active" ? p.monthlyRent : 0),
    0
  );
  const activeTenancies = mockProperties.filter(
    (p) => p.tenancyStatus === "active"
  ).length;
  const pendingMaintenance = mockProperties.flatMap((p) =>
    p.maintenanceRequests.filter((m) => m.status !== "completed" && m.status !== "closed")
  );
  const expiringCompliance = mockProperties.flatMap((p) =>
    p.compliance.filter((c) => c.status === "expiring_soon" || c.status === "expired")
  );

  return (
    <PortalLayout user={mockUser} notifications={2}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1A1917]">
            Welcome back, {mockUser.name.split(" ")[0]}
          </h1>
          <p className="text-[#8A8880] mt-1">
            Manage your property portfolio
          </p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#E0DFDC] p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#4AC8E8]/10 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-[#4AC8E8]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1A1917]">
              {mockProperties.length}
            </p>
            <p className="text-sm text-[#8A8880]">Properties</p>
          </div>

          <div className="bg-white rounded-xl border border-[#E0DFDC] p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1A1917]">{activeTenancies}</p>
            <p className="text-sm text-[#8A8880]">Active Tenancies</p>
          </div>

          <div className="bg-white rounded-xl border border-[#E0DFDC] p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <PoundSterling className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1A1917]">
              {formatCurrency(totalMonthlyIncome)}
            </p>
            <p className="text-sm text-[#8A8880]">Monthly Income</p>
          </div>

          <div className="bg-white rounded-xl border border-[#E0DFDC] p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1A1917]">
              {pendingMaintenance.length}
            </p>
            <p className="text-sm text-[#8A8880]">Open Requests</p>
          </div>
        </div>

        {/* Compliance Alert */}
        {expiringCompliance.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">
                Compliance Attention Required
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                {expiringCompliance.length} certificate
                {expiringCompliance.length !== 1 ? "s" : ""} need
                {expiringCompliance.length === 1 ? "s" : ""} renewal soon.
              </p>
            </div>
          </div>
        )}

        {/* Properties */}
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-semibold text-[#1A1917]">
            Your Properties
          </h2>
          {mockProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl border border-[#E0DFDC] overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Property Image & Basic Info */}
                <div className="lg:w-1/3 p-4">
                  <div className="relative">
                    <img
                      src={property.image}
                      alt={property.address}
                      className="w-full h-48 lg:h-40 object-cover rounded-lg"
                    />
                    <span
                      className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${
                        property.tenancyStatus === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-[#E0DFDC] text-[#1A1917]"
                      }`}
                    >
                      {property.tenancyStatus === "active"
                        ? "Tenanted"
                        : "Void"}
                    </span>
                  </div>
                  <h3 className="font-medium text-[#1A1917] mt-3">
                    {property.address}
                  </h3>
                  <p className="text-lg font-semibold text-[#4AC8E8]">
                    {formatCurrency(property.monthlyRent)} <span className="text-sm font-normal text-[#8A8880]">pcm</span>
                  </p>
                </div>

                {/* Property Details */}
                <div className="lg:w-2/3 p-4 lg:border-l border-[#E0DFDC]">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Tenant Info */}
                    {property.tenant && (
                      <div className="p-3 bg-[#F4F3F1] rounded-lg">
                        <h4 className="text-sm font-medium text-[#8A8880] mb-2">
                          Current Tenant
                        </h4>
                        <p className="font-medium text-[#1A1917]">
                          {property.tenant.name}
                        </p>
                        <p className="text-sm text-[#8A8880]">
                          Tenancy ends: {" "}
                          {new Date(property.tenant.tenancyEnd).toLocaleDateString("en-GB", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )}

                    {/* Next Inspection */}
                    {property.nextInspectionDate && (
                      <div className="p-3 bg-[#F4F3F1] rounded-lg">
                        <h4 className="text-sm font-medium text-[#8A8880] mb-2">
                          Next Inspection
                        </h4>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#4AC8E8]" />
                          <span className="font-medium text-[#1A1917]">
                            {new Date(property.nextInspectionDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compliance Status */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-[#8A8880] mb-2">
                      Compliance Status
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {property.compliance.map((item) => (
                        <span
                          key={item.type}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getComplianceStatusColor(
                            item.status
                          )}`}
                        >
                          {getComplianceLabel(item.type)}: {" "}
                          {item.status === "expiring_soon"
                            ? "Expiring Soon"
                            : item.status === "expired"
                            ? "Expired"
                            : "Valid"}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Maintenance Requests */}
                  {property.maintenanceRequests.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-[#8A8880] mb-2">
                        Maintenance Requests
                      </h4>
                      <div className="space-y-2">
                        {property.maintenanceRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-2 bg-[#F4F3F1] rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4 text-[#8A8880]" />
                              <span className="text-sm text-[#1A1917]">
                                {request.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${getMaintenanceStatusColor(
                                  request.status
                                )}`}
                              >
                                {request.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Income Graph (if available) */}
                  {property.incomeHistory.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-[#8A8880] mb-2">
                        Recent Income
                      </h4>
                      <div className="h-24 flex items-end gap-1">
                        {property.incomeHistory.map((income, idx) => {
                          const maxIncome = Math.max(
                            ...property.incomeHistory.map((i) => i.netIncome)
                          );
                          const height = (income.netIncome / maxIncome) * 100;
                          return (
                            <div
                              key={idx}
                              className="flex-1 flex flex-col items-center gap-1"
                            >
                              <div
                                className="w-full bg-[#4AC8E8] rounded-t"
                                style={{ height: `${height}%` }}
                                title={`${income.month}: ${formatCurrency(income.netIncome)}`}
                              />
                              <span className="text-[10px] text-[#8A8880]">
                                {income.month.split(" ")[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                  href="/portal/landlord/maintenance"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F4F3F1] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-[#4AC8E8]" />
                    <span className="text-[#1A1917]">Report Maintenance</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#8A8880]" />
                </a>
                <a
                  href="/portal/landlord/compliance"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F4F3F1] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#4AC8E8]" />
                    <span className="text-[#1A1917]">View Compliance</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#8A8880]" />
                </a>
                <a
                  href="/portal/landlord/financials"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F4F3F1] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#4AC8E8]" />
                    <span className="text-[#1A1917]">Financial Reports</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#8A8880]" />
                </a>
                <a
                  href="/contact"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F4F3F1] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#4AC8E8]" />
                    <span className="text-[#1A1917]">Contact Property Manager</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#8A8880]" />
                </a>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-[#1A9BBF] rounded-xl p-5 text-white">
              <h3 className="font-heading font-semibold mb-3">
                Your Property Manager
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">Rebecca Stone</p>
                  <p className="text-sm text-white/80">Property Manager</p>
                </div>
              </div>
              <a
                href="tel:+441707000000"
                className="block w-full py-2 px-4 bg-white text-[#1A9BBF] text-center rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                Call Manager
              </a>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
