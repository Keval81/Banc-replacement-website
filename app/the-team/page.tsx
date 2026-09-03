import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Mail, Smartphone, Users, ArrowRight, MapPin } from "lucide-react";
import { BANC_CONTACT } from "@/lib/banc-contact";

export const metadata: Metadata = withPageDefaults("/the-team", {
  title: "Meet The Team | Banc Property Group",
  description: "Meet the awesome team at Banc Property Group. Our experienced professionals are here to help you with all your property needs in Cuffley and surrounding areas.",
});

export const revalidate = 3600;

const team = [
  {
    name: "Nitesh Bheda",
    role: "Director",
    bio: [
      "I'm Nitesh, director of Banc Property Group. I am passionate and dedicated to making a positive contribution in what is an important milestone in peoples lives. I have, and always will, put customer satisfaction above anything, and as such am driven to exceed people's perceptions of what a good agent should be.",
      "I could tell you my hopes of becoming a Premier League footballer were cut short due to a 'knee injury', or my Hollywood career was lost when I missed a cast screening, or even that being an estate agent has been all I wanted to do since I was a kid but it wouldn't be entirely accurate. The truth is that I fell into estate agency over 15 years ago and after the first 3 months I knew I had found something I loved doing and was really good at. I've worked locally and in London in roles ranging from trainee negotiator to branch manager for some of the leading corporate and independent agents. I have seen the good and bad and I now feel the time is right to provide a truly great service.",
      "Having lived in the local area and raising a young family I feel well placed to highlight all the wonderful activities and amenities the area has to offer.",
      "Outside of work, I have two beautiful children and a very patient better half who motivates me each day and keeps me grounded and busy! I'm a huge United and sports fan, albeit more armchair these days since my 'knee injury'! I love going to live music events, family days out and catching up with the latest sports news on Talk sport and enjoy good food followed by a good movie or better still the latest box sets."
    ],
    initials: "NB",
    phone: BANC_CONTACT.displayPhone,
    mobile: "07850 082541",
    email: "nitesh@bancproperty.com",
    location: "Cuffley Office"
  },
  {
    name: "Andrew Crump",
    role: "Director",
    bio: [
      "I'm Andrew Crump, director of Banc Property Group. Some of you will already know me from having bought and sold houses through my previous workplaces in the local areas. When I set out in this business 25 years ago, my ambition was to one day have my very own estate agents in Cuffley, an area I call home. I have an unrivalled knowledge in the local areas and have built up exceptional relationships with local residents which I continue to do. I pride myself on being an agent you really can trust, and one who will go the extra mile to deliver a service you will be 100% satisfied with.",
      "Personally, I'm a huge sports fan and have represented both Cuffley Football Club and Cuffley Tennis Club since I was a kid and continue to play tennis. I support a fantastic football team but I couldn't possibly tell you which one, instead you will need to pop in and ask me! I have two wonderful young children who keep my on my toes every day and a very supportive partner!",
      "In the winter I love nothing more than hitting the Italian Aosta region on my snow board and enjoy the odd glass of red wine, and in the summer I love to visit our family apartment in the sunny Mediterranean of Menorca. My family have been in Cuffley nearly 50 years, and I started my education at Cuffley JMI School where I have many happy memories.",
      "I also head up Banc Premier Homes being your dedicated point of contact from viewings right through to completion. I have vast experience in selling some of the finest homes locally, we can offer bespoke exclusive marketing to tailor each and every prestigious home."
    ],
    initials: "AC",
    phone: BANC_CONTACT.displayPhone,
    mobile: "07565 543153",
    email: "andrew@bancproperty.com",
    location: "Cuffley Office"
  },
  {
    name: "Vicki Glashier",
    role: "Office Manager",
    bio: [
      "I am Vicki the Office Manager here at Banc Property Group.",
      "I have several years' experience in office administration and personal assistant roles and am delighted to have joined the BANC team 5 years ago. As the Office Manager my role is varied and fulfilling.",
      "I am involved in bringing properties to market, liaising with clients in those initial stages, and ensuring the smooth operation of the Cuffley office. I also work with our Managing Directors to support the drive for growth and development of Banc Property Group and strive for greatness."
    ],
    initials: "VG",
    phone: BANC_CONTACT.displayPhone,
    email: "vicki@bancproperty.com",
    location: "Cuffley Office"
  },
  {
    name: "Kay Stanley",
    role: "Sales Progressor",
    bio: [
      "I'm Kay the Sales Progressor here at Banc Property Group.",
      "I became an Estate Agent in 1988, at my peak I became Area Manager with only a few short breaks having my two girls who are now young adults with their own careers. I always said I would write a book on my experiences and challenges.",
      "Living close to the office, my current role as Sales Progression I deal with solicitors, surveyors, always aiming for the best result for both vendors and purchasers also working closely with both my managing directors and colleges.",
      "Weekends, I love to watch rugby with my partner as we are season ticket holders for Saracens Rugby Team.",
      "It's a pleasure working at Banc who are the best local Estate Agents based on performance and board presence."
    ],
    initials: "KS",
    phone: BANC_CONTACT.displayPhone,
    email: "kay@bancproperty.com",
    location: "Cuffley Office"
  }
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-banc-dark-deep py-24 lg:py-36 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep/80 via-banc-dark-deep/60 to-banc-dark-deep/40" />
        </div>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-banc-sky rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-banc-sky rounded-full blur-[128px]" />
        </div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Users className="h-4 w-4 text-banc-sky" />
              <span className="text-sm font-medium text-white/80">Our People</span>
            </div>
            
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl tracking-tight">
              Meet The Team
            </h1>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-banc-sky" />
              <p className="text-lg text-white/70 font-medium">
                Meet the awesome team at Banc
              </p>
              <div className="h-px w-12 bg-banc-sky" />
            </div>
            <p className="mt-6 text-white/60 max-w-2xl mx-auto leading-relaxed">
              Our experienced professionals bring decades of combined expertise in property, 
              combining local knowledge with a passion for exceptional service.
            </p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-white/40 uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-banc-sky to-transparent" />
        </div>
      </section>

      {/* Team Members Section - Alternating Layout */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="space-y-24 lg:space-y-32">
            {team.map((member, index) => (
              <article 
                key={member.name}
                className={`relative flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-start group`}
              >
                {/* Visual connector line for desktop */}
                <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-gradient-to-b from-transparent via-banc-line to-transparent" 
                  style={{ height: index === team.length - 1 ? '50%' : 'calc(100% + 8rem)' }}
                />
                
                {/* Number indicator */}
                <div className="hidden lg:flex absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-2 border-banc-sky items-center justify-center z-10 shadow-lg">
                  <span className="text-lg font-bold text-banc-focus">0{index + 1}</span>
                </div>
                
                {/* Photo Column */}
                <div className="w-full lg:w-2/5">
                  <div className="relative">
                    {/* Decorative frame */}
                    <div className={`absolute -inset-4 border-2 border-banc-sky/20 rounded-3xl ${index % 2 === 0 ? '-rotate-2' : 'rotate-2'} transition-transform duration-500 group-hover:rotate-0`} />
                    
                    {/* Monogram container — real headshots to follow from the client */}
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-banc-dark-deep">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-banc-sky/10 rounded-full blur-3xl" />
                        <span
                          aria-hidden="true"
                          className="relative text-8xl font-bold tracking-tight text-banc-sky transition-transform duration-700 group-hover:scale-105"
                        >
                          {member.initials}
                        </span>
                      </div>

                      {/* Role badge */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-banc-focus text-white text-xs font-semibold uppercase tracking-wider">
                          {member.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content Column */}
                <div className="w-full lg:w-3/5 flex flex-col justify-center">
                  {/* Name and Location */}
                  <div className="mb-6">
                    <h2 className="text-3xl lg:text-4xl font-semibold text-banc-dark-deep mb-2">
                      {member.name}
                    </h2>
                    <div className="flex items-center gap-2 text-banc-muted-readable">
                      <MapPin className="h-4 w-4 text-banc-focus" />
                      <span className="text-sm">{member.location}</span>
                    </div>
                  </div>
                  
                  {/* Decorative line */}
                  <div className="w-16 h-1 bg-banc-sky rounded-full mb-6" />
                  
                  {/* Bio paragraphs */}
                  <div className="space-y-4 text-banc-dark-mid leading-relaxed">
                    {member.bio.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-base lg:text-[17px]">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  
                  {/* Contact Details */}
                  <div className="mt-8 pt-6 border-t border-banc-line/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-banc-muted-readable mb-4">
                      Get in Touch
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {member.phone && (
                        <a 
                          href={`tel:${member.phone.replace(/\s/g, '')}`} 
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-banc-line text-banc-dark-deep hover:border-banc-sky hover:text-banc-sky transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Phone className="h-4 w-4" />
                          <span className="text-sm font-medium">{member.phone}</span>
                        </a>
                      )}
                      {member.mobile && (
                        <a 
                          href={`tel:${member.mobile.replace(/\s/g, '')}`} 
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-banc-line text-banc-dark-deep hover:border-banc-sky hover:text-banc-sky transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Smartphone className="h-4 w-4" />
                          <span className="text-sm font-medium">{member.mobile}</span>
                        </a>
                      )}
                      {member.email && (
                        <a 
                          href={`mailto:${member.email}`} 
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-banc-line text-banc-dark-deep hover:border-banc-sky hover:text-banc-sky transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Mail className="h-4 w-4" />
                          <span className="text-sm font-medium">{member.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Team Section */}
      <section className="relative py-20 lg:py-28 bg-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-banc-grey-pale to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-banc-sky/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left Column - Content */}
            <div className="lg:sticky lg:top-32">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-banc-sky/10 border border-banc-sky/20 mb-6">
                <Users className="h-4 w-4 text-banc-focus" />
                <span className="text-sm font-medium text-banc-focus">Careers</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-banc-dark-deep leading-tight">
                Looking To Join A <span className="text-banc-focus">Young Dynamic</span> Property Company?
              </h2>
              
              <p className="mt-6 text-lg text-banc-muted-readable leading-relaxed">
                Would you like to join the Banc Property Team? We&apos;re always looking for talented 
                individuals who share our passion for exceptional property service.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-banc-sky/10 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="h-5 w-5 text-banc-focus" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-banc-dark-deep">Growth Opportunities</h3>
                    <p className="text-sm text-banc-muted-readable">Develop your career in a supportive environment</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-banc-sky/10 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="h-5 w-5 text-banc-focus" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-banc-dark-deep">Local Expertise</h3>
                    <p className="text-sm text-banc-muted-readable">Work in the heart of the Cuffley community</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-banc-sky/10 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="h-5 w-5 text-banc-focus" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-banc-dark-deep">Great Team</h3>
                    <p className="text-sm text-banc-muted-readable">Join a passionate and experienced team</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Form */}
            <div className="relative">
              {/* Form card */}
              <div className="bg-banc-grey-pale rounded-3xl p-8 lg:p-10 shadow-xl border border-banc-line/30">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-banc-dark-deep mb-2">Apply Today</h3>
                  <p className="text-banc-muted-readable text-sm">Fill out the form below and we&apos;ll be in touch soon.</p>
                </div>
                
                <form className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-banc-dark-mid mb-2">
                      Full Name <span className="text-banc-focus">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Smith"
                      className="w-full h-12 bg-white border-banc-line focus:border-banc-sky focus:ring-2 focus:ring-banc-sky/20 rounded-xl transition-all"
                      required
                    />
                  </div>
                  
                  {/* Phone & Email Row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-banc-dark-mid mb-2">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={BANC_CONTACT.displayPhone}
                        className="w-full h-12 bg-white border-banc-line focus:border-banc-sky focus:ring-2 focus:ring-banc-sky/20 rounded-xl transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-banc-dark-mid mb-2">
                        Email Address <span className="text-banc-focus">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        className="w-full h-12 bg-white border-banc-line focus:border-banc-sky focus:ring-2 focus:ring-banc-sky/20 rounded-xl transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-banc-dark-mid mb-2">
                      Your Message <span className="text-banc-focus">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about yourself, your experience, and why you'd like to join the Banc team..."
                      rows={5}
                      className="w-full bg-white border-banc-line focus:border-banc-sky focus:ring-2 focus:ring-banc-sky/20 rounded-xl transition-all resize-none"
                      required
                    />
                  </div>
                  
                  {/* Privacy Checkbox */}
                  <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-banc-line/50">
                    <Checkbox 
                      id="privacy" 
                      name="privacy"
                      required
                      className="mt-0.5 border-banc-line data-[state=checked]:bg-banc-sky data-[state=checked]:border-banc-sky rounded"
                    />
                    <label htmlFor="privacy" className="text-sm text-banc-muted-readable leading-relaxed cursor-pointer">
                      Please tick this box if you are happy for us to contact you via phone and email. 
                      You can view our full <a href="/privacy" className="text-banc-focus hover:underline">privacy policy</a> on our website.
                    </label>
                  </div>
                  
                  {/* Submit Button */}
                  <Button 
                    type="submit"
                    className="w-full h-14 bg-banc-focus hover:bg-banc-focus-hover text-white text-base font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-banc-sky/25 hover:shadow-xl hover:shadow-banc-sky/30"
                  >
                    Submit Application
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </form>
              </div>
              
              {/* Decorative element */}
              <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full rounded-3xl bg-banc-sky/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-banc-dark-deep py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            <div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white">
                Ready to work with our team?
              </h3>
              <p className="mt-2 text-white/60">
                Get in touch today and let us help you with your property needs.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={BANC_CONTACT.callHref} 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-banc-focus hover:bg-banc-focus-hover text-white font-semibold rounded-xl transition-all duration-300"
              >
                <Phone className="h-5 w-5" />
                {BANC_CONTACT.displayPhone}
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-banc-grey-pale text-banc-dark-deep font-semibold rounded-xl transition-all duration-300"
              >
                Contact Us
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
