"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

interface Review {
  authorName: string;
  profilePhotoUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
  time: number;
}

export default function GoogleReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [place, setPlace] = useState<{ name?: string; rating?: number; totalRatings?: number }>({});

  useEffect(() => {
    let mounted = true;

    fetch("/api/google-reviews")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setPlace(data.place || {});
      })
      .catch(() => {
        if (!mounted) return;
        setReviews([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const activeReview = useMemo(() => reviews[activeIndex], [reviews, activeIndex]);

  return (
    <section className="bg-[#F7FAFA]">
      <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#6B7280]">
              Google Reviews
            </p>
            <h2 className="text-3xl font-semibold text-[#111827] sm:text-4xl">
              What clients say
            </h2>
            {place?.rating && (
              <p className="mt-3 text-sm text-[#4B5563]">
                {place.name} • {place.rating.toFixed(1)} stars ({place.totalRatings} reviews)
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm">
            <Image
              src="/partners/google.png"
              alt="Google"
              width={92}
              height={30}
              className="h-6 w-auto"
            />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
              Verified
            </span>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">
          {activeReview ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                {activeReview.profilePhotoUrl ? (
                  <Image
                    src={activeReview.profilePhotoUrl}
                    alt={activeReview.authorName}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E5F6F6] text-lg font-semibold text-[#0A6B82]">
                    {activeReview.authorName?.[0] ?? "B"}
                  </div>
                )}
                <div>
                  <p className="text-base font-semibold text-[#111827]">
                    {activeReview.authorName}
                  </p>
                  <p className="text-sm text-[#6B7280]">{activeReview.relativeTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-[#1DBFDD]">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#0A6B82]">5.0</span>
              </div>
              <p className="text-lg text-[#374151]">{activeReview.text}</p>
            </div>
          ) : (
            <p className="text-sm text-[#6B7280]">Loading reviews…</p>
          )}

          {reviews.length > 1 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 w-8 rounded-full transition-all ${
                    index === activeIndex ? "bg-[#1DBFDD]" : "bg-[#E5E7EB]"
                  }`}
                  aria-label={`Show review ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
