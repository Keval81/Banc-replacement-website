# BANC Property Detail Page - Mobile Analysis

**URL Analyzed:** https://banc-website-hh521ivmu-digital-inroads.vercel.app/sales/properties/modern-bungalow-cuffley

**Date:** February 28, 2026

---

## EXECUTIVE SUMMARY

The property detail page has **critical mobile issues** that significantly impact usability on devices smaller than 414px width. While some responsive patterns exist, there are fundamental layout flaws causing horizontal overflow, inaccessible touch targets, and broken component behaviors on mobile devices.

**Severity Levels:**
- 🔴 **CRITICAL** - Breaks functionality or causes layout collapse
- 🟠 **HIGH** - Significantly degrades user experience
- 🟡 **MEDIUM** - Causes minor UX friction

---

## 1. MOBILE VIEWPORT BEHAVIOR

### 🔴 CRITICAL: Horizontal Scrolling on Narrow Viewports (320px-375px)

**Problem:**
The page exhibits horizontal scrolling on iPhone SE (375px), iPhone 12 Mini (360px), and smaller Android devices (320px).

**Root Cause Analysis:**

1. **FloorplanViewer Fixed Height:**
   ```tsx
   // File: components/FloorplanViewer.tsx (Line ~140)
   style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '500px' }}
   ```
   The `500px` fixed height creates overflow when combined with the 400px map embed.

2. **SimilarProperties Grid Gap Overflow:**
   ```tsx
   // File: components/SimilarProperties.tsx (Line ~42)
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
   ```
   While the grid adapts, the internal card content with `aspect-[4/3]` images and fixed icon sizes causes content to push beyond viewport when combined with padding.

3. **AgentContactCard Form Inputs:**
   ```tsx
   // File: components/AgentContactCard.tsx (Line ~125-135)
   <Input className="pl-10 h-11 sm:h-12 text-base" />
   ```
   The `pl-10` (40px left padding) + icon width + input text causes overflow in containers with horizontal padding.

**Fix Required:**

```tsx
// FloorplanViewer.tsx - Make height responsive
style={{ 
  height: isFullscreen 
    ? 'calc(100vh - 200px)' 
    : 'clamp(300px, 50vw, 500px)' // Responsive height
}}

// Or use Tailwind classes:
className="h-[300px] sm:h-[400px] lg:h-[500px]"
```

```tsx
// SimilarProperties.tsx - Add container padding fixes
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-0 sm:px-0">
  {/* Cards need internal max-width: 100% */}
  <motion.a className="max-w-[100vw] sm:max-w-none">
```

```tsx
// AgentContactCard.tsx - Fix input overflow
<div className="relative w-full overflow-hidden">
  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
  <Input
    className="pl-10 pr-3 h-11 sm:h-12 text-base w-full box-border"
    // Ensure parent has overflow-x-hidden
  />
</div>
```

---

## 2. GALLERY/PHOTOS SECTION

### 🟠 HIGH: Gallery Tab Navigation Issues

**Problem:**
The tab navigation for Photos/Tour/Map/Floorplan has multiple mobile issues:

**Code Analysis:**
```tsx
// File: app/sales/properties/[id]/page.tsx (Line ~110-145)
<div className="flex items-center gap-1.5 sm:gap-2 mb-4 overflow-x-auto pb-2 
  -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide min-w-0">
```

**Issues:**
1. **Negative margin hack (`-mx-3`)** extends touch area but can cause overflow
2. **Scroll snap not implemented** - users don't get feedback when scrolling tabs
3. **No visual indicator** of more tabs available

**Fix Required:**

```tsx
// Add scroll snap and visual affordance
<div className="flex items-center gap-1.5 sm:gap-2 mb-4 overflow-x-auto pb-2 
  -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory
  [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)]">
  
  <button className="snap-start flex-shrink-0 ...">
    {/* Tab content */}
  </button>
  
  {/* Visual indicator for more content */}
  <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent 
    sm:hidden pointer-events-none" />
</div>
```

### 🔴 CRITICAL: Thumbnail Strip Horizontal Overflow

