"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Phone, Mail, Clock, Quote, Send, CheckCircle, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/select";
import { useToast } from "@/components/ui/Toast";
import { trackCallClick } from "@/lib/callTracking";

const testimonials = [
  {
    text: "Andrew, Nitesh and Vicky sold my house quickly and efficiently. Very professional friendly team supported me through the process. I am a happy, satisfied customer and can highly recommend Banc estate agents.",
    author: "Iwona K.",
  },
  {
    text: "Highly recommend Banc. Nitesh, Andrew and Vicki were extremely helpful and responsive throughout. The sale of our property was managed very professionally and we were delighted with the overall service.",
    author: "H M.",
  },
  {
    text: "We have just sold our house through Banc Property Group and it was such a positive experience. I cannot speak highly enough of Andrew who couldn't have been more helpful. We achieved the asking price very quickly. If I am selling again I would go straight to Banc. Thank you to the whole team",
    author: "Dawn P.",
  },
];

const contactDetails = [
  {
    icon: MapPin,
    label: "Address",
    lines: ["1 Station Road", "Cuffley", "EN6 4HU"],
    href: null,
  },
  {
    icon: Phone,
    label: "Phone",
    lines: ["01707 877781"],
    href: "tel:01707877781",
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["info@bancproperty.com"],
    href: "mailto:info@bancproperty.com",
  },
  {
    icon: Clock,
    label: "Opening Hours",
    lines: ["Monday to Saturday: 9am to 6pm", "Sunday: Closed"],
    href: null,
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.1 },
  },
  viewport: { once: true, margin: "-100px" },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.5 },
};

