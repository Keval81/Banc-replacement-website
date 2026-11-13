"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Phone, Mail, Clock, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimary,
  eyebrow,
  eyebrowOnDark,
  fieldControl,
  fieldLabel,
  fieldTextarea,
  formPanel,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { trackCallClick } from "@/lib/callTracking";
import { checkContactEnquiry, describeSubmitError } from "@/lib/lead-form-rules";
import {
  BANC_CONTACT_DETAILS,
  BANC_OFFICES,
  BANC_TESTIMONIALS,
} from "@/lib/banc-content/contact";

const testimonials = BANC_TESTIMONIALS;

const contactDetails = BANC_CONTACT_DETAILS.map((detail, index) => ({
  ...detail,
  icon: [MapPin, Phone, Mail, Clock][index],
}));

const cuffleyOffice = BANC_OFFICES.cuffley;
const mayfairOffice = BANC_OFFICES.mayfair;

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
    website: "",
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
    const problem = checkContactEnquiry(formData);
    if (problem) {
      error(problem);
      return;
    }
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
          website: "",
        });
      } else {
        error(describeSubmitError(data, "Something went wrong. Please try again, or call us on 01707 877781."));
      }
    } catch {
      error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* The team outside the Cuffley office — the same claymation shopfront
          the emails open with. Nitesh asked for it here on 7 Sep; it replaces
          a stock photograph of somewhere else. */}
      <PageBand
        eyebrow="Get in Touch"
        title={cuffleyOffice.title}
        lede={
          <>
            Your local property experts in Cuffley. Visit our office, give us a call,
            or request a callback — we&apos;re here to help with all your property needs.
          </>
        }
        image={{ src: "/images/team/banc-team-clay.jpg", alt: "", priority: true, position: "object-[center_35%]", scrim: "light" }}
      />

      {/* Contact Info & Map Section — the map sits directly under the hero and
          comes first on a phone (Nitesh, 7 Sep: "move the map further up"). */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Contact Card */}
            <motion.div
              className={formPanel}
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={fadeInUp.viewport}
              transition={fadeInUp.transition}
            >
              <p className={eyebrow}>Cuffley office</p>
              <h2 className={cn(sectionHeading, "mt-3")}>
                Visit Our Office
              </h2>
              <p className="mt-3 text-banc-muted-readable">
                Pop in for a chat about your property requirements
              </p>

              <div className="mt-7 space-y-6">
                {contactDetails.map((detail, index) => (
                  <motion.div
                    key={detail.label}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <detail.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-banc-focus" aria-hidden="true" />
                    <div className="flex-1">
                      <p className={eyebrow}>
                        {detail.label}
                      </p>
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className="mt-1 inline-block text-banc-dark-deep transition-colors hover:text-banc-focus"
                          onClick={() => detail.label === "Phone" && trackCallClick("contact_page_details")}
                        >
                          {detail.lines.map((line, i) => (
                            <span key={i} className="block">
                              {line}
                            </span>
                          ))}
                        </a>
                      ) : (
                        <div className="mt-1 text-banc-dark-deep">
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
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <a
                  href={cuffleyOffice.phone.callHref}
                  onClick={() => trackCallClick("contact_page_cta")}
                  className={actionPrimary}
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call Us Now
                </a>
              </motion.div>

              {/* Mayfair office */}
              <div className="mt-8 border-t border-banc-dark/15 pt-8">
                <p className={eyebrow}>
                  {mayfairOffice.title}
                </p>
                <div className="mt-3 text-banc-dark-deep">
                  <p className="font-medium">{mayfairOffice.addressLines[0]}</p>
                  <a
                    href={mayfairOffice.phone.callHref}
                    className="flex min-h-11 items-center transition-colors hover:text-banc-focus"
                    onClick={() => trackCallClick("contact_page_mayfair")}
                  >
                    {mayfairOffice.phone.displayPhone}
                  </a>
                  <a
                    href={mayfairOffice.email.mailtoHref}
                    className="flex min-h-11 items-center break-all transition-colors hover:text-banc-focus"
                  >
                    {mayfairOffice.email.displayEmail}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Google Maps Embed */}
            <motion.div
              className="relative order-first overflow-hidden rounded-[var(--radius-md)] border border-banc-line lg:order-none"
              variants={scaleIn}
              initial="initial"
              whileInView="whileInView"
              viewport={scaleIn.viewport}
              transition={scaleIn.transition}
            >
              <div className="relative h-full min-h-[360px] w-full sm:min-h-[460px] lg:min-h-full">
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
              </div>
              
              {/* Map info card overlay */}
              <motion.div
                className="absolute bottom-4 left-4 right-4 rounded-[var(--radius-md)] border border-banc-line bg-white p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-banc-focus" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-banc-dark-deep">Banc Property Group</p>
                    <p className="text-sm text-banc-muted-readable">
                      {cuffleyOffice.addressLines.slice(0, 2).join(", ")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={cn("banc-dark-surface bg-banc-dark-deep text-white", sectionPadding)}>
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-7"
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={fadeInUp.viewport}
          >
            <p className={eyebrowOnDark}>Testimonials</p>
            <h2 className={cn(sectionHeadingOnDark, "mt-3")}>
              What Our Clients Say
            </h2>
          </motion.div>

          <motion.div
            className="grid gap-x-10 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={staggerContainer.viewport}
          >
            {testimonials.map((testimonial, index) => (
              <motion.figure
                key={index}
                variants={scaleIn}
                className="border-t border-white/15 py-6"
              >
                <blockquote className="text-[15px] leading-relaxed text-white/80">
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>
                <figcaption className="mt-5">
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <div className="mt-1 flex gap-0.5" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 text-[var(--banc-focus-dark)]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call Me Back Form Section */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-7 max-w-3xl"
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={fadeInUp.viewport}
          >
            <p className={eyebrow}>Request a Call</p>
            <h2 className={cn(sectionHeading, "mt-3")}>
              Call Me Back
            </h2>
            <p className="mt-4 text-base leading-relaxed text-banc-muted-readable">
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className={cn(formPanel, "relative max-w-3xl overflow-hidden")}
            variants={scaleIn}
            initial="initial"
            whileInView="whileInView"
            viewport={scaleIn.viewport}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className={fieldLabel}>
                  Name <span className="text-banc-focus">*</span>
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={fieldControl}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className={fieldLabel}>
                  Phone <span className="text-banc-focus">*</span>
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={fieldControl}
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="sm:col-span-2">
                <label htmlFor="email" className={fieldLabel}>
                  Email <span className="text-banc-focus">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={fieldControl}
                    placeholder="Your email address"
                  />
                </div>
              </div>

              {/* Subject Field */}
              <div className="sm:col-span-2">
                <label htmlFor="subject" className={fieldLabel}>
                  Subject <span className="text-banc-focus">*</span>
                </label>
                <div className="relative">
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={cn(fieldControl, "cursor-pointer appearance-none pr-11")}
                  >
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Property Valuation">Property Valuation</option>
                    <option value="Property for Sale">Property for Sale</option>
                    <option value="Property to Let">Property to Let</option>
                    <option value="Land & New Homes">Land & New Homes</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-banc-muted-readable" aria-hidden="true" />
                </div>
              </div>

              {/* Message Field */}
              <div className="sm:col-span-2">
                <label htmlFor="message" className={fieldLabel}>
                  Message
                </label>
                <div className="relative">
                  <textarea
                    id="message"
                    rows={5}
                    required
                    minLength={10}
                    value={formData.message}
                    onChange={handleChange}
                    className={cn(fieldControl, fieldTextarea, "h-auto resize-none")}
                    placeholder="How can we help you?"
                  />
                </div>
              </div>

              {/* Honeypot: hidden from people, filled by bots; the API rejects any value. */}
              <input
                id="website"
                type="text"
                value={formData.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-px w-px opacity-0"
              />
              {/* Privacy Checkbox */}
              <div className="flex items-start gap-4 sm:col-span-2">
                <div className="relative flex items-center">
                  <input
                    id="consent"
                    type="checkbox"
                    required
                    checked={formData.consent}
                    onChange={handleChange}
                    className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border border-banc-muted-readable bg-white checked:border-banc-focus checked:bg-banc-focus focus:outline-none focus:ring-2 focus:ring-banc-focus focus:ring-offset-2"
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
                <label htmlFor="consent" className="cursor-pointer text-sm leading-relaxed text-banc-muted-readable">
                  Please tick this box if you are happy for us to contact you via phone and email. 
                  You can view our full <a href="/privacy" className="text-banc-focus underline underline-offset-4 hover:text-banc-focus-hover">privacy policy</a> on our website.
                </label>
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(actionPrimary, "group shadow-none")}
                >
                  <span className="flex items-center justify-center gap-2">
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
                </Button>
              </div>
            </div>
          </motion.form>
        </div>
      </section>
    </>
  );
}
