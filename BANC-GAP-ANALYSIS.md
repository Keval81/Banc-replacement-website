# Banc Website Gap Analysis & Enhancement Plan
**Date:** February 27, 2026  
**Objective:** Exceed current bancproperty.com functionality while preparing for CRM integration

---

## Executive Summary

Our current build has strong foundations but lacks several key features present on the live site and misses opportunities to exceed competitor functionality. This plan outlines 47 identified gaps across 10 categories, with a phased implementation strategy using 12 specialized agents.

---

## Section 1: Live Site (bancproperty.com) Analysis

### 1.1 Current Live Site Features

**Navigation & Structure:**
- Multi-level navigation with dropdowns
- Social media links (Facebook, YouTube, Instagram)
- Office locations: Cuffley, Mayfair
- Mobile-responsive menu with hamburger

**Property Search:**
- Advanced filters: Min/Max price (£150K - £3M+), Bedrooms (Studio-10+), Property type
- Sold properties archive
- Online instant valuation tool (PropertyLogic integration)
- Property detail pages with image galleries

**Content Pages:**
- Sales section: Properties, Valuation, Buyers Guide, Sellers Guide, Stamp Duty calculator
- Lettings section: Properties, Tenants Guide, Landlords Guide, Fees
- Land & New Homes
- Banc Premier Homes (£1M+ properties)
- The Guild (membership showcase)
- Reviews/Testimonials
- Become a Partner
- Area Guides
- Track Record
- The Team
- Contact

**Features:**
- Cookie consent management
- Google Reviews integration
- Online magazines (Life Magazine, E-Zine)
- Partner logos display
- CMP Certificate & Complaints Procedure links

**Technical:**
- Built on Webdadi estate agent platform
- Property data feeds to Rightmove/Zoopla/OnTheMarket
- PDF brochure generation
- QR codes for print marketing

---

## Section 2: Our Current Build Analysis

### 2.1 Pages Currently Implemented

| Page | Status | Notes |
|------|--------|-------|
| Home | ✅ Complete | Hero, PropertySearch, FeaturedListings, Services, GoogleReviews, Testimonials, TrustSection |
| Sales Index | ✅ Complete | Basic structure, links to sub-pages |
| Sales/Buyers Guide | ✅ Complete | 6-step guide with tips |
| Sales/Sellers Guide | ✅ Complete | Detailed 10-step process |
| Sales/Properties | ✅ Complete | Grid layout with PropertyCard component |
| Sales/Property Detail | ⚠️ Static | Single mock property (needs dynamic data) |
| Lettings Index | ✅ Complete | Service cards, search |
| Lettings/Properties | ✅ Complete | Rental listings grid |
| Lettings/Tenants Guide | ✅ Complete | Comprehensive guide |
| Lettings/Landlords Guide | ✅ Complete | Full guide with services |
| Premier Homes | ✅ Complete | Premium service page |
| Area Guides | ✅ Complete | 9 areas with Unsplash images |
| The Guild | ✅ Complete | Membership benefits |
| Track Record | ✅ Complete | Stats + recent sales |
| The Team | ✅ Complete | 3 team members |
| Reviews | ✅ Complete | Testimonial cards |
| Become Partner | ✅ Complete | Partnership benefits |
| Land & New Homes | ✅ Complete | Developer services |
| Contact | ✅ Complete | Form + office info |
| Valuation | ✅ Complete | Multi-step form |

### 2.2 Components Available

- Header (3 variants: default, blue-grey, light)
- Footer
- PropertyCard
- UI components from shadcn (Button, Input, Textarea, Checkbox)
- Motion/Framer animations

---

## Section 3: Identified Gaps

### 3.1 CRITICAL GAPS (Must Fix Before Launch)

#### GAP-001: Property Data Integration
**Current:** Static mock data in PropertyCard and property detail pages  
**Live Site:** Live property feed from CRM/property software  
**Impact:** HIGH - Users cannot browse real listings  
**Solution:** Create API integration layer for property data (CRM-ready)

#### GAP-002: User Authentication System
**Current:** None  
**Live Site:** Login/Register functionality at `/account/register`  
**Impact:** HIGH - Cannot save favorites, manage alerts, track applications  
**Solution:** Implement NextAuth with email/password + social login

#### GAP-003: Saved Properties/Favorites
**Current:** Heart icon on PropertyCard is non-functional  
**Live Site:** Users can save properties to shortlist  
**Impact:** MEDIUM-HIGH  
**Solution:** Favorites system with local storage (anonymous) + database (logged in)

#### GAP-004: Property Alerts System
**Current:** None  
**Live Site:** Users can set up property alerts by criteria  
**Impact:** HIGH - Lead generation feature  
**Solution:** Alert subscription system with email notifications

