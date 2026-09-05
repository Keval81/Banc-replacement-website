import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Playfair_Display, DM_Sans } from "next/font/google";
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

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

// The brand guide specifies Playfair Display for display type. It is scoped to
// h1 and the font-display utility only: its thick/thin contrast is the whole
// point at 72px and a liability at 19px, where Source Serif 4 still serves.
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
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
    <html lang="en-GB" className={`${sourceSerif4.variable} ${playfairDisplay.variable} ${dmSans.variable}`}>
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
