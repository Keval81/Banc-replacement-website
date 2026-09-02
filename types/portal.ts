/**
 * Portal Types
 * Type definitions for portal UIs (vendor, applicant, landlord)
 */

// ===== COMMON TYPES =====

export type UserRole = 'vendor' | 'applicant' | 'landlord' | 'admin';

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  joinedDate: string;
}

export interface Notification {
  id: string;
  type: 'viewing' | 'offer' | 'message' | 'document' | 'milestone' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

// ===== VENDOR PORTAL TYPES =====

export type MilestoneStatus = 'completed' | 'in_progress' | 'pending' | 'blocked';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  completedDate?: string;
  estimatedDate?: string;
  icon?: string;
}

export interface PropertyActivity {
  id: string;
  type: 'viewing' | 'offer' | 'message' | 'marketing' | 'milestone';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    viewingTime?: string;
    offerAmount?: number;
    offerStatus?: 'pending' | 'accepted' | 'declined' | 'countered';
    senderName?: string;
  };
}

export interface PropertyPerformance {
  propertyId: string;
  totalViews: number;
  onlineViews: number;
  brochureDownloads: number;
  viewingRequests: number;
  actualViewings: number;
  offersReceived: number;
  daysOnMarket: number;
}

export interface StoredDocument {
  id: string;
  name: string;
  type: 'epc' | 'floorplan' | 'brochure' | 'contract' | 'id' | 'other';
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  thumbnailUrl?: string;
}

export interface VendorProperty {
  id: string;
  address: string;
  price: string;
  status: 'for_sale' | 'under_offer' | 'sold' | 'withdrawn';
  image: string;
  milestones: Milestone[];
  performance: PropertyPerformance;
  activities: PropertyActivity[];
  documents: StoredDocument[];
}

// ===== APPLICANT/BUYER PORTAL TYPES =====

export type OfferStatus = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'declined' | 'withdrawn' | 'countered';

export type BuyerPosition = 'cash_buyer' | 'mortgage_in_principle' | 'mortgage_required' | 'selling_property' | 'first_time_buyer';

export interface PropertyOffer {
  id: string;
  propertyId: string;
  propertyAddress: string;
  propertyImage: string;
  amount: number;
  position: BuyerPosition;
  timescale: string;
  status: OfferStatus;
  submittedAt: string;
  updatedAt: string;
  notes?: string;
  proofOfFunds?: StoredDocument;
}

export interface Viewing {
  id: string;
  propertyId: string;
  propertyAddress: string;
  propertyImage: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled';
  agentName?: string;
  agentPhone?: string;
  notes?: string;
  feedbackSubmitted?: boolean;
}

export interface SavedProperty {
  id: string;
  propertyId: string;
  address: string;
  price: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  savedAt: string;
  notes?: string;
}

export interface PropertyAlert {
  id: string;
  name: string;
  locations: string[];
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  propertyTypes: string[];
  emailFrequency: 'instant' | 'daily' | 'weekly';
  active: boolean;
  createdAt: string;
}

// ===== LANDLORD PORTAL TYPES =====

export type TenancyStatus = 'active' | 'expiring_soon' | 'expired' | 'void';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  tenancyStart: string;
  tenancyEnd: string;
  rentAmount: number;
  depositAmount: number;
}

export interface ComplianceItem {
  type: 'epc' | 'gas_safety' | 'electrical' | 'pat_testing' | 'smoke_alarms' | 'eicr';
  status: 'valid' | 'expiring_soon' | 'expired';
  expiryDate: string;
  documentUrl?: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  status: 'reported' | 'in_progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  reportedAt: string;
  completedAt?: string;
  cost?: number;
}

export interface RentalProperty {
  id: string;
  address: string;
  image: string;
  tenant?: Tenant;
  tenancyStatus: TenancyStatus;
  monthlyRent: number;
  nextInspectionDate?: string;
  compliance: ComplianceItem[];
  maintenanceRequests: MaintenanceRequest[];
  incomeHistory: MonthlyIncome[];
}

export interface MonthlyIncome {
  month: string;
  rent: number;
  expenses: number;
  netIncome: number;
}

// ===== VIEWING BOOKING TYPES =====

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  duration: number;
}

export interface AvailableDate {
  date: string;
  slots: TimeSlot[];
}

export interface ViewingBookingRequest {
  propertyId: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
  isRegisteredUser: boolean;
}

// ===== OFFER SUBMISSION TYPES =====

export interface OfferSubmission {
  propertyId: string;
  amount: number;
  position: BuyerPosition;
  timescale: 'immediate' | '1_month' | '2_months' | '3_months' | 'flexible';
  mortgageInPrinciple?: boolean;
  chainFree?: boolean;
  additionalComments?: string;
  proofOfFunds?: File;
  agreedToTerms: boolean;
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
}

// ===== SALES PROGRESS TYPES =====

export type SalesStage = 
  | 'instruction_received'
  | 'marketing_live'
  | 'offer_accepted'
  | 'conveyancing'
  | 'survey'
  | 'mortgage_offer'
  | 'contracts_exchanged'
  | 'completion';

export interface SalesStageInfo {
  id: SalesStage;
  title: string;
  description: string;
  status: MilestoneStatus;
  completedDate?: string;
  estimatedDate?: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: 'agent' | 'buyer_solicitor' | 'seller_solicitor' | 'buyer' | 'seller' | 'lender';
  company?: string;
  phone?: string;
  email?: string;
}

export interface PropertyChainProperty {
  id: string;
  address: string;
  status: 'sold' | 'under_offer' | 'for_sale' | 'unknown';
  position: 'above' | 'below' | 'this';
}

export interface SalesProgress {
  transactionId: string;
  propertyAddress: string;
  propertyImage: string;
  agreedPrice: number;
  stages: SalesStageInfo[];
  currentStage: SalesStage;
  estimatedCompletion?: string;
  stakeholders: Stakeholder[];
  documents: StoredDocument[];
  chain?: PropertyChainProperty[];
  notes: string[];
}

// ===== UTILITY FUNCTIONS =====

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function getBuyerPositionLabel(position: BuyerPosition): string {
  const labels: Record<BuyerPosition, string> = {
    cash_buyer: 'Cash Buyer',
    mortgage_in_principle: 'Mortgage in Principle',
    mortgage_required: 'Mortgage Required',
    selling_property: 'Selling Property',
    first_time_buyer: 'First Time Buyer',
  };
  return labels[position] || position;
}

export function getComplianceLabel(type: ComplianceItem['type']): string {
  const labels: Record<ComplianceItem['type'], string> = {
    epc: 'EPC Certificate',
    gas_safety: 'Gas Safety',
    electrical: 'Electrical Certificate',
    pat_testing: 'PAT Testing',
    smoke_alarms: 'Smoke Alarms',
    eicr: 'EICR',
  };
  return labels[type] || type;
}
