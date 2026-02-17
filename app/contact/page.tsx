import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Banc Property Services",
  description: "Get in touch with Banc Property Group. Visit our offices in Cuffley and Mayfair, or contact us by phone, email, or arrange a valuation.",
};

export default function ContactPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Get in Touch</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Contact Us
            </h1>
            <p className="mt-6 text-lg text-white/70">
              We would love to hear from you. Visit our offices, give us a call, 
              or send us a message.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Cuffley Office */}
            <div className="rounded-2xl border border-[#E5E7EB] p-8">
              <h2 className="text-2xl font-semibold">Cuffley Office</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-[#1DBFDD] mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Banc Property Group</p>
                    <p className="text-[#6B7280]">14 Mayfair Place</p>
                    <p className="text-[#6B7280]">London W1</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-[#1DBFDD] mr-3" />
                  <p className="text-[#6B7280]">020 1234 5678</p>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-[#1DBFDD] mr-3" />
                  <p className="text-[#6B7280]">cuffley@bancproperty.co.uk</p>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-[#1DBFDD] mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Opening Hours</p>
                    <p className="text-[#6B7280]">Monday - Friday: 9am - 6pm</p>
                    <p className="text-[#6B7280]">Saturday: 9am - 4pm</p>
                    <p className="text-[#6B7280]">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mayfair Office */}
            <div className="rounded-2xl border border-[#E5E7EB] p-8">
              <h2 className="text-2xl font-semibold">Mayfair Office</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-[#1DBFDD] mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Banc Property Group</p>
                    <p className="text-[#6B7280]">14 Mayfair Place</p>
                    <p className="text-[#6B7280]">London W1</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-[#1DBFDD] mr-3" />
                  <p className="text-[#6B7280]">020 8765 4321</p>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-[#1DBFDD] mr-3" />
                  <p className="text-[#6B7280]">mayfair@bancproperty.co.uk</p>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-[#1DBFDD] mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Opening Hours</p>
                    <p className="text-[#6B7280]">Monday - Friday: 9am - 6pm</p>
                    <p className="text-[#6B7280]">Saturday: By appointment</p>
                    <p className="text-[#6B7280]">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Send a Message</p>
            <h2 className="mt-4 text-3xl font-semibold">Get in Touch</h2>
            <p className="mt-4 text-[#6B7280]">
              Fill out the form below and we will get back to you within 24 hours.
            </p>
          </div>

          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input type="text" className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 focus:border-[#1DBFDD] focus:outline-none" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input type="text" className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 focus:border-[#1DBFDD] focus:outline-none" placeholder="Smith" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 focus:border-[#1DBFDD] focus:outline-none" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input type="tel" className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 focus:border-[#1DBFDD] focus:outline-none" placeholder="020 1234 5678" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea rows={5} className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 focus:border-[#1DBFDD] focus:outline-none" placeholder="How can we help you?"></textarea>
            </div>
            <Button className="w-full bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white py-6 text-base">
              Send Message
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
