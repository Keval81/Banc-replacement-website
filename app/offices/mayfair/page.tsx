import type { Metadata } from "next";
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
  Building2,
  Crown
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Mayfair Office | Banc Property Group",
  description: "Visit our Mayfair office in the heart of London's luxury property district. Expert estate agents specialising in prime central London properties.",
  keywords: "mayfair estate agent, london property agent, prime central london, luxury property mayfair, banc mayfair",
};

// Team members at Mayfair office
const teamMembers = [
  {
    name: "Nitesh Bheda",
    role: "Director - London",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    phone: "07850 082541",
    email: "nitesh@bancproperty.com"
  },
  {
    name: "Andrew Crump",
    role: "Director - Premier Homes",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    phone: "07565 543153",
    email: "andrew@bancproperty.com"
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
    <div className="min-h-screen bg-[#F4F3F1]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-[#1A1917] py-24 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=80"
            alt="Mayfair Office"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917] via-[#1A1917]/90 to-[#1A1917]/70" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <Crown className="h-4 w-4 text-[#4AC8E8]" />
                <span className="text-sm font-medium text-white/80">Premier Homes</span>
              </div>
              
              <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl tracking-tight">
                Mayfair Office
              </h1>
              <p className="mt-4 text-[#4AC8E8] font-medium">
                Premium Property Specialists
              </p>
              
              <p className="mt-6 text-lg text-white/70 leading-relaxed">
                Our Mayfair office specialises in prime central London properties, 
                discreet marketing for high-value homes, and bespoke services for 
                discerning buyers and sellers in London's most prestigious locations.
              </p>
              
              {/* Quick contact info */}
              <div className="mt-8 space-y-4">
                <a href="tel:02033688972" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center group-hover:bg-[#4AC8E8]/30 transition-colors">
                    <Phone className="h-5 w-5 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Call us</p>
                    <p className="text-lg font-semibold text-white group-hover:text-[#4AC8E8] transition-colors">0203 368 8972</p>
                  </div>
                </a>

                <a href="mailto:info@bancproperty.com" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center group-hover:bg-[#4AC8E8]/30 transition-colors">
                    <Mail className="h-5 w-5 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Email us</p>
                    <p className="text-lg font-semibold text-white group-hover:text-[#4AC8E8] transition-colors">info@bancproperty.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[#4AC8E8]" />
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
                  <Button className="bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white px-6">
                    <Crown className="mr-2 h-4 w-4" />
                    Premier Homes
                  </Button>
                </Link>
                <Link href="#appointment">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 px-6">
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
      <section className="bg-gradient-to-r from-[#4AC8E8] to-[#1A9BBF] py-12">
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
              <Button className="bg-white text-[#4AC8E8] hover:bg-white/90 px-6">
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
            <div className="bg-white rounded-2xl p-8 border border-[#E0DFDC]/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1A1917]">Opening Hours</h2>
              </div>
              
              <div className="space-y-3">
                {openingHours.map((item) => (
                  <div key={item.day} className="flex justify-between items-center py-2 border-b border-[#E0DFDC]/20 last:border-0">
                    <span className="text-[#3D3B37] font-medium">{item.day}</span>
                    <span className={`${item.hours === 'Closed' ? 'text-[#8A8880]' : 'text-[#4AC8E8] font-semibold'}`}>
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-[#8A8880]">
                Private appointments available outside standard hours.
              </p>
            </div>
            
            {/* Location & Access */}
            <div className="bg-white rounded-2xl p-8 border border-[#E0DFDC]/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center">
                  <Train className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1A1917]">Location & Access</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Train className="h-5 w-5 text-[#4AC8E8] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1A1917]">Tube Stations</p>
                    <p className="text-sm text-[#8A8880]">Green Park, Hyde Park Corner, and Bond Street stations within walking distance</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Car className="h-5 w-5 text-[#4AC8E8] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1A1917]">Parking</p>
                    <p className="text-sm text-[#8A8880]">Metered street parking and nearby NCP car parks available</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Navigation className="h-5 w-5 text-[#4AC8E8] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1A1917]">Private Consultations</p>
                    <p className="text-sm text-[#8A8880]">Meetings by appointment at our Mayfair location or at your property</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Areas We Cover */}
            <div className="bg-white rounded-2xl p-8 border border-[#E0DFDC]/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-[#4AC8E8]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1A1917]">Prime Areas Covered</h2>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {areasCovered.map((area) => (
                  <span 
                    key={area}
                    className="px-3 py-1.5 rounded-full bg-[#F4F3F1] text-sm text-[#3D3B37] border border-[#E0DFDC]/30"
                  >
                    {area}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-[#8A8880]">
                Covering all prime central London locations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premier Services Section */}
      <section className="py-20 lg:py-28 bg-[#1A1917]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Crown className="h-4 w-4 text-[#4AC8E8]" />
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
              <div key={service.title} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#4AC8E8]/50 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-[#4AC8E8]/20 flex items-center justify-center mb-6">
                  <service.icon className="h-7 w-7 text-[#4AC8E8]" />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-6">
              <Users className="h-4 w-4 text-[#4AC8E8]" />
              <span className="text-sm font-medium text-[#1A9BBF]">Our London Team</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-[#1A1917]">
              Meet the Mayfair Team
            </h2>
            <p className="mt-4 text-lg text-[#8A8880]">
              Our directors personally handle all premier properties, ensuring the highest level of service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl overflow-hidden border border-[#E0DFDC]/30 shadow-sm hover:shadow-lg transition-shadow group">
                <div className="relative h-72 overflow-hidden">
                  <Image 
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#1A1917]">{member.name}</h3>
                  <p className="text-[#4AC8E8] font-medium">{member.role}</p>
                  <div className="mt-4 space-y-2">
                    <a href={`tel:${member.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm text-[#8A8880] hover:text-[#4AC8E8] transition-colors">
                      <Phone className="h-4 w-4" />
                      {member.phone}
                    </a>
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-[#8A8880] hover:text-[#4AC8E8] transition-colors">
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
      <section id="appointment" className="py-20 lg:py-28 bg-[#F4F3F1]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4AC8E8]/10 border border-[#4AC8E8]/20 mb-6">
                <Crown className="h-4 w-4 text-[#4AC8E8]" />
                <span className="text-sm font-medium text-[#1A9BBF]">Private Consultation</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-semibold text-[#1A1917]">
                Arrange a Private Consultation
              </h2>
              <p className="mt-4 text-lg text-[#8A8880]">
                For properties valued at £1 million and above, we offer a bespoke, 
                discreet service tailored to your requirements.
              </p>
              
              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1917]">Discretion Assured</h3>
                    <p className="text-sm text-[#8A8880]">Private valuations and off-market opportunities available.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1917]">Bespoke Marketing</h3>
                    <p className="text-sm text-[#8A8880]">Tailored campaigns designed specifically for your property.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#4AC8E8]/10 flex items-center justify-center flex-shrink-0">
                    <Navigation className="h-6 w-6 text-[#4AC8E8]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1917]">Global Reach</h3>
                    <p className="text-sm text-[#8A8880]">Access to qualified buyers from around the world.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Form */}
            <div className="bg-white rounded-2xl p-8 border border-[#E0DFDC]/30 shadow-lg">
              <h3 className="text-xl font-semibold text-[#1A1917] mb-2">Request Private Consultation</h3>
              <p className="text-sm text-[#8A8880] mb-6">
                All enquiries are treated with the strictest confidence.
              </p>
              
              <form className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D3B37] mb-2">First Name *</label>
                    <Input 
                      placeholder="John"
                      className="h-12 border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D3B37] mb-2">Last Name *</label>
                    <Input 
                      placeholder="Smith"
                      className="h-12 border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D3B37] mb-2">Phone Number *</label>
                    <Input 
                      type="tel"
                      placeholder="+44 20 7123 4567"
                      className="h-12 border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D3B37] mb-2">Email Address *</label>
                    <Input 
                      type="email"
                      placeholder="john@example.com"
                      className="h-12 border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3D3B37] mb-2">Property Address</label>
                  <Input 
                    placeholder="Property address or area of interest"
                    className="h-12 border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3D3B37] mb-2">Estimated Property Value</label>
                  <select 
                    className="w-full h-12 px-4 rounded-lg border border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-2 focus:ring-[#4AC8E8]/20 bg-white text-[#3D3B37]"
                  >
                    <option value="">Select value range...</option>
                    <option value="1m-2m">£1,000,000 - £2,000,000</option>
                    <option value="2m-3m">£2,000,000 - £3,000,000</option>
                    <option value="3m-5m">£3,000,000 - £5,000,000</option>
                    <option value="5m+">£5,000,000+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3D3B37] mb-2">Message</label>
                  <Textarea 
                    placeholder="Please provide any additional details about your requirements..."
                    rows={4}
                    className="border-[#E0DFDC] focus:border-[#4AC8E8] focus:ring-[#4AC8E8]/20 resize-none"
                  />
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-[#F4F3F1] rounded-xl">
                  <Checkbox 
                    id="privacy-mayfair"
                    required
                    className="mt-0.5 border-[#E0DFDC] data-[state=checked]:bg-[#4AC8E8] data-[state=checked]:border-[#4AC8E8]"
                  />
                  <label htmlFor="privacy-mayfair" className="text-sm text-[#8A8880] leading-relaxed">
                    I agree to Banc Property Group contacting me about my enquiry. 
                    All information will be treated confidentially. 
                    Read our <Link href="/privacy" className="text-[#4AC8E8] hover:underline">Privacy Policy</Link>.
                  </label>
                </div>
                
                <Button type="submit" className="w-full h-12 bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white font-semibold">
                  Request Private Consultation
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
