import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = withPageDefaults("/contact", {
  title: "Contact Us | Cuffley Estate Agents | Banc Property Group",
  description: "Contact Banc Property Group's Cuffley office. Visit us at 1 Station Road, Cuffley EN6 4HU, call 01707 877781, or request a call back.",
});

export const revalidate = 3600;

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale text-banc-dark-deep">
      <Header />
      <ContactPageClient />
      <Footer />
    </div>
  );
}
