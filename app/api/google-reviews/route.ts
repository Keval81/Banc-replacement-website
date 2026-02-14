import { NextResponse } from "next/server";

const PLACE_ID = "ChIJh-PjkD4idhAR0QnHuxsKBAU";

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GOOGLE_PLACES_API_KEY" },
      { status: 500 }
    );
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", PLACE_ID);
  url.searchParams.set(
    "fields",
    "name,rating,user_ratings_total,reviews"
  );
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch Google Places data" },
      { status: 502 }
    );
  }

  const data = await res.json();

  if (data.status !== "OK") {
    return NextResponse.json(
      { error: data.status, message: data.error_message },
      { status: 502 }
    );
  }

  const reviews = Array.isArray(data.result?.reviews)
    ? data.result.reviews
    : [];

  const fiveStarRecent = reviews
    .filter((review: any) => review?.rating === 5)
    .sort((a: any, b: any) => (b?.time || 0) - (a?.time || 0))
    .slice(0, 5)
    .map((review: any) => ({
      authorName: review.author_name,
      profilePhotoUrl: review.profile_photo_url,
      rating: review.rating,
      text: review.text,
      relativeTime: review.relative_time_description,
      time: review.time,
    }));

  return NextResponse.json({
    place: {
      name: data.result?.name,
      rating: data.result?.rating,
      totalRatings: data.result?.user_ratings_total,
    },
    reviews: fiveStarRecent,
    note:
      "Google Places API does not expose reviewer total review counts; filtering applied to 5-star reviews only.",
  });
}
