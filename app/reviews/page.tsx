import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin } from "lucide-react";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimaryOnDark,
  eyebrow,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { BANC_REVIEWS, type Review } from "@/lib/reviews";

export const metadata: Metadata = withPageDefaults("/reviews", {
  title: "Reviews | Banc Property Services",
  description: "Read what our clients say about Banc Property Group. Estate agency service across Cuffley, Cheshunt, Goffs Oak and beyond.",
});

export const revalidate = 3600;



function ReviewTypeBadge({ type }: { type?: string }) {
  if (!type) return null;

  const labels = {
    sales: "Sales",
    lettings: "Lettings",
    landlord: "Landlord"
  };

  return <p className={eyebrow}>{labels[type as keyof typeof labels]}</p>;
}

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-banc-grey-pale">
      <Header />

      <PageBand
        eyebrow="Client Testimonials"
        title="Reviews"
        lede="Take a look at what our clients have to say about us."
        image={{
          src: "https://images.unsplash.com/photo-1713656275767-e8140c59acca?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      />

      {/* Reviews */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <h2 className={sectionHeading}>Trusted by Homeowners Across Hertfordshire</h2>

          <div className="mt-7 grid gap-x-12 md:grid-cols-2">
            {BANC_REVIEWS.map((review, index) => (
              <article key={index} className="border-t border-banc-dark/15 py-8">
                <ReviewTypeBadge type={review.type} />

                <h3 className="mt-3 text-xl font-semibold leading-snug text-banc-dark-deep">
                  {review.title}
                </h3>

                <blockquote className="mt-4 text-base leading-relaxed text-banc-muted-readable">
                  &quot;{review.text}&quot;
                </blockquote>

                <div className="mt-5">
                  <p className="font-semibold text-banc-dark-deep">{review.name}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-banc-focus" aria-hidden="true" />
                    <p className="text-sm text-banc-muted-readable">{review.location}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Valuation CTA Section */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <h2 className={sectionHeadingOnDark}>Ready to Experience It Yourself?</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            At Banc Property, we think very highly of our clients and we are delighted to say
            they seem to feel the same about us. Let&apos;s talk about your move.
          </p>

          <a href="/valuation" className={cn(actionPrimaryOnDark, "mt-7")}>
            Request a Valuation
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
