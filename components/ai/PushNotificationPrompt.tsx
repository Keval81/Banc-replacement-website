'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  requestNotificationPermission,
  getNotificationPermission,
  subscribeToPushNotifications,
  areNotificationsSupported,
} from '@/lib/ai/notifications';

export default function PushNotificationPrompt() {
  const [isSupported] = useState(() => areNotificationsSupported());
  const [permission, setPermission] = useState<NotificationPermission | null>(() =>
    getNotificationPermission()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("notificationPromptDismissed") === "true"
  );

  useEffect(() => {
    if (!isSupported || permission !== "default" || isDismissed) return;

    const timer = setTimeout(() => setShowPrompt(true), 30_000);
    return () => clearTimeout(timer);
  }, [isDismissed, isSupported, permission]);

  const handleEnable = async () => {
    setIsLoading(true);
    
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');

    if (granted) {
      await subscribeToPushNotifications();
      setShowPrompt(false);
    }

    setIsLoading(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    // Store dismissal in localStorage
    localStorage.setItem('notificationPromptDismissed', 'true');
  };

  if (!isSupported || permission === 'denied' || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-[calc(1rem+env(safe-area-inset-left))] right-[calc(1rem+env(safe-area-inset-right))] z-50 md:left-auto md:right-[calc(1rem+env(safe-area-inset-right))] md:w-96"
        >
          <div className="bg-white rounded-xl shadow-2xl border p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-banc-teal/10 rounded-full flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-banc-teal" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-banc-dark">
                  Stay Updated on New Properties
                </h3>
                <p className="text-sm text-banc-muted-readable mt-1">
                  Get instant notifications when new properties matching your criteria are listed.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleEnable}
                    disabled={isLoading}
                    className="bg-banc-teal hover:bg-banc-teal/90"
                  >
                    {isLoading ? (
                      <span className="animate-pulse">Enabling...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Enable
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Not now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toggle button for notification settings
export function NotificationToggle() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (areNotificationsSupported()) {
        const permission = getNotificationPermission();
        setIsEnabled(permission === 'granted');
      }
    };
    checkStatus();
  }, []);

  const toggle = async () => {
    setIsLoading(true);

    if (isEnabled) {
      // Unsubscribe
      const { unsubscribeFromPushNotifications } = await import('@/lib/ai/notifications');
      await unsubscribeFromPushNotifications();
      setIsEnabled(false);
    } else {
      // Subscribe
      const granted = await requestNotificationPermission();
      if (granted) {
        await subscribeToPushNotifications();
        setIsEnabled(true);
      }
    }

    setIsLoading(false);
  };

  if (!areNotificationsSupported()) {
    return null;
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isEnabled
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-banc-grey-pale text-banc-muted-readable hover:bg-banc-grey/20'
      }`}
    >
      {isEnabled ? (
        <Bell className="w-4 h-4" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isEnabled ? 'Notifications On' : 'Notifications Off'}
      </span>
    </button>
  );
}