**Problem:**
```tsx
// File: components/PropertyGallery.tsx (Line ~95-115)
<div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3 overflow-x-auto pb-1 
  scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
```

The `-mx-4 px-4` negative margin pattern breaks on very small screens when combined with `flex-shrink-0` thumbnail buttons.

**Fix Required:**
```tsx
<div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3 overflow-x-auto pb-1 
  scrollbar-hide snap-x snap-mandatory
  -mx-3 px-3 sm:-mx-0 sm:px-0">
  {images.map((image, index) => (
    <button
      key={image.id}
      className="snap-start relative flex-shrink-0 w-14 h-10 sm:w-20 sm:h-14 
        overflow-hidden rounded-md sm:rounded-lg border-2 transition-all ..."
    >
```

### 🟠 HIGH: Fullscreen Gallery Touch Issues

**Problem:**
The fullscreen lightbox has poor touch handling:

```tsx
// File: components/PropertyGallery.tsx (Line ~180-220)
// Navigation buttons are positioned with fixed pixels that don't account for safe areas
<button className="absolute right-2 sm:right-20 top-1/2 ...">
```

**Issues:**
1. **Zoom button overlaps with navigation** on mobile
2. **No safe area insets** for notched devices
3. **Touch targets too small** for zoom controls (44px minimum not enforced)

**Fix Required:**
```tsx
{/* Zoom Controls - Move to safe area */}
<div className="absolute right-4 top-safe-top sm:right-4 sm:top-20 z-20 flex flex-col gap-2">
  <button
    onClick={handleZoom}
    className="w-12 h-12 flex items-center justify-center ..." // 48px touch target
  >
```

Add to globals.css:
```css
.top-safe-top {
  top: max(16px, env(safe-area-inset-top));
}
.bottom-safe-bottom {
  bottom: max(16px, env(safe-area-inset-bottom));
}
```

---

## 3. PROPERTY INFO LAYOUT

### 🟠 HIGH: Price and Stats Layout Breaks at 320px

**Problem:**
The key stats grid uses 4 columns that become unreadable:

```tsx
// File: app/sales/properties/[id]/page.tsx (Line ~250-280)
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 gap-y-3 sm:gap-4 ...">
```

**Issues:**
1. **4-column grid on mobile** creates cramped layout
2. **Stat labels truncated** ("Recep" abbreviation is unclear)
3. **No vertical spacing** between stat rows on mobile

**Current:**
```
[Bed 4] [Bath 2]  <-- Row 1
[Recep 2] [1,850] <-- Row 2, label truncated
```

**Fix Required:**
```tsx
{/* Better mobile layout */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-3 sm:py-4 
  border-y border-gray-200 mb-4 sm:mb-6">
  
  {/* Mobile: Stack in 2x2 grid with better labels */}
  <div className="flex items-center gap-2 sm:gap-3">
    <div className="w-8 h-8 sm:w-10 sm:h-10 ...">
      <Bed className="h-4 w-4 sm:h-5 sm:w-5 text-[#1DBFDD]" />
    </div>
    <div className="min-w-0">
      <span className="block font-bold text-gray-900 text-sm sm:text-base">
        {property.beds}
      </span>
      <span className="text-xs sm:text-sm text-gray-500">
        {property.beds === 1 ? 'Bedroom' : 'Bedrooms'}
      </span>
    </div>
  </div>
  
  {/* Use full words for mobile */}
  <div className="flex items-center gap-2 sm:gap-3">
    <div className="w-8 h-8 sm:w-10 sm:h-10 ...">
      <Home className="h-4 w-4 sm:h-5 sm:w-5 text-[#1DBFDD]" />
    </div>
    <div className="min-w-0">
      <span className="block font-bold text-gray-900 text-sm sm:text-base">
        {property.receptions}
      </span>
      <span className="text-xs sm:text-sm text-gray-500">
        {property.receptions === 1 ? 'Reception' : 'Receptions'}
      </span>
    </div>
  </div>
</div>
```

### 🟡 MEDIUM: SmartDescription Badges Overflow

