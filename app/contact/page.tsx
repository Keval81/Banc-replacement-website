import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Us | Cuffley Estate Agents | Banc Property Group",
  description: "Contact Banc Property Group's Cuffley office. Visit us at 1 Station Road, Cuffley EN6 4HU, call 01707 877781, or request a call back.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F0F0ED] text-[#2C2F33]">
      <Header />
      <ContactPageClient />
      <Footer />
    </div>
  );
}
