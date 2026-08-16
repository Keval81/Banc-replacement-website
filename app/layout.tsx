import type { Metadata, Viewport } from "next";
import { Source_Serif_4, DM_Sans } from "next/font/google";
import "./globals.css";
import { CookieProvider } from "@/hooks/useCookies";
import { ComparisonProvider } from "@/app/hooks/usePropertyComparison";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { SiteOverlays } from "@/components/mobile/SiteOverlays";
import { AuthProvider } from "@/components/AuthProvider";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Script from "next/script";
import LiveReviewFeed from "@/components/social/LiveReviewFeed";
// SoldBanner moved to homepage as a section

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

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
  themeColor: "#F4F3F1",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${sourceSerif4.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider
          defaultTheme="system"
          enableSystem
          attribute="class"
          disableTransitionOnChange={false}
        >
          <ToastProvider position="bottom-center">
            <CookieProvider>
              <ComparisonProvider>
                {/* Skip to content link for accessibility */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1000] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
                >
                  Skip to main content
                </a>
                
                <AuthProvider>
                  <main id="main-content" className="min-h-screen">
                    {children}
                  </main>
                </AuthProvider>
                
                <SiteOverlays />
                
                {/* Social Proof Elements */}
                <LiveReviewFeed />
                
                <CookieConsent />
                <GoogleAnalytics />
              </ComparisonProvider>
            </CookieProvider>
          </ToastProvider>
        </ThemeProvider>
        
        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('Service Worker registered: ', registration.scope);
                  },
                  function(err) {
                    console.log('Service Worker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
