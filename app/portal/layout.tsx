import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal | Banc Property Group",
  description: "Access your vendor, buyer, or landlord portal to manage your property journey with Banc Property Group.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F0F0ED]">
      {children}
    </div>
  );
}
