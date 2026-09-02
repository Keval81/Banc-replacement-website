import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  Building2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { JsonLd } from "@/components/JsonLd";
import { BANC_OFFICES } from "@/lib/banc-content/contact";
import {
  breadcrumbJsonLd,
  CUFFLEY_ADDRESS,
  CUFFLEY_GEO,
  officeJsonLd,
} from "@/lib/schema-org";
import { BANC_CONTACT } from "@/lib/banc-contact";

export const revalidate = 3600;

const officeStructuredData = [
  officeJsonLd({
    office: BANC_OFFICES.cuffley,
    path: "/offices/cuffley",
    address: CUFFLEY_ADDRESS,
    geo: CUFFLEY_GEO,
    description:
      "Banc Property Group's Cuffley office at 1 Station Road — independent estate agents serving Cuffley, Goffs Oak, Potters Bar and surrounding Hertfordshire villages.",
  }),
  breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Offices", path: "/offices" },
    { name: BANC_OFFICES.cuffley.title, path: "/offices/cuffley" },
  ]),
];

export const metadata: Metadata = withPageDefaults("/offices/cuffley", {
  title: "Cuffley Office | Banc Property Group",
  description: "Visit our Cuffley office at 1 Station Road, Cuffley, EN6 4HU. Expert estate agents serving Cuffley, Goffs Oak and surrounding Hertfordshire areas.",
  keywords: "cuffley estate agent, 1 station road cuffley, banc property cuffley, estate agent EN6",
});

// Team members at Cuffley office
const teamMembers = [
  {
    name: "Nitesh Bheda",
    role: "Director",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    phone: "07850 082541",
    email: "nitesh@bancproperty.com"
  },
  {
    name: "Andrew Crump",
    role: "Director",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    phone: "07565 543153",
    email: "andrew@bancproperty.com"
  },
  {
    name: "Vicki Glashier",
    role: "Office Manager",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    phone: BANC_CONTACT.displayPhone,
    email: "vicki@bancproperty.com"
  },
  {
    name: "Kay Stanley",
    role: "Sales Progressor",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    phone: BANC_CONTACT.displayPhone,
    email: "kay@bancproperty.com"
  }
];

// Opening hours
const openingHours = [
  { day: "Monday", hours: "9:00 AM - 6:00 PM" },
  { day: "Tuesday", hours: "9:00 AM - 6:00 PM" },
  { day: "Wednesday", hours: "9:00 AM - 6:00 PM" },
  { day: "Thursday", hours: "9:00 AM - 6:00 PM" },
  { day: "Friday", hours: "9:00 AM - 6:00 PM" },
  { day: "Saturday", hours: "9:00 AM - 6:00 PM" },
  { day: "Sunday", hours: "Closed" },
];

// Areas covered
const areasCovered = [
  "Cuffley",
  "Goffs Oak",
  "Brookmans Park",
  "Northaw",
  "Potters Bar",
  "Cheshunt",
  "Waltham Cross",
  "Enfield",
  "Barnet",
  "Hertford",
];

