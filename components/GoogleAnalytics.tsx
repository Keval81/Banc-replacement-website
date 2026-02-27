"use client";

import Script from "next/script";
import { useAnalytics } from "@/hooks/useCookies";

export default function GoogleAnalytics() {
  const { isAllowed } = useAnalytics();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // Don't render if analytics not allowed or no GA ID
  if (!isAllowed || !gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}