#### GAP-005: Online Valuation Tool
**Current:** Static valuation form (submits to nowhere)  
**Live Site:** Instant online valuation via PropertyLogic integration  
**Impact:** HIGH - Key lead gen tool  
**Solution:** Integrate with automated valuation model (AVM) API or build custom

### 3.2 FUNCTIONALITY GAPS

#### GAP-006: Stamp Duty Calculator
**Current:** Not implemented  
**Live Site:** `/sales` includes stamp duty calculator link  
**Impact:** MEDIUM  
**Solution:** Build interactive SDLT calculator with first-time buyer logic

#### GAP-007: Cookie Consent Management
**Current:** None  
**Live Site:** Full cookie banner with preferences  
**Impact:** MEDIUM (GDPR compliance)  
**Solution:** Implement CookieBot or custom solution

#### GAP-008: Sitemap Page
**Current:** Not implemented  
**Live Site:** `/sitemap` exists  
**Impact:** LOW-MEDIUM (SEO)  
**Solution:** Auto-generated sitemap page

#### GAP-009: Terms & Privacy Pages
**Current:** Footer links don't work  
**Live Site:** Full legal pages  
**Impact:** MEDIUM (Legal compliance)  
**Solution:** Create comprehensive Terms and Privacy Policy pages

#### GAP-010: Contact Form Backend
**Current:** Form submits to nowhere  
**Live Site:** Working contact forms  
**Impact:** HIGH  
**Solution:** Connect to email service (SendGrid/AWS SES) + CRM webhook

### 3.3 CONTENT GAPS

#### GAP-011: Why Us Page Enhancement
**Current:** Basic service cards  
**Live Site:** More comprehensive "Why Us" content  
**Impact:** MEDIUM  
**Solution:** Add differentiators, awards, process explanation

#### GAP-012: Office Location Pages
**Current:** Single contact page  
**Live Site:** Individual office pages (Cuffley, Mayfair)  
**Impact:** MEDIUM (Local SEO)  
**Solution:** Create dedicated office pages with maps, teams, local info

#### GAP-013: Fees Page (Lettings)
**Current:** Not implemented  
**Live Site:** Transparent fees page  
**Impact:** MEDIUM (Legal requirement)  
**Solution:** Create fees breakdown page

#### GAP-014: Blog/News Section
**Current:** None  
**Live Site:** None (but should exceed)  
**Impact:** MEDIUM (Content marketing)  
**Solution:** Add blog with market updates, area insights

#### GAP-015: FAQ Section
**Current:** None  
**Live Site:** Limited  
**Impact:** LOW-MEDIUM  
**Solution:** Comprehensive FAQ for sales, lettings, general

### 3.4 CRM INTEGRATION PREPARATION GAPS

Based on CRM Data Model v2.1, these gaps need addressing:

#### GAP-016: Applicant Registration Flow
**CRM Requirement:** Contact management with property requirements  
**Current:** None  
**Solution:** Multi-step registration capturing requirements

#### GAP-017: Viewing Booking System
**CRM Requirement:** Viewings table with scheduling  
**Current:** None  
**Solution:** Calendar integration for booking viewings

#### GAP-018: Offer Submission Portal
**CRM Requirement:** Offers table with negotiation tracking  
**Current:** None  
**Solution:** Secure offer submission form

#### GAP-019: Vendor Portal UI
**CRM Requirement:** Vendor activity feed, document sharing  
**Current:** None  
**Solution:** Vendor dashboard mockup (ready for API)

#### GAP-020: Progress Tracking UI
**CRM Requirement:** Milestone tracking  
**Current:** None  
**Solution:** Sales progress tracker component

### 3.5 UX/UI ENHANCEMENTS (Exceed Live Site)

#### GAP-021: Advanced Property Search
**Current:** Basic form  
**Live Site:** Basic filters  
**Exceed:** Map-based search, drawing search areas, school catchment filter

#### GAP-022: Property Comparison Tool
**Current:** None  
**Live Site:** None  
**Exceed:** Compare up to 3 properties side-by-side

#### GAP-023: Virtual Tours Integration
**Current:** Static images only  
**Live Site:** Static images  
**Exceed:** Matterport/360° tour embedding

#### GAP-024: Mortgage Calculator
**Current:** None  
**Live Site:** None  
**Exceed:** Affordability calculator with rates

#### GAP-025: School Catchment Checker
**Current:** None  
**Live Site:** None  
**Exceed:** Ofsted data integration

#### GAP-026: Transport Links Display
**Current:** None  
**Live Site:** None  
**Exceed:** Station proximity, journey time calculator

#### GAP-027: Energy Efficiency Visualizer
**Current:** EPC rating display  
**Live Site:** Basic EPC  
**Exceed:** Interactive EPC with improvement suggestions

