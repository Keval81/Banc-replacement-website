"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Bell, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Pause, 
  Play, 
  Mail,
  Clock,
  MapPin,
  Home,
  PoundSterling,
  Bed,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimary,
  actionPrimaryOnDark,
  actionSecondary,
  actionSecondaryOnDark,
  fieldControl,
  fieldLabel,
  segmented,
  segmentedOption,
} from "@/components/ui/form-styles";

interface AlertCriteria {
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  propertyType?: string[];
  tenure?: string;
  keywords?: string;
  location?: string;
}

interface PropertyAlert {
  id: string;
  name: string;
  criteria: AlertCriteria;
  frequency: "instant" | "daily" | "weekly";
  isActive: boolean;
  createdAt: string;
  lastSent?: string;
  matchCount: number;
}

const frequencyLabels = {
  instant: "Instant",
  daily: "Daily",
  weekly: "Weekly",
};

const frequencyIcons = {
  instant: Bell,
  daily: Clock,
  weekly: Mail,
};

// Mock data - in production this would come from the API
const mockAlerts: PropertyAlert[] = [
  {
    id: "alert_1",
    name: "4+ Bed Houses in Hertfordshire",
    criteria: {
      minPrice: 800000,
      maxPrice: 2000000,
      beds: 4,
      propertyType: ["house", "mansion"],
      location: "Hertfordshire",
      keywords: "garden garage",
    },
    frequency: "daily",
    isActive: true,
    createdAt: "2026-02-20T10:00:00Z",
    lastSent: "2026-02-26T09:00:00Z",
    matchCount: 12,
  },
  {
    id: "alert_2",
    name: "Mayfair Penthouses",
    criteria: {
      minPrice: 2000000,
      propertyType: ["penthouse", "apartment"],
      location: "Mayfair, London",
      tenure: "leasehold",
    },
    frequency: "instant",
    isActive: true,
    createdAt: "2026-02-15T14:30:00Z",
    lastSent: "2026-02-26T15:45:00Z",
    matchCount: 3,
  },
  {
    id: "alert_3",
    name: "Cottages in Buckinghamshire",
    criteria: {
      maxPrice: 1500000,
      propertyType: ["cottage"],
      location: "Buckinghamshire",
      tenure: "freehold",
    },
    frequency: "weekly",
    isActive: false,
    createdAt: "2026-02-10T11:00:00Z",
    lastSent: "2026-02-24T09:00:00Z",
    matchCount: 8,
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PropertyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [editingAlert, setEditingAlert] = useState<PropertyAlert | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchAlerts = async () => {
      try {
        const response = await fetch("/api/alerts");
        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts?.length ? data.alerts : mockAlerts);
        } else {
          setAlerts(mockAlerts);
        }
      } catch (error) {
        setAlerts(mockAlerts);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const handleToggleActive = async (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return;

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !alert.isActive }),
      });

      if (response.ok) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId ? { ...a, isActive: !a.isActive } : a
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle alert:", error);
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch (error) {
      console.error("Failed to delete alert:", error);
    }
  };

  const handleCreateAlert = async (alertData: Partial<PropertyAlert>) => {
    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertData),
      });

      if (response.ok) {
        const { alert } = await response.json();
        setAlerts((prev) => [alert, ...prev]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create alert:", error);
    }
  };

  const activeAlerts = alerts.filter((a) => a.isActive);
  const pausedAlerts = alerts.filter((a) => !a.isActive);

  return (
    <div className="bg-white text-banc-dark min-h-screen">
      <Header />

      <PageBand
        eyebrow="Your account"
        title="Property Alerts"
        lede="Get notified when properties matching your criteria are listed"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => setShowCreateModal(true)} className={actionPrimaryOnDark}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Alert
          </button>
          <Link href="/search" className={actionSecondaryOnDark}>
            <Search className="h-4 w-4" aria-hidden="true" />
            Browse Properties
          </Link>
        </div>
      </PageBand>

      {/* Stats */}
      <section className="border-b border-banc-line bg-banc-grey-pale">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <div className="rounded-[var(--radius-md)] border border-banc-line bg-white p-4">
              <p className="text-sm text-banc-muted-readable">Total Alerts</p>
              <p className="text-2xl font-semibold">{alerts.length}</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-banc-line bg-white p-4">
              <p className="text-sm text-banc-muted-readable">Active</p>
              <p className="text-2xl font-semibold text-banc-focus">{activeAlerts.length}</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-banc-line bg-white p-4">
              <p className="text-sm text-banc-muted-readable">Paused</p>
              <p className="text-2xl font-semibold text-banc-muted-readable">{pausedAlerts.length}</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-banc-line bg-white p-4">
              <p className="text-sm text-banc-muted-readable">Total Matches</p>
              <p className="text-2xl font-semibold text-banc-focus">
                {alerts.reduce((sum, a) => sum + a.matchCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-banc-focus border-t-transparent rounded-full" />
            </div>
          ) : alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[var(--radius-md)] border border-banc-line bg-banc-grey-pale p-5 sm:p-6 lg:p-8"
            >
              <Bell className="mb-4 h-8 w-8 text-banc-muted-readable" aria-hidden="true" />
              <h2 className="mb-2 text-xl font-semibold">No alerts yet</h2>
              <p className="mb-6 max-w-md text-banc-muted-readable">
                Create a property alert to get notified when new properties matching your criteria are listed.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setShowCreateModal(true)} className={actionPrimary}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create Alert
                </button>
                <Link href="/search" className={actionSecondary}>
                  Browse Properties
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-10">
              {/* Active Alerts */}
              {activeAlerts.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-banc-focus" />
                    Active Alerts ({activeAlerts.length})
                  </h2>
                  <div className="space-y-4">
                    {activeAlerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        isExpanded={expandedAlert === alert.id}
                        onToggleExpand={() => setExpandedAlert(
                          expandedAlert === alert.id ? null : alert.id
                        )}
                        onToggleActive={() => handleToggleActive(alert.id)}
                        onDelete={() => handleDelete(alert.id)}
                        onEdit={() => setEditingAlert(alert)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Paused Alerts */}
              {pausedAlerts.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Pause className="w-5 h-5 text-banc-muted-readable" />
                    Paused Alerts ({pausedAlerts.length})
                  </h2>
                  <div className="space-y-4 opacity-70">
                    {pausedAlerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        isExpanded={expandedAlert === alert.id}
                        onToggleExpand={() => setExpandedAlert(
                          expandedAlert === alert.id ? null : alert.id
                        )}
                        onToggleActive={() => handleToggleActive(alert.id)}
                        onDelete={() => handleDelete(alert.id)}
                        onEdit={() => setEditingAlert(alert)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateAlert}
      />
    </div>
  );
}

// Alert Card Component
interface AlertCardProps {
  alert: PropertyAlert;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

function AlertCard({ alert, isExpanded, onToggleExpand, onToggleActive, onDelete, onEdit }: AlertCardProps) {
  const FrequencyIcon = frequencyIcons[alert.frequency];
  
  return (
    <motion.div
      layout
      className={cn(
        "overflow-hidden rounded-[var(--radius-md)] border bg-white transition-colors",
        alert.isActive ? "border-banc-line" : "border-banc-grey/20",
        isExpanded && "border-banc-focus"
      )}
    >
      {/* Header */}
      <div 
        className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 p-4 hover:bg-banc-grey-pale/50"
        onClick={onToggleExpand}
      >
        <div className={cn(
          "hidden h-10 w-10 shrink-0 items-center justify-center rounded-full sm:flex",
          alert.isActive ? "bg-banc-focus/10" : "bg-banc-grey-pale"
        )}>
          <Bell className={cn(
            "w-5 h-5",
            alert.isActive ? "text-banc-focus" : "text-banc-muted-readable"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{alert.name}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-banc-muted-readable">
            <span className="flex items-center gap-1">
              <FrequencyIcon className="w-3.5 h-3.5" />
              {frequencyLabels[alert.frequency]}
            </span>
            <span>•</span>
            <span>{alert.matchCount} matches</span>
            {alert.lastSent && (
              <>
                <span>•</span>
                <span>Last sent {new Date(alert.lastSent).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-1 sm:w-auto">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors",
              alert.isActive 
                ? "text-banc-focus hover:bg-banc-grey-pale"
                : "text-banc-muted-readable hover:bg-banc-grey-pale"
            )}
            title={alert.isActive ? "Pause alert" : "Resume alert"}
          >
            {alert.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-banc-muted-readable hover:bg-banc-grey-pale hover:text-banc-grey"
            title="Edit alert"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
            title="Delete alert"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-banc-muted-readable" />
          ) : (
            <ChevronDown className="w-5 h-5 text-banc-muted-readable" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-banc-dark/15 bg-banc-grey-pale/50"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {alert.criteria.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-banc-muted-readable mt-0.5" />
                  <div>
                    <p className="text-xs text-banc-muted-readable">Location</p>
                    <p className="text-sm font-medium">{alert.criteria.location}</p>
                  </div>
                </div>
              )}
              {(alert.criteria.minPrice || alert.criteria.maxPrice) && (
                <div className="flex items-start gap-2">
                  <PoundSterling className="w-4 h-4 text-banc-muted-readable mt-0.5" />
                  <div>
                    <p className="text-xs text-banc-muted-readable">Price Range</p>
                    <p className="text-sm font-medium">
                      {alert.criteria.minPrice ? `£${alert.criteria.minPrice.toLocaleString()}` : "No min"}
                      {" - "}
                      {alert.criteria.maxPrice ? `£${alert.criteria.maxPrice.toLocaleString()}` : "No max"}
                    </p>
                  </div>
                </div>
              )}
              {alert.criteria.beds && (
                <div className="flex items-start gap-2">
                  <Bed className="w-4 h-4 text-banc-muted-readable mt-0.5" />
                  <div>
                    <p className="text-xs text-banc-muted-readable">Bedrooms</p>
                    <p className="text-sm font-medium">{alert.criteria.beds}+</p>
                  </div>
                </div>
              )}
              {alert.criteria.propertyType && alert.criteria.propertyType.length > 0 && (
                <div className="flex items-start gap-2">
                  <Home className="w-4 h-4 text-banc-muted-readable mt-0.5" />
                  <div>
                    <p className="text-xs text-banc-muted-readable">Property Type</p>
                    <p className="text-sm font-medium capitalize">
                      {alert.criteria.propertyType.join(", ")}
                    </p>
                  </div>
                </div>
              )}
              {alert.criteria.tenure && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-banc-muted-readable mt-0.5" />
                  <div>
                    <p className="text-xs text-banc-muted-readable">Tenure</p>
                    <p className="text-sm font-medium capitalize">{alert.criteria.tenure}</p>
                  </div>
                </div>
              )}
              {alert.criteria.keywords && (
                <div className="flex items-start gap-2">
                  <Search className="w-4 h-4 text-banc-muted-readable mt-0.5" />
                  <div>
                    <p className="text-xs text-banc-muted-readable">Keywords</p>
                    <p className="text-sm font-medium">{alert.criteria.keywords}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-4 pb-4">
              <Link href={`/search?${new URLSearchParams({
                ...(alert.criteria.minPrice && { minPrice: String(alert.criteria.minPrice) }),
                ...(alert.criteria.maxPrice && { maxPrice: String(alert.criteria.maxPrice) }),
                ...(alert.criteria.beds && { beds: String(alert.criteria.beds) }),
                ...(alert.criteria.propertyType?.length && { propertyType: alert.criteria.propertyType.join(",") }),
                ...(alert.criteria.tenure && { tenure: alert.criteria.tenure }),
                ...(alert.criteria.keywords && { keywords: alert.criteria.keywords }),
              }).toString()}`} className={actionSecondary}>
                <Search className="h-4 w-4" aria-hidden="true" />
                View Matching Properties
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Create Alert Modal
interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (alert: Partial<PropertyAlert>) => void;
}

function CreateAlertModal({ isOpen, onClose, onCreate }: CreateAlertModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    frequency: "instant" | "daily" | "weekly";
    minPrice: string;
    maxPrice: string;
    beds: string;
    location: string;
    keywords: string;
  }>({
    name: "",
    frequency: "daily",
    minPrice: "",
    maxPrice: "",
    beds: "",
    location: "",
    keywords: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name: formData.name || `Alert ${new Date().toLocaleDateString()}`,
      frequency: formData.frequency,
      criteria: {
        minPrice: formData.minPrice ? Number(formData.minPrice) : undefined,
        maxPrice: formData.maxPrice ? Number(formData.maxPrice) : undefined,
        beds: formData.beds ? Number(formData.beds) : undefined,
        location: formData.location || undefined,
        keywords: formData.keywords || undefined,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-md)] bg-white"
      >
        <div className="sticky top-0 z-10 border-b border-banc-dark/15 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Create Property Alert</h2>
            <button onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-banc-grey-pale">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-banc-muted-readable text-sm mt-1">
            Get notified when properties matching your criteria are listed
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
          {/* Alert Name */}
          <div>
            <label className={fieldLabel}>Alert Name</label>
            <Input
              placeholder="e.g., 4 Bed Houses in Cuffley"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={fieldControl}
            />
          </div>

          {/* Frequency */}
          <div>
            <label className={fieldLabel}>Email Frequency</label>
            <div className={segmented}>
              {(["instant", "daily", "weekly"] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFormData({ ...formData, frequency: freq })}
                  aria-pressed={formData.frequency === freq}
                  className={segmentedOption(formData.frequency === freq)}
                >
                  {frequencyLabels[freq]}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className={fieldLabel}>Price Range</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-banc-muted-readable">£</span>
                <Input
                  type="number"
                  placeholder="Min"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                  className={cn(fieldControl, "pl-11")}
                />
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-banc-muted-readable">£</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                  className={cn(fieldControl, "pl-11")}
                />
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className={fieldLabel}>Minimum Bedrooms</label>
            <div className="relative">
              <select
                value={formData.beds}
                onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                className={cn(fieldControl, "cursor-pointer appearance-none pr-10")}
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-banc-muted-readable" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={fieldLabel}>Location</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-banc-muted-readable" />
              <Input
                placeholder="e.g., Cuffley, Mayfair..."
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={cn(fieldControl, "pl-11")}
              />
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className={fieldLabel}>Keywords</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-banc-muted-readable" />
              <Input
                placeholder="e.g., garden, garage, parking..."
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className={cn(fieldControl, "pl-11")}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-banc-dark/15 pt-6 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className={actionSecondary}>
              Cancel
            </button>
            <button type="submit" className={actionPrimary}>
              <Bell className="h-4 w-4" aria-hidden="true" />
              Create Alert
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
