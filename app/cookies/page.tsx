import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResetCookieButton from "./ResetCookieButton";

export const metadata: Metadata = {
  title: "Cookie Policy | Banc Property Group",
  description: "Learn how Banc Property Group uses cookies and how you can manage your cookie preferences.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#F4F3F1]">
      <Header />
      <div className="h-[57px] lg:h-[94px]" />

      <main className="px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-semibold text-[#1A1917] lg:text-5xl">
              Cookie Policy
            </h1>
            <p className="mt-4 text-lg text-[#8A8880]">
              Last updated: February 2026
            </p>
          </div>

          {/* Content */}
          <div className="rounded-2xl bg-white p-8 shadow-lg lg:p-12">
            <div className="prose prose-lg max-w-none text-[#8A8880]">
              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">1. What Are Cookies</h2>
                <p className="mt-4">
                  Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                  They are widely used to make websites work more efficiently and provide information to the website owners.
                </p>
                <p className="mt-4">
                  Cookies help us to improve your experience on our website by remembering your preferences, 
                  understanding how you use our site, and providing you with relevant content and features.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">2. How We Use Cookies</h2>
                <p className="mt-4">
                  Banc Property Group uses cookies for various purposes, including:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li><strong className="text-[#1A1917]">Essential cookies:</strong> Required for the website to function properly</li>
                  <li><strong className="text-[#1A1917]">Performance cookies:</strong> Help us understand how visitors interact with our website</li>
                  <li><strong className="text-[#1A1917]">Functionality cookies:</strong> Enable enhanced functionality and personalisation</li>
                  <li><strong className="text-[#1A1917]">Targeting cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">3. Types of Cookies We Use</h2>
                
                <h3 className="mt-6 text-xl font-semibold text-[#1A1917]">3.1 Essential Cookies</h3>
                <p className="mt-3">
                  These cookies are necessary for the website to function and cannot be switched off in our systems. 
                  They are usually only set in response to actions made by you which amount to a request for services, 
                  such as setting your privacy preferences, logging in, or filling in forms.
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E5E5]">
                        <th className="py-3 pr-4 text-left font-semibold text-[#1A1917]">Cookie Name</th>
                        <th className="py-3 pr-4 text-left font-semibold text-[#1A1917]">Purpose</th>
                        <th className="py-3 text-left font-semibold text-[#1A1917]">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#E5E5E5]">
                        <td className="py-3 pr-4 font-mono text-[#1A1917]">banc-cookie-consent</td>
                        <td className="py-3 pr-4">Stores your cookie consent preferences</td>
                        <td className="py-3">1 year</td>
                      </tr>
                      <tr className="border-b border-[#E5E5E5]">
                        <td className="py-3 pr-4 font-mono text-[#1A1917]">banc-cookie-preferences</td>
                        <td className="py-3 pr-4">Stores detailed cookie preference settings</td>
                        <td className="py-3">1 year</td>
                      </tr>
                      <tr className="border-b border-[#E5E5E5]">
                        <td className="py-3 pr-4 font-mono text-[#1A1917]">session</td>
                        <td className="py-3 pr-4">Maintains your session state</td>
                        <td className="py-3">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="mt-8 text-xl font-semibold text-[#1A1917]">3.2 Analytics Cookies</h3>
                <p className="mt-3">
                  These cookies allow us to count visits and traffic sources so we can measure and improve the 
                  performance of our site. They help us to know which pages are the most and least popular and 
                  see how visitors move around the site.
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E5E5]">
                        <th className="py-3 pr-4 text-left font-semibold text-[#1A1917]">Cookie Name</th>
                        <th className="py-3 pr-4 text-left font-semibold text-[#1A1917]">Purpose</th>
                        <th className="py-3 text-left font-semibold text-[#1A1917]">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#E5E5E5]">
                        <td className="py-3 pr-4 font-mono text-[#1A1917]">_ga</td>
                        <td className="py-3 pr-4">Google Analytics - distinguishes users</td>
                        <td className="py-3">2 years</td>
                      </tr>
                      <tr className="border-b border-[#E5E5E5]">
                        <td className="py-3 pr-4 font-mono text-[#1A1917]">_gid</td>
                        <td className="py-3 pr-4">Google Analytics - distinguishes users</td>
                        <td className="py-3">24 hours</td>
                      </tr>
                      <tr className="border-b border-[#E5E5E5]">
                        <td className="py-3 pr-4 font-mono text-[#1A1917]">_gat</td>
                        <td className="py-3 pr-4">Google Analytics - throttles request rate</td>
                        <td className="py-3">1 minute</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="mt-8 text-xl font-semibold text-[#1A1917]">3.3 Marketing Cookies</h3>
                <p className="mt-3">
                  These cookies may be set through our site by our advertising partners. They may be used by 
                  those companies to build a profile of your interests and show you relevant adverts on other sites.
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E5E5]">
                        <th className="py-3 pr-4 text-left font-semibold text-[#1A1917]">Cookie Name</th>
                        <th className="py-3 pr-4 text-left font-semibold text-[#1A1917]">Purpose</th>
                        <th className="py-3 text-left font-semibold text-[#1A1917]">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#E5E5E5]">
                        <td className="py-3 pr-4 font-mono text-[#1A1917]">_fbp</td>
                        <td className="py-3 pr-4">Facebook Pixel - delivers advertisements</td>
                        <td className="py-3">3 months</td>
                      </tr>
                      <tr className="border-b border-[#E5E5E5]">
                        <td className="py-3 pr-4 font-mono text-[#1A1917]">fr</td>
                        <td className="py-3 pr-4">Facebook - advertising delivery</td>
                        <td className="py-3">3 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">4. Third-Party Cookies</h2>
                <p className="mt-4">
                  Some cookies are placed by third parties on our behalf. These third parties include:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li><strong className="text-[#1A1917]">Google Analytics:</strong> Used to analyse website traffic and usage patterns</li>
                  <li><strong className="text-[#1A1917]">Google Maps:</strong> Used for embedding interactive maps on our contact page</li>
                  <li><strong className="text-[#1A1917]">Facebook/Meta:</strong> Used for advertising and social media integration</li>
                  <li><strong className="text-[#1A1917]">YouTube:</strong> Used for embedding video content</li>
                </ul>
                <p className="mt-4">
                  These third parties may use cookies, web beacons, and similar technologies to collect 
                  information about your use of our website and other websites.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">5. Managing Your Cookie Preferences</h2>
                <p className="mt-4">
                  When you first visit our website, you will see a cookie banner that allows you to:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li><strong className="text-[#1A1917]">Accept All:</strong> Consent to all cookie categories</li>
                  <li><strong className="text-[#1A1917]">Reject All:</strong> Only allow essential cookies</li>
                  <li><strong className="text-[#1A1917]">Manage Preferences:</strong> Choose which cookie categories to allow</li>
                </ul>
                <p className="mt-4">
                  You can change your cookie preferences at any time by clicking the &ldquo;Cookie Settings&rdquo; 
                  link in the footer of our website, or by visiting this page and clicking the button below.
                </p>
                <div className="mt-6">
                  <ResetCookieButton />
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">6. How to Control Cookies in Your Browser</h2>
                <p className="mt-4">
                  Most web browsers allow you to control cookies through their settings preferences. 
                  Here are links to instructions for major browsers:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>
                    <a 
                      href="https://support.google.com/chrome/answer/95647" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#4AC8E8] hover:underline"
                    >
                      Google Chrome
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#4AC8E8] hover:underline"
                    >
                      Mozilla Firefox
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#4AC8E8] hover:underline"
                    >
                      Safari
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#4AC8E8] hover:underline"
                    >
                      Microsoft Edge
                    </a>
                  </li>
                </ul>
                <p className="mt-4">
                  Please note that disabling cookies may affect the functionality of this and many other 
                  websites that you visit. Disabling cookies will usually result in also disabling certain 
                  functionality and features of this site.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">7. More Information About Cookies</h2>
                <p className="mt-4">
                  To learn more about cookies and how to manage them, visit:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>
                    <a 
                      href="https://www.allaboutcookies.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#4AC8E8] hover:underline"
                    >
                      All About Cookies
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.aboutcookies.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#4AC8E8] hover:underline"
                    >
                      About Cookies
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://ico.org.uk/for-the-public/online/cookies/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#4AC8E8] hover:underline"
                    >
                      ICO - Cookies Guidance
                    </a>
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1A1917]">8. Changes to This Cookie Policy</h2>
                <p className="mt-4">
                  We may update this Cookie Policy from time to time to reflect changes in technology, 
                  legislation, or our data practices. We will notify you of any significant changes by 
                  posting the new Cookie Policy on this page and updating the &ldquo;Last updated&rdquo; date.
                </p>
                <p className="mt-4">
                  You are advised to review this Cookie Policy periodically for any changes. Changes to 
                  this Cookie Policy are effective when they are posted on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#1A1917]">9. Contact Us</h2>
                <p className="mt-4">
                  If you have any questions about this Cookie Policy or our use of cookies, please contact us:
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
