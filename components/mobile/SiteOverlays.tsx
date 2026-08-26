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
  const contactControlsAboveBrand =
    overlayPolicy.mobileContactControlPlacement === "above-brand-lockup";

  return (
    <>
      {overlayPolicy.showMobileBottomNavigation && <MobileBottomNav />}
      <FloatingWhatsApp
        position="bottom-left"
        className={
          contactControlsAboveBrand ? "bottom-40" : undefined
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