**Problem:**
```tsx
// File: components/ai/SmartDescription.tsx (Line ~45-55)
<div className="flex flex-wrap gap-2">
  {highlights.map((highlight) => (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium 
      bg-gradient-to-r from-[#1a4d5c]/10 to-[#1a4d5c]/5 
      text-[#1a4d5c] px-2.5 py-1 rounded-full border border-[#1a4d5c]/20">
```

Long badge text like "Perfect for families" causes overflow.

**Fix Required:**
```tsx
<span className="inline-flex items-center gap-1.5 text-xs font-medium 
  bg-gradient-to-r from-[#1a4d5c]/10 to-[#1a4d5c]/5 
  text-[#1a4d5c] px-2.5 py-1 rounded-full border border-[#1a4d5c]/20
  max-w-full truncate">
  {iconMap[highlight]}
  <span className="truncate">{highlight}</span>
</span>
```

---

## 4. ACCORDION SECTIONS

### 🟡 MEDIUM: Accordion Animation Performance

**Problem:**
```tsx
// File: app/sales/properties/[id]/page.tsx (Line ~35-65)
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: "auto", opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.2 }}
  className="overflow-hidden"
>
```

**Issues:**
1. **Height animation with "auto"** causes layout thrashing on mobile
2. **No reduced motion support** for accessibility
3. **Content shift** during animation causes scroll position issues

**Fix Required:**
```tsx
{/* Use CSS Grid for better performance */}
<motion.div
  initial={{ gridTemplateRows: '0fr', opacity: 0 }}
  animate={{ gridTemplateRows: '1fr', opacity: 1 }}
  exit={{ gridTemplateRows: '0fr', opacity: 0 }}
  transition={{ 
    duration: 0.2,
    opacity: { duration: 0.15 }
  }}
  className="grid"
>
  <div className="overflow-hidden min-h-0">
    <div className="pb-5">{children}</div>
  </div>
</motion.div>
```

### 🔴 CRITICAL: EPC Visualizer Mobile Layout Collapse

**Problem:**
```tsx
// File: components/EPCVisualizer.tsx (Line ~115-140)
<div className="flex items-center justify-between mb-6">
  <div>
    <p className="text-sm text-gray-500 mb-1">...</p>
    <div className="flex items-baseline gap-2">
      <span className="text-5xl font-bold ...">{activeRating}</span>
```

**Issues:**
1. **5xl font size (48px)** for rating letter causes overflow on 320px screens
2. **Fixed width rating bars** don't scale
3. **Two-column grid for costs** breaks at narrow widths

**Fix Required:**
```tsx
<div className="flex flex-col sm:flex-row sm:items-center 
  justify-between mb-6 gap-4">
  <div>
    <p className="text-sm text-gray-500 mb-1">...</p>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl sm:text-5xl font-bold ...">
        {activeRating}
      </span>
      {/* ... */}
    </div>
  </div>
</div>

{/* Cost estimates - stack on mobile */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

---

## 5. AGENT CONTACT CARD

### 🔴 CRITICAL: Contact Card Position and Layout

**Problem:**
```tsx
// File: app/sales/properties/[id]/page.tsx (Line ~390-410)
<div className="lg:pl-6 order-first lg:order-last">
  <div className="lg:sticky lg:top-24 space-y-3 sm:space-y-4">
```

**Issues:**
1. **Card appears ABOVE content on mobile** (`order-first`) - users must scroll past entire form to see property
2. **No sticky behavior on mobile** - form disappears when scrolling
3. **Mobile sticky CTA duplicates functionality** causing confusion

**Current Flow (Mobile):**
1. User sees Agent Contact Form FIRST (before property images)
2. User scrolls down to see property
3. Sticky CTA appears at bottom with "Contact Agent" button
4. Two different ways to contact agent = confusing UX

**Fix Required:**

Option 1: **Hide contact card on mobile, rely on sticky CTA:**
```tsx
{/* Right Column - Hidden on mobile */}
<div className="hidden lg:block lg:pl-6 lg:order-last">
  <div className="lg:sticky lg:top-24 space-y-4">
    <ShareButtons ... />
    <AgentContactCard ... />
  </div>
</div>

