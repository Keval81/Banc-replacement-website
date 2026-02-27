# Agent 9: Portal UIs

## Your Mission
Build portal interfaces for vendors, buyers, and landlords to track progress and manage interactions.

## Context
- Next.js 14+ with App Router
- Project: ~/Projects/banc-website
- CRM will provide APIs - build UI ready

## Deliverables

### 1. Vendor Portal
Create `/portal/vendor/page.tsx`:

**Dashboard:**
- Activity feed (recent viewings, offers, messages)
- Property performance stats
- Viewing calendar
- Document storage
- Milestone tracker

**Activity Feed:**
```
- Viewing booked: 3pm today
- New offer received: £850,000
- Message from agent
- Property featured on Rightmove
```

**Milestone Tracker:**
- Instruction received ✓
- Marketing live ✓
- First viewing ✓
- Offer received
- Sale agreed
- Conveyancing
- Exchange
- Completion

**Components:**
- `components/vendor/ActivityFeed.tsx`
- `components/vendor/MilestoneTracker.tsx`
- `components/vendor/DocumentVault.tsx`

### 2. Applicant/Buyer Portal
Create `/portal/applicant/page.tsx`:

**Dashboard:**
- Saved properties
- Property alerts
- Viewing history
- Offer status
- Messages with agents

**Viewing Manager:**
- Upcoming viewings
- Past viewings with notes
- "Book follow-up" buttons

**Offer Tracker:**
- Offers submitted
- Status: Pending, Accepted, Declined
- Counter-offer interface

### 3. Landlord Portal
Create `/portal/landlord/page.tsx`:

**Portfolio View:**
- List of properties
- Tenancy status
- Rent collection status
- Maintenance requests

**Property Card:**
- Address, tenant name, rent
- Next inspection date
- Compliance status (EPC, Gas Safety)
- Income graph

### 4. Viewing Booking System
Create booking flow:

**Page:** `/book-viewing/[propertyId]/page.tsx`
- Calendar picker
- Time slot selection
- Contact details
- Special requests
- Confirmation

**Components:**
- `components/viewing/CalendarPicker.tsx`
- `components/viewing/TimeSlots.tsx`
- `components/viewing/BookingForm.tsx`

### 5. Offer Submission Portal
Create offer submission:

**Page:** `/make-offer/[propertyId]/page.tsx`
- Offer amount
- Buyer position (cash, mortgage in principle, etc.)
- Timescales
- Contact details
- Proof of funds upload (UI ready)
- Terms and conditions

### 6. Progress Tracker (Sales)
Create `/progress/[transactionId]/page.tsx`:

**Visual Timeline:**
- Milestone-based progress bar
- Current stage highlighted
- Estimated completion date
- Documents checklist
- Key dates (survey, exchange, completion)

**Stakeholders:**
- Agent details
- Solicitor details (if provided)
- Buyer/seller chain view

### 7. Document Upload UI
Create secure upload interface:
- ID verification upload
- Proof of funds
- Property documents
- Contract signing (placeholder for DocuSign)

## Portal Layout
Common layout for all portals:
- Sidebar navigation
- Header with user info
- Main content area
- Mobile-responsive menu

## Security
- All routes protected by auth
- Role-based access (vendor sees only their stuff)
- Data sanitization

## Files
```
app/
  portal/
    layout.tsx
    page.tsx (redirect to appropriate portal)
    vendor/
      page.tsx
    applicant/
      page.tsx
    landlord/
      page.tsx
  book-viewing/
    [propertyId]/
      page.tsx
  make-offer/
    [propertyId]/
      page.tsx
  progress/
    [transactionId]/
      page.tsx
components/
  portal/
    PortalLayout.tsx
    PortalNav.tsx
    ActivityFeed.tsx
    MilestoneTracker.tsx
    DocumentVault.tsx
  viewing/
    CalendarPicker.tsx
    TimeSlots.tsx
  offers/
    OfferForm.tsx
    OfferStatus.tsx
```

## Success Criteria
- [ ] Vendor portal shows activity feed
- [ ] Applicant can see saved properties
- [ ] Viewing booking flow works
- [ ] Offer submission form complete
- [ ] Progress tracker visualizes milestones
- [ ] All portals are mobile-friendly
- [ ] Routes are protected
