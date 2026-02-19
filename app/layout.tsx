import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Banc Property Services | Premium Estate Agency",
  description: "Exceptional properties and bespoke estate agency services in Cuffley, Mayfair, and beyond. Banc Property Group - Excellence, Integrity, Innovation.",
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
  themeColor: "#2C2F33",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Open+Sans:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