{/* Add mobile-only simplified contact section at bottom */}
<div className="lg:hidden mt-8">
  <AgentContactCard variant="compact" />
</div>
```

Option 2: **Move contact card below property content:**
```tsx
{/* Remove order-first, let it flow naturally */}
<div className="lg:pl-6">
  <div className="lg:sticky lg:top-24 space-y-3 sm:space-y-4">
```

### 🟠 HIGH: Form Inputs Too Small on Mobile

**Problem:**
```tsx
// File: components/AgentContactCard.tsx (Line ~125)
<Input className="pl-10 h-11 sm:h-12 text-base" />
```

**Issues:**
1. **h-11 (44px)** is minimum touch target but cramped
2. **iOS zoom on input focus** when font-size < 16px (this uses `text-base` = 16px ✓)
3. **Icon + padding consumes too much horizontal space**

**Current State:** ✓ Font size correct (prevents zoom)
**Problem:** Input feels cramped with icon

**Fix Required:**
```tsx
{/* Increase height and adjust icon spacing */}
<div className="relative">
  <User className="absolute left-3 top-1/2 -translate-y-1/2 
    h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
  <Input
    name="name"
    value={formData.name}
    onChange={handleChange}
    placeholder="John Smith"
    required
    className="pl-10 pr-4 h-12 sm:h-14 text-base w-full rounded-lg
      border-gray-200 focus:border-[#1DBFDD] focus:ring-2 
      focus:ring-[#1DBFDD]/20 transition-all"
  />
</div>
```

### 🟡 MEDIUM: Tab Animation Jank on Mobile

**Problem:**
```tsx
// File: components/AgentContactCard.tsx (Line ~85-105)
<motion.div 
  layoutId="agent-tab"
  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1DBFDD]"
/>
```

Framer Motion's `layoutId` causes performance issues on lower-end mobile devices during tab switches.

**Fix Required:**
```tsx
{/* Use CSS transitions instead of layoutId on mobile */}
<button className="relative flex-1 py-3 text-sm font-medium ...">
  <MessageSquare className="h-4 w-4" />
  Message
  <div className={cn(
    "absolute bottom-0 left-0 right-0 h-0.5 bg-[#1DBFDD] transition-transform duration-200",
    activeTab === "contact" ? "scale-x-100" : "scale-x-0"
  )} />
</button>
```

---

## 6. LANDSCAPE ORIENTATION

### 🔴 CRITICAL: Gallery Aspect Ratio Breaks in Landscape

**Problem:**
```tsx
// File: components/PropertyGallery.tsx (Line ~70)
<div className="aspect-[4/3] relative">
```

On landscape mobile (iPhone landscape ~667px height), a 4:3 aspect ratio image takes up too much vertical space, pushing content below the fold.

**Current Behavior:**
- Portrait: Gallery looks good
- Landscape: Gallery is massive, user must scroll significantly to see property details

**Fix Required:**
```tsx
{/* Responsive aspect ratio */}
<div className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] relative">
```

Or use container queries for better control:
```tsx
<div className="relative @container">
  <div className="aspect-[4/3] @lg:aspect-[4/3] @md:aspect-[16/9]">
```

### 🟠 HIGH: Sticky CTA Covers Content in Landscape

**Problem:**
```tsx
// File: app/sales/properties/[id]/page.tsx (Line ~465-480)
<div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white 
  border-t border-gray-200 p-3 sm:p-4 z-40 safe-area-pb 
  shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
```

**Issues:**
1. **72px+ height** sticky bar covers ~15% of landscape viewport
2. **No collapse option** - always visible
3. **Content at bottom is unreachable** due to `pb-28` padding mismatch

**Fix Required:**
```tsx
{/* Collapsible sticky CTA for landscape */}
<div className={cn(
  "lg:hidden fixed left-0 right-0 bg-white border-t border-gray-200 
   z-40 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.1)] 
   transition-all duration-300",
  isLandscape ? "bottom-0 py-2" : "bottom-0 p-3 sm:p-4",
  isCollapsed && "translate-y-full"
)}>
```

Add landscape media query:
```css
@media (orientation: landscape) and (max-height: 500px) {
  .mobile-sticky-cta {
    @apply py-2;
  }
  
  .mobile-sticky-cta button {
    @apply h-10 text-sm;
  }
}
```

### 🟡 MEDIUM: Virtual Tour Modal Doesn't Adapt

**Problem:**
```tsx
// File: app/sales/properties/[id]/page.tsx (Line ~70-95)
<div className="h-[calc(100vh-72px)]">
  <iframe src={url} width="100%" height="100%" ... />