#### GAP-028: Dark Mode
**Current:** Light only  
**Live Site:** Light only  
**Exceed:** Full dark mode support

### 3.6 PERFORMANCE & SEO GAPS

#### GAP-029: Image Optimization
**Current:** Using Unsplash directly  
**Solution:** Next.js Image optimization, WebP, lazy loading

#### GAP-030: Structured Data (Schema.org)
**Current:** None  
**Live Site:** Limited  
**Solution:** Full RealEstateListing, Organization, LocalBusiness schema

#### GAP-031: Open Graph Meta Tags
**Current:** Basic in layout.tsx  
**Solution:** Page-specific OG images and descriptions

#### GAP-032: Core Web Vitals Optimization
**Current:** Unknown  
**Solution:** LCP/CLS/FID optimization

### 3.7 MOBILE GAPS

#### GAP-033: Mobile Property Search Experience
**Current:** Responsive but basic  
**Live Site:** Mobile-optimized  
**Exceed:** Bottom sheet filters, swipeable cards

#### GAP-034: Click-to-Call Integration
**Current:** Phone numbers not linked  
**Solution:** Tel: links with tracking

#### GAP-035: WhatsApp Integration
**Current:** None  
**Exceed:** WhatsApp Business chat

### 3.8 MARKETING GAPS

#### GAP-036: Email Newsletter Signup
**Current:** None  
**Live Site:** Limited  
**Solution:** Newsletter signup with Mailchimp/integration

#### GAP-037: Social Proof Enhancements
**Current:** Basic testimonials  
**Live Site:** Google Reviews  
**Exceed:** Live review feeds, sold price achievements

#### GAP-038: Print-Friendly Property Details
**Current:** None  
**Live Site:** PDF brochures  
**Solution:** Print stylesheet + PDF generation

### 3.9 ADVANCED FEATURES (Future-Proofing)

#### GAP-039: AI Property Matching
**Current:** None  
**CRM:** AI matching scores (v2.1)  
**Solution:** "Recommended for you" algorithm

#### GAP-040: Chatbot/Conversational UI
**Current:** None  
**Solution:** Property search chatbot

#### GAP-041: Document Upload Portal
**Current:** None  
**CRM:** Document management  
**Solution:** Secure file upload for ID/proof of funds

#### GAP-042: E-Signature Integration
**Current:** None  
**Solution:** DocuSign/HelloSign for contracts

### 3.10 DATA & INTEGRATION GAPS

#### GAP-043: Land Registry Integration
**Current:** None  
**Solution:** Sold prices, property history

#### GAP-044: Schools API Integration
**Current:** None  
**Solution:** Ofsted ratings, catchment areas

#### GAP-045: Transport API Integration
**Current:** None  
**Solution:** TFL/National Rail journey planning

#### GAP-046: EPC API Integration
**Current:** Static  
**Solution:** Live EPC data

#### GAP-047: Street View Integration
**Current:** None  
**Solution:** Google Street View embedding

---

## Section 4: Implementation Plan

### Phase 1: Foundation (Week 1-2) - Agents 1-3
Focus: Critical gaps and core functionality

**Agent 1: Property Core & API Layer**
- GAP-001: Property data API structure
- GAP-029: Image optimization
- GAP-030: Schema.org structured data

**Agent 2: Authentication & User Management**
- GAP-002: NextAuth implementation
- GAP-003: Favorites system
- GAP-016: Applicant registration flow

**Agent 3: Forms & Backend Integration**
- GAP-010: Contact form backend
- GAP-007: Cookie consent
- GAP-009: Terms & Privacy pages

### Phase 2: Property Experience (Week 2-3) - Agents 4-6
Focus: Property search and detail improvements

**Agent 4: Property Search Enhancement**
- GAP-021: Advanced search with map
- GAP-004: Property alerts system
- GAP-022: Property comparison tool

**Agent 5: Property Detail Page**
- GAP-023: Virtual tours
- GAP-026: Transport links
- GAP-027: Energy efficiency visualizer
- GAP-047: Street View

**Agent 6: Calculators & Tools**
- GAP-006: Stamp Duty calculator
- GAP-024: Mortgage calculator
- GAP-005: Valuation tool integration

### Phase 3: Content & SEO (Week 3) - Agents 7-8
Focus: Content gaps and SEO optimization

**Agent 7: Content Pages**
- GAP-011: Why Us enhancement
- GAP-012: Office location pages
- GAP-013: Fees page
- GAP-015: FAQ section

**Agent 8: SEO & Performance**
- GAP-031: Open Graph optimization
- GAP-032: Core Web Vitals
- GAP-008: Sitemap page
- GAP-014: Blog setup

### Phase 4: CRM Integration Prep (Week 4) - Agents 9-10
Focus: Preparing for CRM connection

