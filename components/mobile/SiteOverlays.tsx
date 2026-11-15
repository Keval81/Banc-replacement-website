"use client";

import { usePathname } from "next/navigation";
import PropertyChatbot from "@/components/ai/PropertyChatbot";
import PushNotificationPrompt from "@/components/ai/PushNotificationPrompt";
import { FloatingWhatsApp } from "@/components/mobile/FloatingWhatsApp";
import { getLandingOverlayPolicy } from "@/lib/landing-ui";
import { BANC_WHATSAPP_NUMBER } from "@/lib/banc-contact";

export function SiteOverlays(): React.ReactElement | null {
  const pathname = usePathname();
  // Which overlays a route gets is the policy's call, including on property
  // pages — the assistant has to survive a visitor following a listing link.
  const overlayPolicy = getLandingOverlayPolicy(pathname);

  return (
    <>
      {overlayPolicy.showStandaloneWhatsapp && BANC_WHATSAPP_NUMBER && (
        <FloatingWhatsApp
          phoneNumber={BANC_WHATSAPP_NUMBER}
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
