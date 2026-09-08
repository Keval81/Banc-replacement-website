import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SimpleEnquiryForm } from "@/components/forms/SimpleEnquiryForm";
import type { SimpleEnquiryField } from "@/lib/simple-enquiry";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Car, 
  Train,
  ArrowRight,
  Users,
  Navigation,
  Star,
  Calendar,
  Building2,
  Crown
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { JsonLd } from "@/components/JsonLd";
import { BANC_OFFICES } from "@/lib/banc-content/contact";
import {
  breadcrumbJsonLd,
  MAYFAIR_ADDRESS,
  officeJsonLd,
} from "@/lib/schema-org";
import { BANC_MAYFAIR_CONTACT } from "@/lib/banc-contact";

export const revalidate = 3600;

const officeStructuredData = [
  officeJsonLd({
    office: BANC_OFFICES.mayfair,
    path: "/offices/mayfair",
    address: MAYFAIR_ADDRESS,
    description:
      "Banc Property Group's Mayfair office at 121 Park Lane — prime central London sales and lettings.",
  }),
  breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Offices", path: "/offices" },
    { name: BANC_OFFICES.mayfair.title, path: "/offices/mayfair" },
  ]),
];

const CONSULTATION_FIELDS: SimpleEnquiryField[] = [
  { name: "firstName", label: "First Name", type: "text", placeholder: "John", required: true, span: "half" },
  { name: "lastName", label: "Last Name", type: "text", placeholder: "Smith", required: true, span: "half" },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: "+44 20 7123 4567", required: true, span: "half" },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com", required: true, span: "half" },
  { name: "propertyAddress", label: "Property Address", type: "text", placeholder: "Property address or area of interest" },
  {
    name: "propertyValue",
    label: "Estimated Property Value",
    type: "select",
    placeholder: "Select value range...",
    options: ["£1,000,000 - £2,000,000", "£2,000,000 - £3,000,000", "£3,000,000 - £5,000,000", "£5,000,000+"],
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    placeholder: "Please provide any additional details about your requirements...",
  },
];

export const metadata: Metadata = withPageDefaults("/offices/mayfair", {
  title: "Mayfair Office | Banc Property Group",
  description: "Visit our Mayfair office in the heart of London's luxury property district. Expert estate agents specialising in prime central London properties.",
  keywords: "mayfair estate agent, london property agent, prime central london, luxury property mayfair, banc mayfair",
});

// Team members at Mayfair office
const teamMembers = [
  {
    name: "Nitesh Bheda",
    role: "Director - London",
    image: "/images/team/nitesh-bheda-headshot-clay.jpg",
    phone: "07850 082541",
    email: "nitesh@bancproperty.com"
  },
  {
    name: "Andrew Crump",
    role: "Director - Premier Homes",
    image: "/images/team/andrew-crump-headshot-clay.jpg",
    phone: "07565 543153",
    email: "andrew@bancproperty.com"
  }
];

// Opening hours
const openingHours = [
  { day: "Monday", hours: "9:00 AM - 5:30 PM" },
  { day: "Tuesday", hours: "9:00 AM - 5:30 PM" },
  { day: "Wednesday", hours: "9:00 AM - 5:30 PM" },
  { day: "Thursday", hours: "9:00 AM - 5:30 PM" },
  { day: "Friday", hours: "9:00 AM - 5:30 PM" },
  { day: "Saturday", hours: "9:00 AM - 5:30 PM" },
  { day: "Sunday", hours: "Closed" },
];

// Areas covered
const areasCovered = [
  "Mayfair",
  "Belgravia",
  "Knightsbridge",
  "Kensington",
  "Chelsea",
  "Marylebone",
  "St James's",
  "Westminster",
  "Hyde Park",
  "Notting Hill",
];