**Agent 9: Portal UIs**
- GAP-017: Viewing booking system
- GAP-018: Offer submission portal
- GAP-019: Vendor portal UI
- GAP-020: Progress tracking UI

**Agent 10: Mobile & UX Polish**
- GAP-033: Mobile experience
- GAP-034: Click-to-call
- GAP-035: WhatsApp integration
- GAP-028: Dark mode

### Phase 5: Advanced Features (Week 4-5) - Agents 11-12
Focus: Exceeding competition

**Agent 11: Data Integrations**
- GAP-043: Land Registry
- GAP-044: Schools API
- GAP-045: Transport API
- GAP-046: EPC API
- GAP-025: School catchment checker

**Agent 12: AI & Automation**
- GAP-039: AI property matching
- GAP-040: Chatbot
- GAP-036: Newsletter system
- GAP-037: Social proof enhancements

---

## Section 5: Agent Assignments

| Agent | Name | Focus | Model | Deliverables |
|-------|------|-------|-------|--------------|
| 1 | PropertyCoreAgent | Property API & Data | Codex 5.2 | API layer, image optimization, structured data |
| 2 | AuthAgent | Authentication & Users | Codex 5.2 | NextAuth, favorites, registration |
| 3 | FormsAgent | Forms & Compliance | Codex 5.2 | Contact forms, cookie consent, legal pages |
| 4 | SearchAgent | Property Search | Codex 5.2 | Advanced search, alerts, comparison |
| 5 | DetailAgent | Property Detail | Codex 5.2 | Virtual tours, maps, energy visualizer |
| 6 | CalculatorAgent | Tools & Calculators | Codex 5.2 | SDLT, mortgage, valuation |
| 7 | ContentAgent | Content Pages | Codex 5.2 | Why Us, offices, fees, FAQ |
| 8 | SEOAgent | SEO & Performance | Codex 5.2 | OG tags, CWV, sitemap, blog |
| 9 | PortalAgent | Portal UIs | Codex 5.2 | Viewings, offers, vendor portal, progress |
| 10 | MobileAgent | Mobile & UX | Codex 5.2 | Mobile UX, click-to-call, WhatsApp, dark mode |
| 11 | DataAgent | Data Integrations | Codex 5.2 | Land Registry, schools, transport, EPC |
| 12 | AIAgent | AI & Automation | Codex 5.2 | Matching, chatbot, newsletter, social proof |

---

## Section 6: Success Criteria

### Minimum Viable Product (MVP)
- All GAP-001 to GAP-010 resolved
- All current pages functional with real data structure
- Authentication working
- Contact forms submitting

### Competitive Parity
- All features from live site replicated
- All GAP-001 to GAP-020 resolved

### Competitive Advantage (Exceed)
- All 47 gaps addressed
- AI matching operational
- Superior mobile experience
- Sub-2-second page loads
- 100/100 Lighthouse score

---

## Section 7: Technical Notes

### CRM Integration Points (Per Data Model v2.1)

**Phase 1 API Endpoints Needed:**
```
GET /api/properties - Property listing
GET /api/properties/[id] - Property detail
POST /api/contact - Contact form
POST /api/valuation - Valuation request
POST /api/auth/* - Authentication
GET /api/user/favorites - User favorites
```

**Phase 2 API Endpoints:**
```
POST /api/alerts - Create alert
GET /api/alerts - User alerts
POST /api/viewings - Book viewing
POST /api/offers - Submit offer
GET /api/vendor/activity - Vendor feed
```

### Database Schema (Prisma)
See CRM Data Model v2.1 for full schema. Key tables:
- properties
- contacts (applicants/vendors)
- viewings
- offers
- valuations
- favorites
- alerts

### External APIs Required
1. **Property Valuation:** Hometrack, Zoopla AVM, or custom
2. **Schools:** DfE/Ofsted API
3. **Transport:** TFL API, National Rail
4. **EPC:** Landmark EPBD API
5. **Land Registry:** HM Land Registry API
6. **Maps:** Google Maps Platform
7. **Email:** SendGrid/AWS SES
8. **Auth:** NextAuth with Prisma adapter

---

## Section 8: Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API rate limits | Medium | Medium | Caching layer, fallbacks |
| Data sync delays | High | Medium | Queue system, optimistic UI |
| Mobile performance | Medium | High | Lazy loading, code splitting |
| SEO regression | Low | High | Pre-render, sitemap validation |
| Scope creep | High | Medium | Strict phase gates |

---

## Approval Required

- [ ] Gap analysis approved
- [ ] Agent allocation approved
- [ ] Phase priorities confirmed
- [ ] CRM integration timeline agreed
- [ ] External API budget approved

**Next Action:** Spin up 12 specialized agents to implement Phase 1-5 simultaneously.
