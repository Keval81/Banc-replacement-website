# Agent 3: Forms & Backend Integration

## Your Mission
Implement working form backends, cookie consent, and legal pages for compliance.

## Context
- Next.js 14+ App Router
- Project: ~/Projects/banc-website
- Email service: Create integration layer (SendGrid/AWS SES ready)
- CRM webhook ready for integration

## Deliverables

### 1. Contact Form Backend
Update `/app/contact/ContactPageClient.tsx`:
- Connect form to `POST /api/contact`
- Send email to office@bancproperty.com
- Store submission in database (for CRM sync)
- Auto-response email to user
- Success/error toast notifications

API: `app/api/contact/route.ts`
```typescript
// Store: ContactSubmission model
// Email: Send confirmation + notify admin
// Webhook: POST to CRM (if configured)
```

### 2. Valuation Form Backend
Update `/app/valuation/page.tsx`:
- `POST /api/valuation` endpoint
- Store: ValuationRequest model
- Email: Send to valuations@bancproperty.com
- Auto-response with "we'll be in touch"
- Add to CRM as new lead

### 3. Cookie Consent System
Create comprehensive cookie management:
- `components/CookieConsent.tsx` - Banner component
- `hooks/useCookies.ts` - Cookie management hook
- Categories: Essential, Analytics, Marketing
- Store preferences in localStorage + cookie
- Load Google Analytics only after consent

Integration points:
- Add to root layout
- Respect preferences for all tracking
- Edit preferences link in footer

### 4. Legal Pages
Create comprehensive legal pages:

**Terms of Use** (`/terms/page.tsx`):
- Website usage terms
- Intellectual property
- Liability limitations
- Governing law

**Privacy Policy** (`/privacy/page.tsx`):
- Data collection explanation
- Cookie usage details
- User rights (GDPR)
- Data retention policy
- Contact for data requests

**Cookie Policy** (`/cookies/page.tsx`):
- Detailed cookie list
- Purpose of each cookie
- Third-party cookies
- How to manage cookies

### 5. Form Validation
Use Zod for all forms:
```typescript
const contactSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject required"),
  message: z.string().min(10, "Message too short"),
  consent: z.boolean().refine(v => v, "Consent required")
});
```

### 6. Email Templates
Create email templates:
- Contact form confirmation (user)
- Contact form notification (admin)
- Valuation request confirmation
- Welcome email (for new registrations)

## Models to Add (Prisma)
```prisma
model ContactSubmission {
  id        String   @id @default(uuid())
  name      String
  email     String
  phone     String?
  subject   String
  message   String
  source    String   // which page submitted
  status    String   // new, responded, closed
  createdAt DateTime @default(now())
}

model ValuationRequest {
  id            String   @id @default(uuid())
  firstName     String
  lastName      String
  email         String
  phone         String
  address       String
  postcode      String
  propertyType  String
  bedrooms      String
  timeframe     String
  message       String?
  status        String   // new, contacted, valued, instructed
  createdAt     DateTime @default(now())
}
```

## Success Criteria
- [ ] Contact form submits and sends emails
- [ ] Valuation form submits and stores data
- [ ] Cookie banner displays on first visit
- [ ] Cookie preferences are respected
- [ ] Legal pages are comprehensive
- [ ] All forms have validation