export default function ContactPageClient() {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Enquiry",
    message: "I would like to request a call back",
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        success("Thank you! Your message has been sent successfully.");
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "General Enquiry",
          message: "I would like to request a call back",
          consent: false,
        });
      } else {
        error(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1A1917] py-28 lg:py-36">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917]/80 via-[#1A1917]/60 to-[#1A1917]/40" />
        </div>
        {/* Background gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A9BBF]/30 via-transparent to-transparent" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#4AC8E8 1px, transparent 1px), linear-gradient(90deg, #4AC8E8 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div 
            className="max-w-3xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.p 
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-[#4AC8E8]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="h-px w-8 bg-[#4AC8E8]" />
              Get in Touch
            </motion.p>
            
            <motion.h1 
              className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Cuffley Estate Agents
            </motion.h1>
            
            <motion.p 
              className="mt-8 max-w-xl text-lg leading-relaxed text-white/60"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Your local property experts in Cuffley. Visit our office, give us a call, 
              or request a callback — we&apos;re here to help with all your property needs.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info & Map Section */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Contact Card */}
            <motion.div
              className="relative overflow-hidden rounded-3xl bg-white p-10 shadow-xl shadow-[#1A1917]/5 lg:p-12"
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={fadeInUp.viewport}
              transition={fadeInUp.transition}
            >
              {/* Decorative accent */}
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#4AC8E8] via-[#9ADFF2] to-[#4AC8E8]" />
              
              <h2 className="text-3xl font-semibold text-[#1A1917]">
                Visit Our Office
              </h2>
              <p className="mt-3 text-[#8A8880]">
                Pop in for a chat about your property requirements
              </p>
              
              <div className="mt-10 space-y-6">
                {contactDetails.map((detail, index) => (
                  <motion.div
                    key={detail.label}
                    className="group flex items-start gap-5"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#F4F3F1] text-[#4AC8E8] transition-all duration-300 group-hover:bg-[#4AC8E8] group-hover:text-white">
                      <detail.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8A8880]">
                        {detail.label}
                      </p>
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className="mt-1 inline-block text-[#1A1917] transition-colors hover:text-[#4AC8E8]"
                          onClick={() => detail.label === "Phone" && trackCallClick("contact_page_details")}
                        >
                          {detail.lines.map((line, i) => (
                            <span key={i} className="block">
                              {line}
                            </span>
                          ))}
                        </a>
                      ) : (
                        <div className="mt-1 text-[#1A1917]">
                          {detail.lines.map((line, i) => (
                            <p key={i} className={i === 0 ? "font-medium" : ""}>
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* CTA Button */}
              <motion.div 
                className="mt-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <a
                  href="tel:01707877781"
                  onClick={() => trackCallClick("contact_page_cta")}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1A1917] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#4AC8E8] hover:shadow-lg hover:shadow-[#4AC8E8]/25"
                >
                  <Phone className="h-4 w-4" />
                  Call Us Now
                </a>
              </motion.div>

              {/* Mayfair office */}
              <div className="mt-10 border-t border-[#F4F3F1] pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8A8880]">
                  Mayfair Office
                </p>
                <div className="mt-3 space-y-2 text-[#1A1917]">
                  <p className="font-medium">121 Park Lane, Mayfair, W1K 7AG</p>
                  <a
                    href="tel:02033688972"
                    className="block transition-colors hover:text-[#4AC8E8]"
                    onClick={() => trackCallClick("contact_page_mayfair")}
                  >
                    0203 368 8972
                  </a>
                  <a
                    href="mailto:info@bancproperty.com"
                    className="block transition-colors hover:text-[#4AC8E8]"
                  >
                    info@bancproperty.com
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Google Maps Embed */}
            <motion.div
              className="group relative overflow-hidden rounded-3xl shadow-xl shadow-[#1A1917]/5"
              variants={scaleIn}
              initial="initial"
              whileInView="whileInView"
              viewport={scaleIn.viewport}
              transition={scaleIn.transition}
            >
              {/* Map iframe with premium styling */}
              <div className="relative h-full min-h-[500px] w-full lg:min-h-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2463.6387380899244!2d-0.113307!3d51.70798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48763c3e3f9e3c9b%3A0x7d2e9e4c7d5e8f5a!2s1%20Station%20Rd%2C%20Cuffley%2C%20Potters%20Bar%20EN6%204HU!5e0!3m2!1sen!2suk!4v1708361600000!5m2!1sen!2suk"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "grayscale(20%) contrast(1.05)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Banc Property Group Cuffley Office"
                  className="absolute inset-0"
                />
                
                {/* Gradient overlay for visual polish */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]" />
              </div>
              
              {/* Map info card overlay */}
              <motion.div 
                className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4AC8E8]/10 text-[#4AC8E8]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1917]">Banc Property Group</p>
                    <p className="text-sm text-[#8A8880]">1 Station Road, Cuffley</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#1A1917] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div 
            className="mb-16 text-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={fadeInUp.viewport}
          >
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-[#4AC8E8]">
              <span className="h-px w-8 bg-[#4AC8E8]" />
              Testimonials
              <span className="h-px w-8 bg-[#4AC8E8]" />
            </p>
            <h2 className="text-4xl font-semibold text-white">
              What Our Clients Say
            </h2>
          </motion.div>
          
          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={staggerContainer.viewport}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="group relative overflow-hidden rounded-2xl bg-[#3D3B37] p-8 transition-all duration-500 hover:-translate-y-2 hover:bg-[#44474d] hover:shadow-2xl hover:shadow-black/20"
              >
                {/* Quote icon with gradient */}
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4AC8E8] to-[#1A9BBF] text-white shadow-lg shadow-[#4AC8E8]/20">
                  <Quote className="h-5 w-5" />
                </div>
                
                {/* Testimonial text */}
                <p className="relative text-[15px] leading-relaxed text-white/80">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                
                {/* Author */}
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4AC8E8]/20 text-[#4AC8E8] font-semibold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <div className="mt-1 flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="h-4 w-4 text-[#4AC8E8]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Decorative gradient line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4AC8E8] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call Me Back Form Section - Premium Dark Design */}
      <section className="relative overflow-hidden bg-[#1a1d21] py-24 pb-32 lg:py-32">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4AC8E8]/5 to-transparent" />
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#4AC8E8]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#1A9BBF]/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-4xl px-6 lg:px-10">
          <motion.div 
            className="mb-12 text-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={fadeInUp.viewport}
          >
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-[#4AC8E8]">
              <Send className="h-4 w-4" />
              Request a Call
            </p>
            <h2 className="text-4xl font-semibold text-white lg:text-5xl">
              Call Me Back
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/50">
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-3xl bg-[#1A1917] p-10 shadow-2xl lg:p-14"
            variants={scaleIn}
            initial="initial"
            whileInView="whileInView"
            viewport={scaleIn.viewport}
          >
            {/* Top accent bar */}
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#4AC8E8] via-[#9ADFF2] to-[#4AC8E8]" />
            
            <div className="grid gap-8 md:grid-cols-2">
              {/* Name Field */}
              <div className="group">
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-white/70">
                  Name <span className="text-[#4AC8E8]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-[#3D3B37] bg-[#1a1d21] px-4 py-4 text-white placeholder-white/30 transition-all duration-300 focus:border-[#4AC8E8] focus:outline-none focus:ring-4 focus:ring-[#4AC8E8]/10"
                    placeholder="Your full name"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 opacity-0 transition-opacity group-focus-within:opacity-100">
                    <div className="h-2 w-2 rounded-full bg-[#4AC8E8]" />
                  </div>
                </div>
              </div>

              {/* Phone Field */}
              <div className="group">
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-white/70">
                  Phone <span className="text-[#4AC8E8]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-[#3D3B37] bg-[#1a1d21] px-4 py-4 text-white placeholder-white/30 transition-all duration-300 focus:border-[#4AC8E8] focus:outline-none focus:ring-4 focus:ring-[#4AC8E8]/10"
                    placeholder="Your phone number"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 opacity-0 transition-opacity group-focus-within:opacity-100">
                    <div className="h-2 w-2 rounded-full bg-[#4AC8E8]" />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="group md:col-span-2">
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/70">
                  Email <span className="text-[#4AC8E8]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-[#3D3B37] bg-[#1a1d21] px-4 py-4 text-white placeholder-white/30 transition-all duration-300 focus:border-[#4AC8E8] focus:outline-none focus:ring-4 focus:ring-[#4AC8E8]/10"
                    placeholder="Your email address"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 opacity-0 transition-opacity group-focus-within:opacity-100">
                    <div className="h-2 w-2 rounded-full bg-[#4AC8E8]" />
                  </div>
                </div>
              </div>

              {/* Subject Field */}
              <div className="group md:col-span-2">
                <label htmlFor="subject" className="mb-2 block text-sm font-medium text-white/70">
                  Subject <span className="text-[#4AC8E8]">*</span>
                </label>
                <div className="relative">
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full min-h-[56px] rounded-xl border-2 border-[#3D3B37] bg-[#1a1d21] px-4 py-4 text-white text-base transition-all duration-300 focus:border-[#4AC8E8] focus:outline-none focus:ring-4 focus:ring-[#4AC8E8]/10 appearance-none cursor-pointer hover:border-[#4AC8E8]/50"
                  >
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Property Valuation">Property Valuation</option>
                    <option value="Property for Sale">Property for Sale</option>
                    <option value="Property to Let">Property to Let</option>
                    <option value="Land & New Homes">Land & New Homes</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 pointer-events-none" />
                </div>
              </div>

              {/* Message Field */}
              <div className="group md:col-span-2">
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-white/70">
                  Message
                </label>
                <div className="relative">
                  <textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full resize-none rounded-xl border-2 border-[#3D3B37] bg-[#1a1d21] px-4 py-4 text-white placeholder-white/30 transition-all duration-300 focus:border-[#4AC8E8] focus:outline-none focus:ring-4 focus:ring-[#4AC8E8]/10"
                    placeholder="How can we help you?"
                  />
                  <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-focus-within:opacity-100">
                    <div className="h-2 w-2 rounded-full bg-[#4AC8E8]" />
                  </div>
                </div>
              </div>

              {/* Privacy Checkbox */}
              <div className="flex items-start gap-4 md:col-span-2">
                <div className="relative flex items-center">
                  <input
                    id="consent"
                    type="checkbox"
                    required
                    checked={formData.consent}
                    onChange={handleChange}
                    className="peer h-6 w-6 cursor-pointer rounded-lg border-2 border-[#3D3B37] bg-[#1a1d21] checked:border-[#4AC8E8] checked:bg-[#4AC8E8] focus:outline-none focus:ring-4 focus:ring-[#4AC8E8]/10"
                  />
                  <svg
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M2 7L5.5 10.5L12 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <label htmlFor="consent" className="cursor-pointer text-sm leading-relaxed text-white/60">
                  Please tick this box if you are happy for us to contact you via phone and email. 
                  You can view our full <a href="/privacy" className="text-[#4AC8E8] hover:underline">privacy policy</a> on our website.
                </label>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#4AC8E8] to-[#1A9BBF] py-7 text-base font-semibold text-white transition-all duration-500 hover:shadow-lg hover:shadow-[#4AC8E8]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                  {/* Hover shimmer effect */}
                  {!isSubmitting && (
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  )}
                </Button>
              </div>
            </div>
          </motion.form>
        </div>
      </section>
    </>
  );
}
