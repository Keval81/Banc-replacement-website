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
  const usesRightActionRail =
    overlayPolicy.mobileContactControlPlacement === "right-action-rail";

  return (
    <>
      {overlayPolicy.showMobileBottomNavigation && <MobileBottomNav />}
      <FloatingWhatsApp
        position={usesRightActionRail ? "bottom-right" : "bottom-left"}
        className={
          usesRightActionRail
            ? "bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:left-[calc(1.5rem+env(safe-area-inset-left))] sm:right-auto"
            : undefined
        }
      />
      <PropertyChatbot
        mobileContactControlPlacement={
          overlayPolicy.mobileContactControlPlacement
        }
        showProactivePrompt={overlayPolicy.showProactiveChatPrompt}
      />
      <PushNotificationPrompt />
    </>
  );
}
