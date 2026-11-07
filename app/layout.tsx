import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CookieProvider } from "@/hooks/useCookies";
import { ComparisonProvider } from "@/app/hooks/usePropertyComparison";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { SiteOverlays } from "@/components/mobile/SiteOverlays";
import { AuthProvider } from "@/components/AuthProvider";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Script from "next/script";
// SoldBanner moved to homepage as a section

// Fonts are self-hosted from public/fonts and declared by their real family names in
// globals.css, which the stylesheets already use. next/font/google failed about 1 build
// in 3 here and on Vercel ("queries have exactly one entry", 7 Nov 2026).
const PRELOAD_FONTS = ["/fonts/dm-sans.woff2", "/fonts/playfair-display.woff2", "/fonts/source-serif-4.woff2"];

export const metadata: Metadata = {
  title: "Banc Property Services | Premium Estate Agency",
  description: "Exceptional properties and bespoke estate agency services in Cuffley, Mayfair, and beyond. Banc Property Group - Excellence, Integrity, Innovation.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Banc Property",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
  },
  openGraph: {
    title: "Banc Property Group",
    description: "Exceptional properties and bespoke estate agency services in Cuffley, Mayfair, and beyond.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#1A1917",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <head>
        {PRELOAD_FONTS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-banc-dark-deep focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <MotionProvider>
          <ThemeProvider
            defaultTheme="system"
            enableSystem
            attribute="class"
            disableTransitionOnChange={false}
          >
            <ToastProvider position="bottom-center">
              <CookieProvider>
                <ComparisonProvider>
                  <AuthProvider>
                    {/* Pages render their own <main>; keep this a plain div to avoid nested landmarks. */}
                    <div id="main-content" className="min-h-screen">
                      {children}
                    </div>
                  </AuthProvider>

                  <SiteOverlays />

                  {/* LiveReviewFeed removed: the rotating review strip sat
                      under every page and read as a ticker rather than
                      social proof. Reviews live on /reviews and in the
                      homepage hero card. */}

                  <CookieConsent />
                  <GoogleAnalytics />
                  <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
                </ComparisonProvider>
              </CookieProvider>
            </ToastProvider>
          </ThemeProvider>
        </MotionProvider>

        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                try {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                } catch (e) {}
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
