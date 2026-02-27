# Agent 10: Mobile & UX Polish

## Your Mission
Create exceptional mobile experiences and polish UX throughout.

## Context
- Next.js 14+ with App Router
- Project: ~/Projects/banc-website
- Focus: Mobile-first, accessibility, dark mode

## Deliverables

### 1. Mobile Property Search
Optimize `/search` for mobile:

**Bottom Sheet Filters:**
- Swipe up to reveal filters
- Sliders for price/beds
- Apply/clear buttons
- Smooth animations

**Swipeable Cards:**
- Tinder-style property cards (optional)
- Swipe right to favorite
- Swipe left to dismiss
- Tap to view details

**Mobile Map:**
- Full-screen map view
- Bottom card for selected property
- "List" toggle button
- Location button (center on me)

### 2. Click-to-Call Integration
Add tel: links throughout:
- Header phone number
- Property detail agent cards
- Contact pages
- Office pages

**Tracking:**
- Log click events
- Track which pages generate calls

### 3. WhatsApp Integration
Add WhatsApp Business chat:

**Floating Button:**
- Bottom-right corner (mobile)
- Hide on scroll down, show on scroll up
- Pre-filled message with property ref (on property pages)

**Page:** `/api/whatsapp` - Generate WhatsApp links

### 4. Dark Mode
Implement full dark mode:

**Setup:**
- Tailwind dark mode configuration
- next-themes provider
- Toggle in header

**Color Scheme:**
```css
Dark:
- Background: #0F0F0F
- Surface: #1A1A1A
- Text: #F5F5F5
- Primary: #1DBFDD (keep)
- Secondary: #2C2F33
```

**Components to update:**
- All pages need dark variants
- Property cards
- Forms
- Modals
- Navigation

### 5. Accessibility Improvements
WCAG 2.1 AA compliance:

**Focus Management:**
- Visible focus indicators
- Skip to content link
- Focus trap in modals

**ARIA:**
- Proper landmarks
- Labels on all form inputs
- Live regions for alerts
- Button vs link distinctions

**Keyboard:**
- Full keyboard navigation
- Escape closes modals
- Arrow keys for carousels

**Screen Readers:**
- Alt text audit
- ARIA labels where needed
- Semantic HTML

### 6. Micro-interactions
Add polish with animations:

**Framer Motion:**
- Page transitions
- Staggered list items
- Hover effects on cards
- Button press states
- Loading skeletons

**Components:**
- `components/ui/Skeleton.tsx`
- `components/ui/LoadingSpinner.tsx`
- Page transition wrapper

### 7. Toast Notifications
Create notification system:
- Success messages
- Error messages
- Action confirmations
- Persistent vs temporary

### 8. Mobile Navigation
Optimize header for mobile:
- Hamburger menu with animation
- Full-screen overlay
- Quick actions (call, saved properties)
- Sticky on scroll

### 9. Form UX
Improve all forms:
- Inline validation
- Auto-save drafts
- Progress indicators (multi-step)
- Clear error messages
- Success confirmations

### 10. Touch Targets
Ensure mobile-friendly sizing:
- Minimum 44x44px touch targets
- Adequate spacing between buttons
- Swipe gestures where appropriate

## Files
```
components/
  mobile/
    BottomSheet.tsx
    SwipeableCard.tsx
    MobileNav.tsx
    FloatingWhatsApp.tsx
  ui/
    ThemeToggle.tsx
    Toast.tsx
    Skeleton.tsx
    LoadingSpinner.tsx
hooks/
  useScrollDirection.ts
  useMediaQuery.ts
  useLocalStorage.ts
lib/
  accessibility.ts
```

## Success Criteria
- [ ] Mobile search uses bottom sheets
- [ ] Click-to-call works everywhere
- [ ] WhatsApp button floats on mobile
- [ ] Dark mode toggles correctly
- [ ] Lighthouse Accessibility 100/100
- [ ] All forms have inline validation
- [ ] Animations are smooth (60fps)
- [ ] Mobile nav is fully functional
