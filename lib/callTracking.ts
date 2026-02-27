// Click-to-call tracking utilities

interface CallTrackingEvent {
  page: string;
  timestamp: string;
  element: string;
  propertyRef?: string;
}

const STORAGE_KEY = "banc_call_tracking";

/**
 * Track a click-to-call event
 */
export function trackCallClick(element: string, propertyRef?: string): void {
  if (typeof window === "undefined") return;

  const event: CallTrackingEvent = {
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
    element,
    propertyRef,
  };

  // Store locally
  const existing = getCallTrackingData();
  existing.push(event);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(-50))); // Keep last 50

  // Send to analytics if available
  if ((window as any).gtag) {
    (window as any).gtag("event", "click_to_call", {
      event_category: "engagement",
      event_label: element,
      property_ref: propertyRef,
      page_path: event.page,
    });
  }

  // Log for debugging
  console.log("Call tracked:", event);
}

/**
 * Get all call tracking data
 */
export function getCallTrackingData(): CallTrackingEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Get call statistics
 */
export function getCallStats(): {
  total: number;
  byPage: Record<string, number>;
  byElement: Record<string, number>;
  last7Days: number;
} {
  const data = getCallTrackingData();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const byPage: Record<string, number> = {};
  const byElement: Record<string, number> = {};
  let last7Days = 0;

  data.forEach((event) => {
    // By page
    byPage[event.page] = (byPage[event.page] || 0) + 1;

    // By element
    byElement[event.element] = (byElement[event.element] || 0) + 1;

    // Last 7 days
    if (new Date(event.timestamp) > sevenDaysAgo) {
      last7Days++;
    }
  });

  return {
    total: data.length,
    byPage,
    byElement,
    last7Days,
  };
}

/**
 * Clear call tracking data
 */
export function clearCallTrackingData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Generate tel: link with tracking
 */
export function getTelLink(phoneNumber: string): string {
  return `tel:${phoneNumber.replace(/\s/g, "")}`;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Format UK numbers
  if (phone.startsWith("44")) {
    const num = phone.slice(2);
    if (num.length === 10 && num.startsWith("1")) {
      return `+44 ${num.slice(0, 2)} ${num.slice(2, 6)} ${num.slice(6)}`;
    }
  }
  return phone;
}
