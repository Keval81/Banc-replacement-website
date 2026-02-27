// Notification service for browser push notifications
// This uses the Web Push API with a service worker

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// Check if notifications are supported
export function areNotificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

// Request permission to show notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (!areNotificationsSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission | null {
  if (!areNotificationsSupported()) {
    return null;
  }
  return Notification.permission;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!areNotificationsSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        console.error('VAPID public key not configured');
        return null;
      }

      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    }

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!areNotificationsSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      
      // Notify server
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    }

    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

// Show a local notification
export async function showNotification(payload: NotificationPayload): Promise<boolean> {
  if (!areNotificationsSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge-72x72.png',
      tag: payload.tag,
      data: payload.data,
      requireInteraction: false,
    };
    
    // Add actions if supported
    if (payload.actions && payload.actions.length > 0) {
      (options as any).actions = payload.actions;
    }
    
    await registration.showNotification(payload.title, options);
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
}

// Helper to convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Notification types for property alerts
export const notificationTypes = {
  NEW_PROPERTY: {
    title: 'New Property Alert',
    icon: '/icon-192x192.png',
  },
  PRICE_DROP: {
    title: 'Price Drop Alert',
    icon: '/icon-192x192.png',
  },
  VIEWING_REMINDER: {
    title: 'Viewing Reminder',
    icon: '/icon-192x192.png',
  },
  OFFER_UPDATE: {
    title: 'Offer Update',
    icon: '/icon-192x192.png',
  },
  MESSAGE: {
    title: 'New Message',
    icon: '/icon-192x192.png',
  },
} as const;

// Send a property notification
export async function sendPropertyNotification(
  type: keyof typeof notificationTypes,
  propertyTitle: string,
  details: string,
  propertyId?: string
): Promise<boolean> {
  const config = notificationTypes[type];
  
  return showNotification({
    title: config.title,
    body: `${propertyTitle}: ${details}`,
    icon: config.icon,
    tag: type,
    data: { propertyId, type },
    actions: [
      {
        action: 'view',
        title: 'View Property',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  });
}