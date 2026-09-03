"use client";

import { usePathname } from "next/navigation";
import PropertyChatbot from "@/components/ai/PropertyChatbot";
import PushNotificationPrompt from "@/components/ai/PushNotificationPrompt";
import { FloatingWhatsApp } from "@/components/mobile/FloatingWhatsApp";
import { MobileBottomNav } from "@/components/mobile/MobileNav";
import { getLandingOverlayPolicy } from "@/lib/landing-ui";

export function SiteOverlays(): React.ReactElement | null {
  const pathname = usePathname();
  // Which overlays a route gets is the policy's call, including on property
  // pages — the assistant has to survive a visitor following a listing link.
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
        launcherClearance={overlayPolicy.chatLauncherClearance}
      />
      {overlayPolicy.showPushNotificationPrompt && <PushNotificationPrompt />}
    </>
  );
}
