# AI & Automation Features

This directory contains all AI-powered features and automation for the Banc Property website.

## Features Implemented

### 1. AI Property Matching (`/lib/ai/matching.ts`)
Intelligent recommendation engine that calculates match scores based on:
- Price (weight: 0.25)
- Location (weight: 0.25)
- Bedrooms (weight: 0.20)
- Property Type (weight: 0.15)
- Features (weight: 0.15)

**Components:**
- `MatchScore.tsx` - Visual match percentage badge
- `RecommendedProperties.tsx` - "Recommended for you" section
- `useRecommendations.ts` - Hook for fetching recommendations

**API:** `/api/matches/recommended`

### 2. Property Search Chatbot (`components/ai/PropertyChatbot.tsx`)
Conversational property finder with:
- Natural language processing
- Property search via chat
- Viewing scheduling
- Valuation requests
- FAQ answers

**API:** `/api/chat`

**Features:**
- Floating chat widget
- Quick reply suggestions
- Property cards in chat
- Fallback to local responses if OpenAI unavailable

### 3. Newsletter System
Email subscription functionality:

**Pages:**
- `/newsletter/signup` - Subscribe page with preferences
- `/newsletter/unsubscribe` - Unsubscribe page

**API:** `/api/newsletter`

**Features:**
- Preference management (new properties, market updates, price drops, blog posts)
- Mailchimp integration (optional)
- Footer signup widget

### 4. Social Proof Elements

**LiveReviewFeed.tsx**
- Animated recent reviews ticker
- Updates every 5 seconds
- Shows live indicator

**SoldBanner.tsx**
- "Just Sold" notifications
- Appears after 10 seconds
- Shows sale price vs asking price

**ViewingCounter.tsx**
- "X people viewing today" indicator
- Creates urgency
- Fluctuates randomly for realism

### 5. Smart Property Descriptions (`SmartDescription.tsx`)
AI-generated property highlights:
- "Perfect for families" detection
- "Great for commuters" detection
- "Luxury living" detection
- "Ideal for first-time buyers" detection

### 6. Automated Valuation Model (AVM) (`components/ai/AVMValuation.tsx`)
Property price estimation based on:
- Recent comparable sales
- Property characteristics
- Market trends
- Condition factors

**API:** `/api/valuation/avm`

**Features:**
- Instant estimate
- Confidence score
- Price range (low/high)
- Comparable sales
- Market trend indicators
- Positive/negative factors

### 7. Smart Notifications (`lib/ai/notifications.ts`)
Browser push notifications for:
- New properties matching criteria
- Viewing reminders
- Offer updates
- Message alerts

**API:** `/api/notifications`

**Components:**
- `PushNotificationPrompt.tsx` - Permission request UI

## Environment Variables

```env
# OpenAI (for Chatbot)
OPENAI_API_KEY=sk-...

# Mailchimp (for Newsletter)
MAILCHIMP_API_KEY=...
MAILCHIMP_LIST_ID=...

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

## Usage Examples

### AI Property Matching
```tsx
import RecommendedProperties from '@/components/ai/RecommendedProperties';

<RecommendedProperties 
  location="Cuffley"
  minPrice={500000}
  maxPrice={1000000}
  bedrooms={4}
  limit={3}
/>
```

### Chatbot
Already included in layout.tsx, appears as floating button.

### AVM Valuation
```tsx
import AVMValuation from '@/components/ai/AVMValuation';

<AVMValuation />
```

### Match Score on Property Card
```tsx
import MatchScore from '@/components/ai/MatchScore';

<MatchScore 
  score={92} 
  reasons={['Within your price range', '4 bedrooms']}
/>
```

## File Structure

```
lib/ai/
  matching.ts         # Matching algorithm
  chat.ts             # Chat utilities & prompts
  notifications.ts    # Push notification service

components/ai/
  PropertyChatbot.tsx
  MatchScore.tsx
  RecommendedProperties.tsx
  SmartDescription.tsx
  AVMValuation.tsx
  PushNotificationPrompt.tsx
  index.ts

components/social/
  LiveReviewFeed.tsx
  SoldBanner.tsx
  ViewingCounter.tsx
  index.ts

hooks/
  useRecommendations.ts
  useChatbot.ts

app/api/
  matches/recommended/route.ts
  chat/route.ts
  newsletter/route.ts
  valuation/avm/route.ts
  notifications/route.ts

app/newsletter/
  signup/page.tsx
  unsubscribe/page.tsx
```

## Notes

- All AI features have fallbacks if APIs are unavailable
- OpenAI integration is optional - chatbot works without it
- Mock data is used for demonstration purposes
- In production, connect to real property database
