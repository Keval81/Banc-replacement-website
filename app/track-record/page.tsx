import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = withPageDefaults("/track-record", {
  title: "Track Record | Banc Property Services",
  description: "We have an impressive track record. See the properties Banc Property Group has sold across Cuffley, Goffs Oak, Cheshunt and the surrounding areas.",
});

export const revalidate = 3600;

export default function TrackRecordPage() {
  return (
    <div className="bg-white text-banc-dark">
      <Header />

      {/* Hero */}
      <section className="relative bg-banc-dark-deep py-24 lg:py-32">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1732721176854-4d03a05d292f?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep/80 via-banc-dark-deep/60 to-banc-dark-deep/40" />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-banc-sky mb-4">Results</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Impressive Track Record
            </h1>
            <p className="mt-6 text-lg text-white/70">
              We have an impressive track record. The best way to judge us is by the homes we have
              sold and let — and by what the people who trusted us with them say.
            </p>
          </div>
        </div>
      </section>

      {/* Sold properties CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-banc-sky">Recent Success</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">See What We&apos;ve Sold</h2>
          <p className="mt-4 text-lg text-banc-grey">
            Browse the properties we have sold and let across Cuffley, Goffs Oak, Cheshunt,
            Northaw and the surrounding villages.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/sold-prices">
              <Button variant="outline" className="border-banc-sky text-banc-sky hover:bg-banc-sky hover:text-white">
                View Sold Properties
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sales/properties">
              <Button variant="outline" className="border-banc-dark-deep text-banc-dark-deep hover:bg-banc-dark-deep hover:text-white">
                Current Properties
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial — verbatim from bancproperty.com/reviews */}
      <section className="bg-banc-grey-pale py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
          <div className="text-6xl text-banc-sky opacity-30">&quot;</div>
          <blockquote className="text-2xl font-medium text-banc-dark -mt-8">
            You guys are brilliant, when you valued our property at a much higher price than other
            agents we were sceptical we could achieve that but it sold for exactly that. You really
            know what you&apos;re talking about and because of your expert knowledge we were able to
            move to a location we thought we couldn&apos;t afford.
          </blockquote>
          <div className="mt-6">
            <p className="font-semibold">Lesley &amp; James</p>
            <p className="text-banc-grey">Beverley Gardens, Cheshunt</p>
          </div>
          <div className="mt-8">
            <Link href="/reviews" className="text-banc-sky font-medium hover:underline">
              Read all client reviews
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-banc-sky py-16">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready to achieve exceptional results?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Let us put our track record to work for you.
          </p>
          <Link href="/valuation">
            <Button className="mt-8 bg-white text-banc-sky hover:bg-white/90 px-8 py-6 text-base">
              Book Your Valuation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