export default function MayfairOfficePage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <JsonLd data={officeStructuredData} />
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-banc-dark-deep py-24 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1617606796212-4c99a14a116e?auto=format&fit=crop&w=1920&q=80"
            alt="Mayfair Office"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep via-banc-dark-deep/90 to-banc-dark-deep/70" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <Crown className="h-4 w-4 text-banc-sky" />
                <span className="text-sm font-medium text-white/80">Premier Homes</span>
              </div>
              
              <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl tracking-tight">
                Mayfair Office
              </h1>
              <p className="mt-4 text-banc-sky font-medium">
                Premium Property Specialists
              </p>
              
              <p className="mt-6 text-lg text-white/70 leading-relaxed">
                Our Mayfair office specialises in prime central London properties, 
                discreet marketing for high-value homes, and bespoke services for 
                discerning buyers and sellers in London&apos;s most prestigious locations.
              </p>
              
              {/* Quick contact info */}
              <div className="mt-8 space-y-4">
                <a href={BANC_MAYFAIR_CONTACT.callHref} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-banc-sky/20 flex items-center justify-center group-hover:bg-banc-sky/30 transition-colors">
                    <Phone className="h-5 w-5 text-banc-sky" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Call us</p>
                    <p className="text-lg font-semibold text-white group-hover:text-banc-sky transition-colors">{BANC_MAYFAIR_CONTACT.displayPhone}</p>
                  </div>
                </a>

                <a href="mailto:info@bancproperty.com" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-banc-sky/20 flex items-center justify-center group-hover:bg-banc-sky/30 transition-colors">
                    <Mail className="h-5 w-5 text-banc-sky" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Email us</p>
                    <p className="text-lg font-semibold text-white group-hover:text-banc-sky transition-colors">info@bancproperty.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-banc-sky/20 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-banc-sky" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Visit us by appointment</p>
                    <p className="text-lg font-semibold text-white">121 Park Lane, Mayfair, W1K 7AG</p>
                  </div>
                </div>
              </div>
              
              {/* CTA buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/premier-homes">
                  <Button className="bg-banc-focus hover:bg-banc-focus-hover text-white px-6">
                    <Crown className="mr-2 h-4 w-4" />
                    Premier Homes
                  </Button>
                </Link>
                <Link href="#appointment">
                  <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 px-6">
                    <Calendar className="mr-2 h-4 w-4" />
                    Private Consultation
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Map placeholder - using static image for now */}
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src="https://www.google.com/maps?q=121+Park+Lane,+Mayfair,+London+W1K+7AG&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Premier Services Banner */}
      <section className="bg-gradient-to-r from-banc-sky to-banc-sky-dark py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Crown className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Banc Premier Homes</h2>
                <p className="text-white/80">Exclusive marketing for properties £1 million+</p>
              </div>
            </div>
            <Link href="/premier-homes">
              <Button className="bg-white text-banc-focus hover:bg-white/90 px-6">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Office Info Grid */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Opening Hours */}
            <div className="bg-white rounded-2xl p-8 border border-banc-line/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-banc-focus" />
                </div>
                <h2 className="text-xl font-semibold text-banc-dark-deep">Opening Hours</h2>
              </div>
              
              <div className="space-y-3">
                {openingHours.map((item) => (
                  <div key={item.day} className="flex justify-between items-center py-2 border-b border-banc-line/20 last:border-0">
                    <span className="text-banc-dark-mid font-medium">{item.day}</span>
                    <span className={`${item.hours === 'Closed' ? 'text-banc-muted-readable' : 'text-banc-focus font-semibold'}`}>
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-banc-muted-readable">
                Private appointments available outside standard hours.
              </p>
            </div>
            
            {/* Location & Access */}
            <div className="bg-white rounded-2xl p-8 border border-banc-line/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center">
                  <Train className="h-6 w-6 text-banc-focus" />
                </div>
                <h2 className="text-xl font-semibold text-banc-dark-deep">Location & Access</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Train className="h-5 w-5 text-banc-focus flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-banc-dark-deep">Tube Stations</p>
                    <p className="text-sm text-banc-muted-readable">Green Park, Hyde Park Corner, and Bond Street stations within walking distance</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Car className="h-5 w-5 text-banc-focus flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-banc-dark-deep">Parking</p>
                    <p className="text-sm text-banc-muted-readable">Metered street parking and nearby NCP car parks available</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Navigation className="h-5 w-5 text-banc-focus flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-banc-dark-deep">Private Consultations</p>
                    <p className="text-sm text-banc-muted-readable">Meetings by appointment at our Mayfair location or at your property</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Areas We Cover */}
            <div className="bg-white rounded-2xl p-8 border border-banc-line/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-banc-focus" />
                </div>
                <h2 className="text-xl font-semibold text-banc-dark-deep">Prime Areas Covered</h2>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {areasCovered.map((area) => (
                  <span 
                    key={area}
                    className="px-3 py-1.5 rounded-full bg-banc-grey-pale text-sm text-banc-dark-mid border border-banc-line/30"
                  >
                    {area}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-banc-muted-readable">
                Covering all prime central London locations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premier Services Section */}
      <section className="py-20 lg:py-28 bg-banc-dark-deep">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Crown className="h-4 w-4 text-banc-sky" />
              <span className="text-sm font-medium text-white/80">Premier Service</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-white">
              Luxury Property Specialists
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Discreet, bespoke marketing for exceptional properties.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Discreet Marketing",
                description: "Private listings and off-market sales for clients who value confidentiality.",
                icon: Building2
              },
              {
                title: "Global Network",
                description: "Access to international buyers through our partnership networks.",
                icon: Navigation
              },
              {
                title: "Premium Presentation",
                description: "Professional photography, videography, and bespoke marketing materials.",
                icon: Star
              }
            ].map((service) => (
              <div key={service.title} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-banc-sky/50 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-banc-sky/20 flex items-center justify-center mb-6">
                  <service.icon className="h-7 w-7 text-banc-sky" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
                <p className="text-white/60">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-banc-sky/10 border border-banc-sky/20 mb-6">
              <Users className="h-4 w-4 text-banc-focus" />
              <span className="text-sm font-medium text-banc-focus">Our London Team</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-banc-dark-deep">
              Meet the Mayfair Team
            </h2>
            <p className="mt-4 text-lg text-banc-muted-readable">
              Our directors personally handle all premier properties, ensuring the highest level of service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl overflow-hidden border border-banc-line/30 shadow-sm hover:shadow-lg transition-shadow group">
                <div className="relative h-72 overflow-hidden">
                  <Image 
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-banc-dark-deep">{member.name}</h3>
                  <p className="text-banc-focus font-medium">{member.role}</p>
                  <div className="mt-4 space-y-2">
                    <a href={`tel:${member.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm text-banc-muted-readable hover:text-banc-sky transition-colors">
                      <Phone className="h-4 w-4" />
                      {member.phone}
                    </a>
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-banc-muted-readable hover:text-banc-sky transition-colors">
                      <Mail className="h-4 w-4" />
                      {member.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Private Consultation Section */}
      <section id="appointment" className="py-20 lg:py-28 bg-banc-grey-pale">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-banc-sky/10 border border-banc-sky/20 mb-6">
                <Crown className="h-4 w-4 text-banc-focus" />
                <span className="text-sm font-medium text-banc-focus">Private Consultation</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-semibold text-banc-dark-deep">
                Arrange a Private Consultation
              </h2>
              <p className="mt-4 text-lg text-banc-muted-readable">
                For properties valued at £1 million and above, we offer a bespoke, 
                discreet service tailored to your requirements.
              </p>
              
              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-banc-focus" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-banc-dark-deep">Discretion Assured</h3>
                    <p className="text-sm text-banc-muted-readable">Private valuations and off-market opportunities available.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-banc-focus" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-banc-dark-deep">Bespoke Marketing</h3>
                    <p className="text-sm text-banc-muted-readable">Tailored campaigns designed specifically for your property.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center flex-shrink-0">
                    <Navigation className="h-6 w-6 text-banc-focus" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-banc-dark-deep">Global Reach</h3>
                    <p className="text-sm text-banc-muted-readable">Access to qualified buyers from around the world.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Form */}
            <div className="bg-white rounded-2xl p-8 border border-banc-line/30 shadow-lg">
              <h3 className="text-xl font-semibold text-banc-dark-deep mb-2">Request Private Consultation</h3>
              <p className="text-sm text-banc-muted-readable mb-6">
                All enquiries are treated with the strictest confidence.
              </p>
              
              <SimpleEnquiryForm
                fields={CONSULTATION_FIELDS}
                subject="Private consultation request — Mayfair office"
                intro="Private consultation request from the Mayfair office page."
                submitLabel="Request Private Consultation"
                successTitle="Request received"
                successBody="Thank you. The Mayfair office will be in touch, in confidence, to arrange your consultation."
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
