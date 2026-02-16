import { NextResponse } from "next/server";

const PLACE_ID = "ChIJh-TjkD4idkgR0gnHsbtMgAU";

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GOOGLE_PLACES_API_KEY" },
      { status: 500 }
    );
  }

  const url = new URL(`https://places.googleapis.com/v1/places/${PLACE_ID}`);
  url.searchParams.set("languageCode", "en-GB");

  const res = await fetch(url.toString(), {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch Google Places data" },
      { status: 502 }
    );
  }

  const data = await res.json();

  const reviews = Array.isArray(data.reviews) ? data.reviews : [];

  const fiveStarRecent = reviews
    .filter((review: any) => review?.rating === 5)
    .sort(
      (a: any, b: any) =>
        (b?.publishTime ? Date.parse(b.publishTime) : 0) -
        (a?.publishTime ? Date.parse(a.publishTime) : 0)
    )
    .slice(0, 5)
    .map((review: any) => ({
      authorName: review.authorAttribution?.displayName,
      profilePhotoUrl: review.authorAttribution?.photoUri,
      rating: review.rating,
      text: review.text?.text || "",
      relativeTime: review.relativePublishTimeDescription,
      time: review.publishTime ? Date.parse(review.publishTime) : 0,
    }));

  return NextResponse.json({
    place: {
      name: data.displayName?.text,
      rating: data.rating,
      totalRatings: data.userRatingCount,
    },
    reviews: fiveStarRecent,
    note:
      "Google Places API does not expose reviewer total review counts; filtering applied to 5-star reviews only.",
  });
}