</div>
```

In landscape, the 72px header leaves plenty of space, but in portrait on small screens, this creates a letterboxed experience.

**Fix Required:**
```tsx
<div className="h-[calc(100dvh-72px)] landscape:h-[calc(100vh-72px)]">
  <iframe 
    src={url} 
    width="100%" 
    height="100%" 
    className="landscape:object-contain"
    ... 
  />
</div>
```

---

## 7. ADDITIONAL CRITICAL ISSUES

### 🔴 CRITICAL: TransportLinks Station Name Overflow

**Problem:**
```tsx
// File: components/TransportLinks.tsx (Line ~75-85)
<h4 className="font-semibold text-gray-900 truncate">
  {station.name}
</h4>
<span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
  {station.distance}
</span>
```

Long station names like "Heathrow Airport Terminals 2 & 3" with distance badges cause horizontal overflow.

**Fix Required:**
```tsx
<div className="flex items-center gap-2 mb-1 min-w-0">
  <h4 className="font-semibold text-gray-900 truncate flex-1">
    {station.name}
  </h4>
  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 
    rounded-full flex-shrink-0">
    {station.distance}
  </span>
</div>
```

### 🟠 HIGH: MatchScore Tooltip Off-Screen on Mobile

**Problem:**
```tsx
// File: components/ai/MatchScore.tsx (Line ~75-90)
<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
  w-48 opacity-0 group-hover:opacity-100 ...">
```

On mobile, this tooltip appears centered below the badge, but the badge is often near the left edge of the screen, causing the tooltip to overflow.

**Fix Required:**
```tsx
<div className="absolute top-full left-0 sm:left-1/2 mt-2 w-48 
  sm:-translate-x-1/2 opacity-0 group-hover:opacity-100 ...">
  <div className="left-4 sm:left-1/2 sm:-translate-x-1/2 ...">
```

### 🟠 HIGH: ShareButtons Modal Not Mobile-Optimized

**Problem:**
```tsx
// File: components/ShareButtons.tsx (Line ~110-125)
<motion.div
  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
    w-full max-w-md bg-white rounded-xl shadow-2xl z-[101] p-6"
>
```

**Issues:**
1. **Fixed positioning** doesn't account for mobile keyboard
2. **No bottom sheet pattern** - should slide up from bottom on mobile
3. **Touch targets in grid** may be too close together

**Fix Required:**
```tsx
{/* Use bottom sheet pattern on mobile */}
<motion.div
  initial={{ opacity: 0, y: '100%' }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: '100%' }}
  className="fixed inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 
    sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md 
    bg-white rounded-t-2xl sm:rounded-xl shadow-2xl z-[101] 
    max-h-[90vh] overflow-y-auto"
>
  {/* Pull indicator for mobile */}
  <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4 
    sm:hidden" />
  
  {/* Content */}
  <div className="p-6 pt-2 sm:pt-6">
    {/* ... */}
  </div>
