import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Star, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Reviews | Banc Property Services",
  description: "Read what our clients say about Banc Property Group. 5-star rated estate agency service across Cuffley, Mayfair and beyond.",
};

const reviews = [
  {
    name: "Suna Ramadan",
    location: "First-time Buyer",
    rating: 5,
    text: "It was such a pleasure to work with everyone at Banc property group for the purchase of our first home. Everyone was so kind and friendly and really helped us along with the process as first time buyers. We completed on the house within two months and couldn't be happier, thank you for the diligence and attention to detail from the Banc Team!"
  },
  {
    name: "Sophia Harding",
    location: "Cuffley",
    rating: 5,
    text: "Banc delivered a seamless, premium service from valuation to completion. The marketing was flawless and we achieved above asking price within the first week."
  },
  {
    name: "James Whittaker",
    location: "Hadley Wood",
    rating: 5,
    text: "Outstanding communication and local knowledge. We achieved a record price within two weeks. The team's professionalism throughout was exceptional."
  },
  {
    name: "Amelia Roth",
    location: "Mayfair",
    rating: 5,
    text: "The Premier Homes team handled every detail with discretion and care. Truly best-in-class service for high-value property transactions."
  },
  {
    name: "Michael Chen",
    location: "Landlord",
    rating: 5,
    text: "Banc's property management service has been outstanding. They found quality tenants quickly and handle everything professionally. Highly recommended."
  },
  {
    name: "Sarah Williams",
    location: "Seller",
    rating: 5,
    text: "From valuation to completion, the team at Banc were fantastic. Their local knowledge of Cuffley is unmatched and they kept me informed every step of the way."
  }
];

export default function ReviewsPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-8 w-8 fill-[#1DBFDD] text-[#1DBFDD]" />
            ))}
          </div>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Client Reviews
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">
            We are proud of our 5-star reputation. Here's what our clients say about 
            working with Banc Property Group.
          </p>
          <div className="mt-8 flex justify-center gap-8 text-white">
            <div>
              <p className="text-4xl font-bold text-[#1DBFDD]">5.0</p>
              <p className="text-sm text-white/70">Average Rating</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#1DBFDD]">50+</p>
              <p className="text-sm text-white/70">Google Reviews</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#1DBFDD]">100%</p>
              <p className="text-sm text-white/70">Would Recommend</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <div key={index} className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6">
                <Quote className="h-8 w-8 text-[#1DBFDD] mb-4" />
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#1DBFDD] text-[#1DBFDD]" />
                  ))}
                </div>
                <p className="text-[#6B7280] mb-6">"{review.text}"</p>
                <div>
                  <p className="font-semibold">{review.name}</p>
                  <p className="text-sm text-[#6B7280]">{review.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews CTA */}
      <section className="bg-[#1DBFDD] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            See more reviews on Google
          </h2>
          <p className="mt-4 text-lg text-white/90">
            We are rated 5.0 stars from over 50 verified reviews.
          </p>
          <a 
            href="https://g.co/kgs/example" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center rounded-lg bg-white px-8 py-4 text-[#1DBFDD] font-medium hover:bg-white/90"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Read Google Reviews
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