export default function CuffleyOfficePage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <JsonLd data={officeStructuredData} />
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-banc-dark-deep py-24 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1732983989209-ae2fa3d1a9fc?auto=format&fit=crop&w=1920&q=80"
            alt="Cuffley Office"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep via-banc-dark-deep/90 to-banc-dark-deep/70" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <Building2 className="h-4 w-4 text-banc-sky" />
                <span className="text-sm font-medium text-white/80">Head Office</span>
              </div>
              
              <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl tracking-tight">
                Cuffley Office
              </h1>
              
              <p className="mt-6 text-lg text-white/70 leading-relaxed">
                Our flagship office in the heart of Cuffley village, serving the local community 
                and surrounding Hertfordshire areas with expert property services.
              </p>
              
              {/* Quick contact info */}
              <div className="mt-8 space-y-4">
                <a href={BANC_CONTACT.callHref} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-banc-sky/20 flex items-center justify-center group-hover:bg-banc-sky/30 transition-colors">
                    <Phone className="h-5 w-5 text-banc-sky" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Call us</p>
                    <p className="text-lg font-semibold text-white group-hover:text-banc-sky transition-colors">{BANC_CONTACT.displayPhone}</p>
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
                    <p className="text-sm text-white/50">Visit us</p>
                    <p className="text-lg font-semibold text-white">1 Station Road, Cuffley, EN6 4HU</p>
                  </div>
                </div>
              </div>
              
              {/* CTA buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <a 
                  href="https://maps.google.com/?q=1+Station+Road+Cuffley+EN6+4HU" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button className="bg-banc-sky hover:bg-banc-sky-dark text-white px-6">
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Directions
                  </Button>
                </a>
                <Link href="#appointment">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 px-6">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Map placeholder - using static image for now */}
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2468.775123456789!2d-0.1083!3d51.7079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876383e5f5f5f5f%3A0x5f5f5f5f5f5f5f5f!2s1%20Station%20Rd%2C%20Cuffley%2C%20Potters%20Bar%20EN6%204HU!5e0!3m2!1sen!2suk!4v1234567890"
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

      {/* Office Info Grid */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Opening Hours */}
            <div className="bg-white rounded-2xl p-8 border border-banc-line/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-banc-sky" />
                </div>
                <h2 className="text-xl font-semibold text-banc-dark-deep">Opening Hours</h2>
              </div>
              
              <div className="space-y-3">
                {openingHours.map((item) => (
                  <div key={item.day} className="flex justify-between items-center py-2 border-b border-banc-line/20 last:border-0">
                    <span className="text-banc-dark-mid font-medium">{item.day}</span>
                    <span className={`${item.hours === 'Closed' ? 'text-banc-grey' : 'text-banc-sky font-semibold'}`}>
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Parking & Transport */}
            <div className="bg-white rounded-2xl p-8 border border-banc-line/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center">
                  <Car className="h-6 w-6 text-banc-sky" />
                </div>
                <h2 className="text-xl font-semibold text-banc-dark-deep">Parking & Transport</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Car className="h-5 w-5 text-banc-sky flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-banc-dark-deep">Free Parking</p>
                    <p className="text-sm text-banc-grey">Free parking available directly outside our office on Station Road</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Train className="h-5 w-5 text-banc-sky flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-banc-dark-deep">Train Station</p>
                    <p className="text-sm text-banc-grey">Cuffley Station is just a 2-minute walk from our office</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Navigation className="h-5 w-5 text-banc-sky flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-banc-dark-deep">Easy Access</p>
                    <p className="text-sm text-banc-grey">Located in the centre of Cuffley village, easy to find</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Areas We Cover */}
            <div className="bg-white rounded-2xl p-8 border border-banc-line/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-banc-sky" />
                </div>
                <h2 className="text-xl font-semibold text-banc-dark-deep">Areas We Cover</h2>
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
              <p className="mt-4 text-sm text-banc-grey">
                And many more surrounding Hertfordshire and North London areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-28 bg-banc-dark-deep">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Users className="h-4 w-4 text-banc-sky" />
              <span className="text-sm font-medium text-white/80">Our Team</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-white">
              Meet the Cuffley Team
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Our experienced professionals are here to help you with all your property needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-banc-sky/50 transition-colors group">
                <div className="relative h-64 overflow-hidden">
                  <Image 
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                  <p className="text-banc-sky text-sm">{member.role}</p>
                  <div className="mt-4 space-y-2">
                    <a href={`tel:${member.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-banc-sky transition-colors">
                      <Phone className="h-4 w-4" />
                      {member.phone}
                    </a>
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-banc-sky transition-colors">
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

      {/* Book Appointment Section */}
      <section id="appointment" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-banc-sky/10 border border-banc-sky/20 mb-6">
                <Calendar className="h-4 w-4 text-banc-sky" />
                <span className="text-sm font-medium text-banc-sky-dark">Book an Appointment</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-semibold text-banc-dark-deep">
                Visit Our Cuffley Office
              </h2>
              <p className="mt-4 text-lg text-banc-grey">
                Book a free, no-obligation appointment to discuss your property needs. 
                Whether you&apos;re selling, letting, buying, or renting, we&apos;re here to help.
              </p>
              
              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-banc-sky" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-banc-dark-deep">Free Valuation</h3>
                    <p className="text-sm text-banc-grey">Get an accurate market appraisal of your property with no obligation.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-banc-sky" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-banc-dark-deep">Expert Advice</h3>
                    <p className="text-sm text-banc-grey">Speak directly with our experienced directors and senior negotiators.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-banc-sky/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-banc-sky" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-banc-dark-deep">Flexible Times</h3>
                    <p className="text-sm text-banc-grey">We offer appointments including evenings and weekends to suit your schedule.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Form */}
            <div className="bg-white rounded-2xl p-8 border border-banc-line/30 shadow-lg">
              <h3 className="text-xl font-semibold text-banc-dark-deep mb-6">Request an Appointment</h3>
              
              <form className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-banc-dark-mid mb-2">First Name *</label>
                    <Input 
                      placeholder="John"
                      className="h-12 border-banc-line focus:border-banc-sky focus:ring-banc-sky/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-banc-dark-mid mb-2">Last Name *</label>
                    <Input 
                      placeholder="Smith"
                      className="h-12 border-banc-line focus:border-banc-sky focus:ring-banc-sky/20"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-banc-dark-mid mb-2">Phone Number *</label>
                    <Input 
                      type="tel"
                      placeholder={BANC_CONTACT.displayPhone}
                      className="h-12 border-banc-line focus:border-banc-sky focus:ring-banc-sky/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-banc-dark-mid mb-2">Email Address *</label>
                    <Input 
                      type="email"
                      placeholder="john@example.com"
                      className="h-12 border-banc-line focus:border-banc-sky focus:ring-banc-sky/20"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-banc-dark-mid mb-2">Property Address (if applicable)</label>
                  <Input 
                    placeholder="1 Station Road, Cuffley, EN6 4HU"
                    className="h-12 border-banc-line focus:border-banc-sky focus:ring-banc-sky/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-banc-dark-mid mb-2">What would you like to discuss? *</label>
                  <select 
                    className="w-full h-12 px-4 rounded-lg border border-banc-line focus:border-banc-sky focus:ring-2 focus:ring-banc-sky/20 bg-white text-banc-dark-mid"
                    required
                  >
                    <option value="">Select a service...</option>
                    <option value="valuation">Free Property Valuation</option>
                    <option value="selling">Selling My Property</option>
                    <option value="letting">Letting My Property</option>
                    <option value="buying">Buying a Property</option>
                    <option value="renting">Renting a Property</option>
                    <option value="management">Property Management</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-banc-dark-mid mb-2">Preferred Date & Time</label>
                  <Input 
                    type="datetime-local"
                    className="h-12 border-banc-line focus:border-banc-sky focus:ring-banc-sky/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-banc-dark-mid mb-2">Additional Message</label>
                  <Textarea 
                    placeholder="Tell us more about your requirements..."
                    rows={4}
                    className="border-banc-line focus:border-banc-sky focus:ring-banc-sky/20 resize-none"
                  />
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-banc-grey-pale rounded-xl">
                  <Checkbox 
                    id="privacy-cuffley"
                    required
                    className="mt-0.5 border-banc-line data-[state=checked]:bg-banc-sky data-[state=checked]:border-banc-sky"
                  />
                  <label htmlFor="privacy-cuffley" className="text-sm text-banc-grey leading-relaxed">
                    I agree to Banc Property Group contacting me about my enquiry. 
                    Read our <Link href="/privacy" className="text-banc-sky hover:underline">Privacy Policy</Link>.
                  </label>
                </div>
                
                <Button type="submit" className="w-full h-12 bg-banc-sky hover:bg-banc-sky-dark text-white font-semibold">
                  Request Appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