</motion.div>
```

---

## SUMMARY OF REQUIRED FIXES

### Priority 1 - CRITICAL (Fix Immediately)

| Issue | File | Lines | Impact |
|-------|------|-------|--------|
| FloorplanViewer fixed height | `FloorplanViewer.tsx` | ~140 | Horizontal overflow |
| AgentContactCard order | `page.tsx` | ~390 | Wrong content order |
| Gallery thumbnail overflow | `PropertyGallery.tsx` | ~95 | Horizontal scroll |
| TransportLinks name overflow | `TransportLinks.tsx` | ~75 | Layout breakage |
| EPC visualizer font size | `EPCVisualizer.tsx` | ~125 | Content overflow |

### Priority 2 - HIGH (Fix This Week)

| Issue | File | Lines | Impact |
|-------|------|-------|--------|
| Gallery tab scroll snap | `page.tsx` | ~110 | UX friction |
| Stats grid 2x2 layout | `page.tsx` | ~250 | Cramped UI |
| Sticky CTA landscape | `page.tsx` | ~465 | Content hidden |
| Form input sizing | `AgentContactCard.tsx` | ~125 | Cramped inputs |
| Share modal bottom sheet | `ShareButtons.tsx` | ~110 | Mobile UX |

### Priority 3 - MEDIUM (Fix When Possible)

| Issue | File | Lines | Impact |
|-------|------|-------|--------|
| Accordion animation | `page.tsx` | ~35 | Performance |
| Tab animation jank | `AgentContactCard.tsx` | ~85 | Animation perf |
| MatchScore tooltip | `MatchScore.tsx` | ~75 | Minor UX |
| Gallery landscape ratio | `PropertyGallery.tsx` | ~70 | Viewport usage |

---

## RECOMMENDED TESTING APPROACH

### Devices to Test
1. **iPhone SE (375×667)** - Smallest iOS
2. **iPhone 12 Mini (360×780)** - Small modern iOS
3. **iPhone 14 Pro (393×852)** - Standard iOS
4. **Samsung Galaxy S8 (360×740)** - Small Android
5. **Pixel 5 (393×851)** - Standard Android
6. **All devices in landscape orientation**

### Browser DevTools Settings
```
- Device Toolbar: Responsive
- Dimensions: 320×568, 375×667, 414×896
- Throttling: Mid-tier mobile
- Touch: Force touch enabled
```

### Test Checklist
- [ ] No horizontal scroll on any device width ≥320px
- [ ] All touch targets ≥44×44px
- [ ] Gallery swipe works smoothly
- [ ] Accordion expand/collapse without layout shift
- [ ] Form inputs don't cause zoom on iOS
- [ ] Sticky CTA doesn't cover content
- [ ] Landscape mode usable without excessive scrolling

---

## BEFORE/AFTER COMPARISON

### Before (Current State)
```
┌─────────────────────────┐ 320px
│  Agent Form (TOO BIG)   │ ← Wrong order!
│  Contact Agent CTA      │
├─────────────────────────┤
│  [Photos][Tour][Map]    │ ← No scroll snap
│  ┌─────────────────┐    │
│  │   Gallery       │    │ ← 4:3 too tall
│  └─────────────────┘    │
│  ○ ○ ○ ○ ○ (thumbs)     │ ← Overflow hidden
├─────────────────────────┤
│  Price: £1,250,000      │
│  [4Bed][2Bath][Re][Sq]  │ ← Cramped 4-col
├─────────────────────────┤
│  Description ▼          │
│  [content...]           │
├─────────────────────────┤
│  EPC Rating:      [A]   │ ← 48px text!
├─────────────────────────┤
│ ═══════════════════════ │
│ [Save] [Contact Agent]  │ ← Sticky covers
│ ═══════════════════════ │
└─────────────────────────┘
```

### After (Recommended State)
```
┌─────────────────────────┐ 320px
│  ┌─────────────────┐    │
│  │   Gallery       │    │ ← 16:9 landscape
│  └─────────────────┘    │
│  ○ ○ ○ ○ ○ (snap)       │ ← Scroll visible
│  [Photos][Tour][Map]►   │ ← Fade indicator
├─────────────────────────┤
│  Price: £1,250,000      │
│  [4Bed][2Bath]          │ ← 2x2 grid
│  [2Rec][1,850sqft]      │
├─────────────────────────┤
│  Description ▼          │
│  [content...]           │
├─────────────────────────┤
│  EPC Rating: [A]        │ ← 36px text
├─────────────────────────┤
│  Contact Agent ▼        │ ← Collapsed form
├─────────────────────────┤
│ ═══════════════════════ │
│ [Save] [📞 Contact]     │ ← Sticky, compact
│ ═══════════════════════ │
└─────────────────────────┘
```

---

*Analysis complete. Priority fixes identified and documented with exact code locations and solutions.*
