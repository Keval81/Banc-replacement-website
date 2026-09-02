import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = withPageDefaults("/privacy", {
  title: "Privacy Policy | Banc Property Group",
  description: "Learn how Banc Property Group collects, uses, and protects your personal data.",
});

export const revalidate = 3600;

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F4F3F1]">
      <Header />
      <div className="h-[57px] lg:h-[94px]" />

      <main className="px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-semibold text-[#1A1917] lg:text-5xl">
              Privacy Policy
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
                  Banc Property Group (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed 
                  to protecting your privacy. This Privacy Policy explains how we collect, use, store, and 
                  protect your personal information when you use our website or services.
                </p>
                <p className="mt-4">
                  We are registered with the Information Commissioner&apos;s Office (ICO) and comply with 
                  the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
                </p>
                <p className="mt-4">
                  By using our website or services, you agree to the collection and use of information 
                  in accordance with this Privacy Policy.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">2. Data Controller</h2>
                <p className="mt-4">
                  Banc Property Group is the data controller responsible for your personal data. Our 
                  registered address is:
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

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">3. What Personal Data We Collect</h2>
                <p className="mt-4">We may collect and process the following personal data:</p>
                
                <h3 className="mt-6 text-xl font-semibold text-[#1A1917]">3.1 Information You Provide Directly</h3>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li><strong className="text-[#1A1917]">Contact Information:</strong> Name, email address, phone number, postal address</li>
                  <li><strong className="text-[#1A1917]">Property Information:</strong> Property address, type, number of bedrooms, and other details relevant to valuations</li>
                  <li><strong className="text-[#1A1917]">Communication Preferences:</strong> Your preferences for how we contact you</li>
                  <li><strong className="text-[#1A1917]">Enquiry Details:</strong> Information you provide in contact forms or valuation requests</li>
                </ul>

                <h3 className="mt-6 text-xl font-semibold text-[#1A1917]">3.2 Information Collected Automatically</h3>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li><strong className="text-[#1A1917]">Technical Data:</strong> IP address, browser type and version, time zone setting, browser plug-in types, operating system</li>
                  <li><strong className="text-[#1A1917]">Usage Data:</strong> Information about how you use our website, including pages visited, time spent on pages, and click patterns</li>
                  <li><strong className="text-[#1A1917]">Cookie Data:</strong> Information stored through cookies (see our Cookie Policy for details)</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">4. How We Collect Your Data</h2>
                <p className="mt-4">We collect personal data through:</p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>Direct interactions when you complete forms on our website</li>
                  <li>When you contact us by phone, email, or in person</li>
                  <li>Automated technologies such as cookies and server logs</li>
                  <li>Third parties such as property portals (with your consent)</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">5. How We Use Your Data</h2>
                <p className="mt-4">We use your personal data for the following purposes:</p>
                
                <h3 className="mt-6 text-xl font-semibold text-[#1A1917]">5.1 To Provide Our Services</h3>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>Responding to your enquiries and requests</li>
                  <li>Conducting property valuations</li>
                  <li>Marketing and selling properties on your behalf</li>
                  <li>Managing tenancies and property management services</li>
                  <li>Processing transactions and maintaining records</li>
                </ul>

                <h3 className="mt-6 text-xl font-semibold text-[#1A1917]">5.2 To Communicate With You</h3>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>Sending property updates and recommendations</li>
                  <li>Providing information about our services</li>
                  <li>Sending administrative communications about your account or transactions</li>
                </ul>

                <h3 className="mt-6 text-xl font-semibold text-[#1A1917]">5.3 To Improve Our Services</h3>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>Analysing website usage to improve user experience</li>
                  <li>Conducting market research and analysis</li>
                  <li>Testing new features and functionality</li>
                </ul>

                <h3 className="mt-6 text-xl font-semibold text-[#1A1917]">5.4 For Legal and Regulatory Purposes</h3>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>Complying with legal obligations</li>
                  <li>Preventing fraud and money laundering</li>
                  <li>Establishing, exercising, or defending legal claims</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">6. Legal Basis for Processing</h2>
                <p className="mt-4">We process your personal data based on the following legal grounds:</p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li><strong className="text-[#1A1917]">Consent:</strong> Where you have given us explicit consent to process your data for specific purposes</li>
                  <li><strong className="text-[#1A1917]">Contract:</strong> Where processing is necessary for the performance of a contract with you</li>
                  <li><strong className="text-[#1A1917]">Legal Obligation:</strong> Where we need to comply with a legal obligation</li>
                  <li><strong className="text-[#1A1917]">Legitimate Interests:</strong> Where processing is necessary for our legitimate interests or those of a third party, provided your interests do not override these</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">7. Data Sharing and Third Parties</h2>
                <p className="mt-4">We may share your personal data with:</p>
                
                <h3 className="mt-6 text-xl font-semibold text-[#1A1917]">7.1 Service Providers</h3>
                <p className="mt-3">
                  We engage trusted third parties to perform functions and provide services on our behalf, 
                  including IT support, email delivery, and customer relationship management. These parties 
                  have access to personal data needed to perform their functions but may not use it for 
                  other purposes.
                </p>

                <h3 className="mt-6 text-xl font-semibold text-[#1A1917]">7.2 Professional Advisors</h3>
                <p className="mt-3">
                  We may share your data with professional advisors such as solicitors, accountants, and 
                  insurers where necessary.
                </p>

                <h3 className="mt-6 text-xl font-semibold text-[#1A1917]">7.3 Legal and Regulatory Bodies</h3>
                <p className="mt-3">
                  We may disclose your personal data where required by law or to comply with legal obligations, 
                  court orders, or regulatory requirements.
                </p>

                <h3 className="mt-6 text-xl font-semibold text-[#1A1917]">7.4 Property Marketing</h3>
                <p className="mt-3">
                  With your consent, we may share property details and your contact information with property 
                  portals, potential buyers, or tenants.
                </p>

                <p className="mt-6">
                  We do not sell your personal data to third parties.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">8. Data Security</h2>
                <p className="mt-4">
                  We implement appropriate technical and organisational measures to protect your personal 
                  data against unauthorised access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>Encryption of data in transit using SSL/TLS</li>
                  <li>Secure data storage with access controls</li>
                  <li>Regular security assessments and updates</li>
                  <li>Staff training on data protection</li>
                  <li>Secure disposal of data when no longer needed</li>
                </ul>
                <p className="mt-4">
                  While we strive to use commercially acceptable means to protect your personal data, we 
                  cannot guarantee its absolute security.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">9. Data Retention</h2>
                <p className="mt-4">
                  We retain your personal data only for as long as necessary to fulfil the purposes for 
                  which it was collected, including for the purposes of satisfying any legal, accounting, 
                  or reporting requirements.
                </p>
                <p className="mt-4">
                  Specific retention periods are:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li><strong className="text-[#1A1917]">Contact form submissions:</strong> 2 years from last contact</li>
                  <li><strong className="text-[#1A1917]">Valuation requests:</strong> 3 years from the request date</li>
                  <li><strong className="text-[#1A1917]">Property transaction records:</strong> 6 years (for legal and tax purposes)</li>
                  <li><strong className="text-[#1A1917]">Marketing consent records:</strong> Until consent is withdrawn</li>
                </ul>
                <p className="mt-4">
                  When your data is no longer required, we will securely delete or anonymise it.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">10. Your Data Protection Rights</h2>
                <p className="mt-4">Under UK GDPR, you have the following rights:</p>
                
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg border border-[#E5E5E5] p-4">
                    <h4 className="font-semibold text-[#1A1917]">Right to Access</h4>
                    <p className="mt-1 text-sm">You have the right to request copies of your personal data.</p>
                  </div>
                  <div className="rounded-lg border border-[#E5E5E5] p-4">
                    <h4 className="font-semibold text-[#1A1917]">Right to Rectification</h4>
                    <p className="mt-1 text-sm">You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</p>
                  </div>
                  <div className="rounded-lg border border-[#E5E5E5] p-4">
                    <h4 className="font-semibold text-[#1A1917]">Right to Erasure</h4>
                    <p className="mt-1 text-sm">You have the right to request that we erase your personal data, under certain conditions.</p>
                  </div>
                  <div className="rounded-lg border border-[#E5E5E5] p-4">
                    <h4 className="font-semibold text-[#1A1917]">Right to Restrict Processing</h4>
                    <p className="mt-1 text-sm">You have the right to request that we restrict the processing of your personal data, under certain conditions.</p>
                  </div>
                  <div className="rounded-lg border border-[#E5E5E5] p-4">
                    <h4 className="font-semibold text-[#1A1917]">Right to Object to Processing</h4>
                    <p className="mt-1 text-sm">You have the right to object to our processing of your personal data, under certain conditions.</p>
                  </div>
                  <div className="rounded-lg border border-[#E5E5E5] p-4">
                    <h4 className="font-semibold text-[#1A1917]">Right to Data Portability</h4>
                    <p className="mt-1 text-sm">You have the right to request that we transfer the data that we have collected to another organisation, or directly to you, under certain conditions.</p>
                  </div>
                  <div className="rounded-lg border border-[#E5E5E5] p-4">
                    <h4 className="font-semibold text-[#1A1917]">Right to Withdraw Consent</h4>
                    <p className="mt-1 text-sm">Where we rely on your consent to process your data, you have the right to withdraw that consent at any time.</p>
                  </div>
                </div>

                <p className="mt-6">
                  To exercise any of these rights, please contact us using the details provided in section 2. 
                  We will respond to your request within one month.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">11. Cookies and Tracking</h2>
                <p className="mt-4">
                  We use cookies and similar tracking technologies to track activity on our website and 
                  store certain information. For detailed information about the cookies we use and how 
                  to manage your preferences, please see our <a href="/cookies" className="text-[#4AC8E8] hover:underline">Cookie Policy</a>.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">12. Third-Party Links</h2>
                <p className="mt-4">
                  Our website may contain links to third-party websites. This Privacy Policy does not 
                  apply to those websites. We encourage you to review the privacy policy of every site 
                  you visit.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">13. Changes to This Privacy Policy</h2>
                <p className="mt-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date.
                </p>
                <p className="mt-4">
                  You are advised to review this Privacy Policy periodically for any changes. Changes 
                  to this Privacy Policy are effective when they are posted on this page.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">14. Complaints</h2>
                <p className="mt-4">
                  If you have any concerns about our use of your personal data, you can make a complaint 
                  to us using the contact details above.
                </p>
                <p className="mt-4">
                  You also have the right to complain to the Information Commissioner&apos;s Office (ICO), 
                  the UK supervisory authority for data protection issues:
                </p>
                <div className="mt-4 rounded-xl bg-[#F4F3F1] p-6">
                  <p className="font-semibold text-[#1A1917]">Information Commissioner&apos;s Office</p>
                  <p className="mt-2">Wycliffe House</p>
                  <p>Water Lane</p>
                  <p>Wilmslow</p>
                  <p>Cheshire SK9 5AF</p>
                  <p className="mt-3">
                    Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-[#4AC8E8] hover:underline">ico.org.uk</a>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#1A1917]">15. Contact Us</h2>
                <p className="mt-4">
                  If you have any questions about this Privacy Policy or our data practices, please 
                  contact us:
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
