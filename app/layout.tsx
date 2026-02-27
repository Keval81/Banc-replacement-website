import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CookieProvider } from "@/hooks/useCookies";
import { ComparisonProvider } from "@/app/hooks/usePropertyComparison";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { MobileBottomNav } from "@/components/mobile/MobileNav";
import { FloatingWhatsApp } from "@/components/mobile/FloatingWhatsApp";
import { AuthProvider } from "@/components/AuthProvider";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Script from "next/script";
import PropertyChatbot from "@/components/ai/PropertyChatbot";
import PushNotificationPrompt from "@/components/ai/PushNotificationPrompt";
import LiveReviewFeed from "@/components/social/LiveReviewFeed";
import SoldBanner from "@/components/social/SoldBanner";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0F0ED" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F0F" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Open+Sans:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
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
                
                {/* Mobile navigation */}
                <MobileBottomNav />
                
                {/* Floating WhatsApp button - positioned bottom-left on mobile to avoid chatbot overlap */}
                <FloatingWhatsApp position="bottom-left" />
                
                {/* AI Chatbot */}
                <PropertyChatbot />
                
                {/* Push Notifications */}
                <PushNotificationPrompt />
                
                {/* Social Proof Elements */}
                <LiveReviewFeed />
                <SoldBanner />
                
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
