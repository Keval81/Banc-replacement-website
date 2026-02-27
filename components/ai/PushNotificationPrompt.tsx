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
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check support and permission on mount
    const supported = areNotificationsSupported();
    setIsSupported(supported);

    if (supported) {
      const currentPermission = getNotificationPermission();
      setPermission(currentPermission);

      // Show prompt after 30 seconds if not decided
      if (currentPermission === 'default' && !isDismissed) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 30000);
        return () => clearTimeout(timer);
      }
    }
  }, [isDismissed]);

  const handleEnable = async () => {
    setIsLoading(true);
    
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');

    if (granted) {
      const subscription = await subscribeToPushNotifications();
      setIsSubscribed(!!subscription);
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

  // Check if previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('notificationPromptDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setShowPrompt(false);
    }
  }, []);

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
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-white rounded-xl shadow-2xl border p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#1a4d5c]/10 rounded-full flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-[#1a4d5c]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Stay Updated on New Properties
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Get instant notifications when new properties matching your criteria are listed.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleEnable}
                    disabled={isLoading}
                    className="bg-[#1a4d5c] hover:bg-[#1a4d5c]/90"
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
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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