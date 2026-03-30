import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use | Banc Property Group",
  description: "Terms and conditions for using the Banc Property Group website and services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F4F3F1]">
      <Header />
      <div className="h-[57px] lg:h-[94px]" />

      <main className="px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-semibold text-[#1A1917] lg:text-5xl">
              Terms of Use
            </h1>
            <p className="mt-4 text-lg text-[#8A8880]">
              Last updated: February 2026
            </p>
          </div>

          {/* Content */}
          <div className="rounded-2xl bg-white p-8 shadow-lg lg:p-12">
            <div className="prose prose-lg max-w-none text-[#8A8880]">
              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">1. Introduction</h2>
                <p className="mt-4">
                  Welcome to Banc Property Group&apos;s website. These Terms of Use govern your use of our website 
                  located at <strong className="text-[#1A1917]">bancproperty.com</strong> and any related services 
                  provided by Banc Property Group (referred to as &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
                </p>
                <p className="mt-4">
                  By accessing or using our website, you agree to be bound by these Terms of Use. If you disagree 
                  with any part of these terms, you may not access the website.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">2. Definitions</h2>
                <ul className="mt-4 list-disc space-y-2 pl-6">
                  <li><strong className="text-[#1A1917]">&ldquo;Website&rdquo;</strong> refers to bancproperty.com</li>
                  <li><strong className="text-[#1A1917]">&ldquo;Service&rdquo;</strong> refers to the services provided through our website</li>
                  <li><strong className="text-[#1A1917]">&ldquo;User&rdquo;</strong> refers to any individual accessing or using our website</li>
                  <li><strong className="text-[#1A1917]">&ldquo;Content&rdquo;</strong> refers to all text, images, data, and other materials on our website</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">3. Use of Website</h2>
                <p className="mt-4">
                  You agree to use our website only for lawful purposes and in a way that does not infringe the 
                  rights of, restrict or inhibit anyone else&apos;s use and enjoyment of the website.
                </p>
                <p className="mt-4">Prohibited behaviour includes:</p>
                <ul className="mt-2 list-disc space-y-2 pl-6">
                  <li>Using the website in any way that breaches any applicable local, national or international law</li>
                  <li>Transmitting any unsolicited or unauthorised advertising or promotional material</li>
                  <li>Knowingly transmitting any data or material that contains viruses or other harmful programs</li>
                  <li>Attempting to gain unauthorised access to our website, server, or any related database</li>
                  <li>Using our website to send commercial communications without our prior consent</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">4. Intellectual Property</h2>
                <p className="mt-4">
                  The content on this website, including but not limited to text, graphics, logos, images, 
                  photographs, audio clips, digital downloads, data compilations, and software, is the property 
                  of Banc Property Group or its content suppliers and is protected by UK and international 
                  copyright laws.
                </p>
                <p className="mt-4">
                  You may not reproduce, duplicate, copy, sell, resell, visit, or otherwise exploit our website 
                  or material on our website for any commercial purpose without our express written consent.
                </p>
                <p className="mt-4">
                  All trademarks, service marks, and trade names are proprietary to Banc Property Group. 
                  You may not use our trademarks without our prior written permission.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">5. Property Listings and Information</h2>
                <p className="mt-4">
                  While we make every effort to ensure that property information on our website is accurate, 
                  we cannot guarantee the completeness or accuracy of all information. Property details, 
                  prices, and availability are subject to change without notice.
                </p>
                <p className="mt-4">
                  All measurements, floor plans, and photographs are provided for guidance only and should 
                  not be relied upon for exact measurements. We recommend that you verify all important 
                  information before making any decisions.
                </p>
                <p className="mt-4">
                  Properties listed on our website are subject to availability and may be withdrawn from 
                  the market at any time.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">6. User Submissions</h2>
                <p className="mt-4">
                  Any material you submit to our website, including contact form submissions, valuation 
                  requests, and feedback, must not be illegal, obscene, abusive, threatening, defamatory, 
                  or invasive of privacy.
                </p>
                <p className="mt-4">
                  By submitting content to our website, you grant us a non-exclusive, royalty-free, 
                  perpetual, and worldwide licence to use, reproduce, modify, adapt, publish, translate, 
                  and distribute your content in any existing or future media.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">7. Links to Third-Party Websites</h2>
                <p className="mt-4">
                  Our website may contain links to third-party websites that are not owned or controlled 
                  by Banc Property Group. We have no control over, and assume no responsibility for, the 
                  content, privacy policies, or practices of any third-party websites.
                </p>
                <p className="mt-4">
                  We do not endorse any third-party websites and you access them at your own risk. We 
                  recommend that you review the terms and conditions and privacy policy of any third-party 
                  website you visit.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">8. Disclaimer of Warranties</h2>
                <p className="mt-4">
                  Our website is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. 
                  Banc Property Group makes no representations or warranties of any kind, express or implied, 
                  as to the operation of our website or the information, content, materials, or products 
                  included on our website.
                </p>
                <p className="mt-4">
                  To the full extent permissible by applicable law, we disclaim all warranties, express or 
                  implied, including but not limited to implied warranties of merchantability and fitness 
                  for a particular purpose.
                </p>
                <p className="mt-4">
                  We do not warrant that our website, its servers, or email sent from us are free of viruses 
                  or other harmful components.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">9. Limitation of Liability</h2>
                <p className="mt-4">
                  Banc Property Group shall not be liable for any direct, indirect, incidental, special, 
                  consequential, or punitive damages arising out of or relating to your use of, or inability 
                  to use, our website or services.
                </p>
                <p className="mt-4">
                  This includes but is not limited to damages for loss of profits, goodwill, use, data, 
                  or other intangible losses, even if we have been advised of the possibility of such damages.
                </p>
                <p className="mt-4">
                  Nothing in these Terms of Use shall limit or exclude our liability for death or personal 
                  injury caused by our negligence, fraud, or fraudulent misrepresentation, or any other 
                  liability that cannot be excluded by applicable law.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">10. Indemnification</h2>
                <p className="mt-4">
                  You agree to indemnify, defend, and hold harmless Banc Property Group, its directors, 
                  officers, employees, consultants, agents, and affiliates from any and all third-party 
                  claims, liability, damages, and/or costs (including legal fees) arising from your use 
                  of our website, your violation of these Terms of Use, or your infringement of any 
                  intellectual property or other right of any person or entity.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">11. Termination</h2>
                <p className="mt-4">
                  We may terminate or suspend your access to our website immediately, without prior notice 
                  or liability, for any reason whatsoever, including without limitation if you breach these 
                  Terms of Use.
                </p>
                <p className="mt-4">
                  All provisions of these Terms of Use which by their nature should survive termination 
                  shall survive termination, including, without limitation, ownership provisions, warranty 
                  disclaimers, indemnity, and limitations of liability.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">12. Governing Law</h2>
                <p className="mt-4">
                  These Terms of Use shall be governed by and construed in accordance with the laws of 
                  England and Wales, without regard to its conflict of law provisions.
                </p>
                <p className="mt-4">
                  Any dispute arising under or in connection with these Terms of Use shall be subject to 
                  the exclusive jurisdiction of the courts of England and Wales.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">13. Changes to Terms</h2>
                <p className="mt-4">
                  We reserve the right to modify these Terms of Use at any time. Changes will be effective 
                  immediately upon posting to the website. Your continued use of the website following the 
                  posting of revised Terms of Use means that you accept and agree to the changes.
                </p>
                <p className="mt-4">
                  We encourage you to review these Terms of Use periodically for any updates or changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#1A1917]">14. Contact Information</h2>
                <p className="mt-4">
                  If you have any questions about these Terms of Use, please contact us:
                </p>
                <div className="mt-4 rounded-xl bg-[#F4F3F1] p-6">
                  <p className="font-semibold text-[#1A1917]">Banc Property Group</p>
                  <p className="mt-2">1 Station Road</p>
                  <p>Cuffley, Hertfordshire</p>
                  <p>EN6 4HU</p>
                  <p className="mt-3">
                    Email: <a href="mailto:info@bancproperty.com" className="text-[#4AC8E8] hover:underline">info@bancproperty.com</a>
                  </p>
                  <p>
                    Phone: <a href="tel:01707877781" className="text-[#4AC8E8] hover:underline">01707 877781</a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
