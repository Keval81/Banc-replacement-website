import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Quote, MapPin } from "lucide-react";
import { BANC_REVIEWS, type Review } from "@/lib/reviews";

export const metadata: Metadata = withPageDefaults("/reviews", {
  title: "Reviews | Banc Property Services",
  description: "Read what our clients say about Banc Property Group. Estate agency service across Cuffley, Cheshunt, Goffs Oak and beyond.",
});

export const revalidate = 3600;



function ReviewTypeBadge({ type }: { type?: string }) {
  if (!type) return null;
  
  const styles = {
    sales: "bg-emerald-50 text-emerald-700 border-emerald-200",
    lettings: "bg-blue-50 text-blue-700 border-blue-200",
    landlord: "bg-purple-50 text-purple-700 border-purple-200"
  };
  
  const labels = {
    sales: "Sales",
    lettings: "Lettings",
    landlord: "Landlord"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[type as keyof typeof styles]}`}>
      {labels[type as keyof typeof labels]}
    </span>
  );
}

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />
      
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-banc-dark-deep">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1713656275767-e8140c59acca?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep/80 via-banc-dark-deep/60 to-banc-dark-deep/40" />
        </div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-banc-dark-deep/50" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <div className="text-center">
            {/* Title */}
            <h1 className="text-5xl font-semibold text-white sm:text-6xl lg:text-7xl tracking-tight">
              Reviews
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              Take a look at what our clients have to say about us.
            </p>
          </div>
        </div>
        
        {/* Bottom Curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60L1440 60L1440 0C1440 0 1140 60 720 60C300 60 0 0 0 0L0 60Z" fill="#F4F3F1"/>
          </svg>
        </div>
      </section>

      {/* Reviews Grid Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-banc-sky/10 text-banc-focus text-sm font-medium mb-4">
              Client Testimonials
            </span>
            <h2 className="text-3xl lg:text-4xl font-semibold text-banc-dark-deep">
              Trusted by Homeowners Across Hertfordshire
            </h2>
          </div>
          
          {/* Staggered 2-Column Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {BANC_REVIEWS.map((review, index) => (
              <div 
                key={index} 
                className={`group relative bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(29,191,221,0.12)] transition-all duration-300 ease-out hover:-translate-y-1 ${
                  index % 2 === 1 ? 'md:mt-8' : ''
                }`}
              >
                {/* Quote Icon - Large and prominent */}
                <div className="absolute -top-3 -left-2">
                  <div className="w-14 h-14 rounded-xl bg-banc-sky flex items-center justify-center shadow-lg shadow-banc-sky/20 group-hover:scale-110 transition-transform duration-300">
                    <Quote className="h-7 w-7 text-banc-dark-deep fill-white" />
                  </div>
                </div>
                
                {/* Type Badge */}
                <div className="flex justify-end mb-6">
                  <ReviewTypeBadge type={review.type} />
                </div>
                
                {/* Content */}
                <div className="mt-2">
                  {/* Headline */}
                  <h3 className="text-xl font-semibold text-banc-dark-deep leading-snug mb-4">
                    {review.title}
                  </h3>
                  
                  {/* Testimonial Text */}
                  <blockquote className="text-banc-muted-readable leading-relaxed text-base">
                    &quot;{review.text}&quot;
                  </blockquote>
                  
                  {/* Author */}
                  <div className="mt-6 pt-6 border-t border-banc-line">
                    <p className="font-semibold text-banc-dark-deep">{review.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-banc-focus" />
                      <p className="text-sm text-banc-muted-readable">{review.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valuation CTA Section */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-3xl bg-banc-dark-deep p-12 lg:p-16">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-banc-sky/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-banc-sky/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative text-center">
              <h2 className="text-3xl lg:text-4xl font-semibold text-white">
                Ready to Experience It Yourself?
              </h2>
              <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
                At Banc Property, we think very highly of our clients and we are delighted to say
                they seem to feel the same about us. Let&apos;s talk about your move.
              </p>

              <a
                href="/valuation"
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-banc-focus px-8 py-4 text-white font-semibold hover:bg-banc-focus-hover transition-colors duration-200 shadow-lg shadow-banc-sky/25 hover:shadow-banc-sky/40"
              >
                Request a Valuation
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
