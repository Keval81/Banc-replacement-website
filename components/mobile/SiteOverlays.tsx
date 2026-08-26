"use client";

import { usePathname } from "next/navigation";
import PropertyChatbot from "@/components/ai/PropertyChatbot";
import PushNotificationPrompt from "@/components/ai/PushNotificationPrompt";
import { FloatingWhatsApp } from "@/components/mobile/FloatingWhatsApp";
import { MobileBottomNav } from "@/components/mobile/MobileNav";
import { getLandingOverlayPolicy } from "@/lib/landing-ui";
import { isPropertyDetailPath } from "@/lib/property-detail-view";

export function SiteOverlays(): React.ReactElement | null {
  const pathname = usePathname();
  if (isPropertyDetailPath(pathname)) return null;

  const overlayPolicy = getLandingOverlayPolicy(pathname);

  return (
    <>
      {overlayPolicy.showMobileBottomNavigation && <MobileBottomNav />}
      {overlayPolicy.showStandaloneWhatsapp && (
        <FloatingWhatsApp
          position="bottom-left"
          panelPlacement={overlayPolicy.mobileWhatsappPanelPlacement}
        />
      )}
      <PropertyChatbot
        mobileContactControlPlacement={
          overlayPolicy.mobileContactControlPlacement
        }
        showProactivePrompt={overlayPolicy.showProactiveChatPrompt}
      />
      {overlayPolicy.showPushNotificationPrompt && <PushNotificationPrompt />}
    </>
  );
}
