import type { CSSProperties } from "react";

import type { Metadata } from "next";
import Image from "next/image";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SimpleEnquiryForm } from "@/components/forms/SimpleEnquiryForm";
import type { SimpleEnquiryField } from "@/lib/simple-enquiry";
import { TeamHeroMedia } from "@/components/team/TeamHeroMedia";
import { Phone, Mail, Smartphone, ArrowRight, MapPin } from "lucide-react";
import {
  actionPrimaryOnDark,
  actionSecondary,
  actionSecondaryOnDark,
  eyebrow,
  formPanel,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { BANC_CONTACT } from "@/lib/banc-contact";
import { getTeamPortrait } from "@/lib/team-media";

const APPLICATION_FIELDS: SimpleEnquiryField[] = [
  { name: "name", label: "Full Name", type: "text", placeholder: "John Smith", required: true },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: BANC_CONTACT.displayPhone, span: "half" },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com", required: true, span: "half" },
  {
    name: "message",
    label: "Your Message",
    type: "textarea",
    rows: 5,
    placeholder: "Tell us about yourself, your experience, and why you'd like to join the Banc team...",
    required: true,
  },
];

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
    portrait: getTeamPortrait("Nitesh Bheda"),
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
    portrait: getTeamPortrait("Andrew Crump"),
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
    portrait: getTeamPortrait("Vicki Glashier"),
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
    portrait: getTeamPortrait("Kay Stanley"),
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
      {/* The film is 16:9 and object-cover crops whatever the container does not
          match. At 76svh the box was ~2.1:1, so nearly a fifth of the landscape
          frame was cut top and bottom. A taller box brings the ratio closer to the
          film's and crops less away — the team sit further back without touching
          the footage. Desktop only: the portrait cut is already nearly all visible
          on a phone, and going taller there just adds empty pavement. */}
      <section className="relative min-h-[max(calc(100svh-3.5rem),770px)] overflow-hidden bg-banc-dark-deep lg:min-h-[92svh]">
        <TeamHeroMedia />
        {/* A flat 45% wash dimmed the clay as much as it helped the words. This
            weights the darkness where the copy actually sits — top-left — and
            lets the figures below keep their colour. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />

        {/* items-start, not items-end: the clay figures stand in the lower half of
            the frame, so a bottom-anchored title sat straight on top of them. */}
        <div className="relative mx-auto flex min-h-[max(calc(100svh-3.5rem),770px)] max-w-7xl items-start px-6 pb-16 pt-4 lg:min-h-[92svh] lg:px-10 lg:pt-24">
          <div className="max-w-4xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--banc-focus-dark)] lg:mb-5">
              Our people
            </p>
            <h1 className="font-display text-5xl font-light leading-[0.98] tracking-[-0.025em] text-white sm:text-6xl lg:text-7xl">
              {/* Two beats, not one line that wraps: the pause between them is
                  the whole point. CSS rather than framer-motion, which inlines
                  opacity:0 into the SSR markup and would strand the page title
                  invisible if the bundle never runs. */}
              <span
                className="banc-line-reveal block"
                style={{ "--banc-line-delay": "0.7s" } as CSSProperties}
              >
                Property is personal.
              </span>
              <span
                className="banc-line-reveal block"
                style={{ "--banc-line-delay": "1.5s" } as CSSProperties}
              >
                So are we.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg lg:mt-6">
              Four local specialists, decades of shared experience, and one standard:
              treat every move as if it were our own.
            </p>
            <a
              href="#team-roster"
              className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-white/50 text-sm font-medium text-white transition-colors duration-200 hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--banc-focus-dark)] focus-visible:ring-offset-4 focus-visible:ring-offset-banc-dark-deep"
            >
              Meet the team
              <ArrowRight className="h-4 w-4 rotate-90" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* Team Members Section - Alternating Layout */}
      <section id="team-roster" className={cn(sectionPadding, "scroll-mt-24")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>The people behind the move</p>
          <h2 className={cn(sectionHeading, "mt-3")}>Local knowledge, individual care.</h2>

          <div className="mt-7">
            {team.map((member, index) => (
              <article
                key={member.name}
                className={`group flex flex-col items-start gap-7 border-t border-banc-dark/15 py-10 lg:gap-16 lg:py-16 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Photo Column */}
                <div className="w-full lg:w-2/5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] border border-banc-line bg-banc-dark-deep">
                    <Image
                      src={member.portrait.src}
                      alt={`Claymation portrait of ${member.name}, ${member.role} at Banc Property Group`}
                      fill
                      sizes="(min-width: 1024px) 34vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-banc-dark-deep/90 px-5 py-4 text-white">
                      <span className="text-xs font-medium uppercase tracking-[0.15em]">
                        {member.role}
                      </span>
                      <span className="text-xs text-white/60" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")} / {String(team.length).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex w-full flex-col justify-center lg:w-3/5">
                  <h2 className="font-display text-3xl font-light tracking-tight text-banc-dark-deep lg:text-5xl">
                    {member.name}
                  </h2>
                  <div className="mt-3 flex items-center gap-2 text-banc-muted-readable">
                    <MapPin className="h-4 w-4 text-banc-focus" aria-hidden="true" />
                    <span className="text-sm">{member.location}</span>
                  </div>

                  {/* Bio paragraphs */}
                  <div className="mt-6 space-y-4 leading-relaxed text-banc-dark-mid">
                    {member.bio.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-base lg:text-[17px]">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Contact Details */}
                  <div className="mt-7 border-t border-banc-dark/15 pt-6">
                    <p className={cn(eyebrow, "mb-4")}>Get in Touch</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {member.phone && (
                        <a href={`tel:${member.phone.replace(/\s/g, '')}`} className={actionSecondary}>
                          <Phone className="h-4 w-4" aria-hidden="true" />
                          {member.phone}
                        </a>
                      )}
                      {member.mobile && (
                        <a href={`tel:${member.mobile.replace(/\s/g, '')}`} className={actionSecondary}>
                          <Smartphone className="h-4 w-4" aria-hidden="true" />
                          {member.mobile}
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className={actionSecondary}>
                          <Mail className="h-4 w-4" aria-hidden="true" />
                          {member.email}
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
      <section className={cn(sectionPadding, "border-t border-banc-dark/15")}>
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-7 lg:grid-cols-2 lg:gap-20">
            {/* Left Column - Content */}
            <div className="lg:sticky lg:top-32">
              <p className={eyebrow}>Careers</p>
              <h2 className={cn(sectionHeading, "mt-3")}>
                Looking To Join A Young Dynamic Property Company?
              </h2>

              <p className="mt-4 text-base leading-relaxed text-banc-muted-readable lg:text-lg">
                Would you like to join the Banc Property Team? We&apos;re always looking for talented
                individuals who share our passion for exceptional property service.
              </p>

              <div className="mt-7">
                <div className="border-t border-banc-dark/15 py-4">
                  <h3 className="font-semibold text-banc-dark-deep">Growth Opportunities</h3>
                  <p className="mt-1 text-sm text-banc-muted-readable">Develop your career in a supportive environment</p>
                </div>
                <div className="border-t border-banc-dark/15 py-4">
                  <h3 className="font-semibold text-banc-dark-deep">Local Expertise</h3>
                  <p className="mt-1 text-sm text-banc-muted-readable">Work in the heart of the Cuffley community</p>
                </div>
                <div className="border-t border-banc-dark/15 py-4">
                  <h3 className="font-semibold text-banc-dark-deep">Great Team</h3>
                  <p className="mt-1 text-sm text-banc-muted-readable">Join a passionate and experienced team</p>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className={formPanel}>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-banc-dark-deep">Apply Today</h3>
                <p className="mt-2 text-sm text-banc-muted-readable">Fill out the form below and we&apos;ll be in touch soon.</p>
              </div>

              <SimpleEnquiryForm
                fields={APPLICATION_FIELDS}
                subject="Career enquiry"
                intro="Career enquiry from the Meet the Team page."
                submitLabel="Submit Application"
                successTitle="Application received"
                successBody="Thank you for your interest in joining Banc. One of the team will be in touch."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <h2 className={sectionHeadingOnDark}>Ready to work with our team?</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            Get in touch today and let us help you with your property needs.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href="/contact" className={actionPrimaryOnDark}>
              Contact Us
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href={BANC_CONTACT.callHref} className={actionSecondaryOnDark}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              {BANC_CONTACT.displayPhone}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
