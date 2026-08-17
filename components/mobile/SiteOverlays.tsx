"use client";

import { usePathname } from "next/navigation";
import PropertyChatbot from "@/components/ai/PropertyChatbot";
import PushNotificationPrompt from "@/components/ai/PushNotificationPrompt";
import { FloatingWhatsApp } from "@/components/mobile/FloatingWhatsApp";
import { MobileBottomNav } from "@/components/mobile/MobileNav";
import { isPropertyDetailPath } from "@/lib/property-detail-view";

export function SiteOverlays(): React.ReactElement | null {
  const pathname = usePathname();
  if (isPropertyDetailPath(pathname)) return null;

  return (
    <>
      <MobileBottomNav />
      <FloatingWhatsApp position="bottom-left" />
      <PropertyChatbot />
      <PushNotificationPrompt />
    </>
  );
}
