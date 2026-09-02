import { NextResponse } from "next/server";

const PLACE_ID = "ChIJh-TjkD4idkgR0gnHsbtMgAU";

// Empty payload consumers can always render (they keep their fallback copy).
const EMPTY = { place: null, reviews: [] as GoogleReview[] };
const EMPTY_HEADERS = { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" };

interface GoogleReview {
  authorName?: string;
  profilePhotoUrl?: string;
  rating?: number;
  text: string;
  relativeTime?: string;
  time: number;
}

interface PlacesReview {
  rating?: number;
  publishTime?: string;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
}

interface PlacesResponse {
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesReview[];
}

// Log configuration / upstream problems once per instance, not per request.
let warnedMissingKey = false;
let warnedUpstream = false;

function emptyResponse() {
  return NextResponse.json(EMPTY, { status: 200, headers: EMPTY_HEADERS });
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    if (!warnedMissingKey) {
      warnedMissingKey = true;
      console.warn("[google-reviews] GOOGLE_PLACES_API_KEY not set; returning empty reviews");
    }
    return emptyResponse();
  }

  const url = new URL(`https://places.googleapis.com/v1/places/${PLACE_ID}`);
  url.searchParams.set("languageCode", "en-GB");

  let data: PlacesResponse;
  try {
    const res = await fetch(url.toString(), {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews",
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      if (!warnedUpstream) {
        warnedUpstream = true;
        console.warn(`[google-reviews] Places API responded ${res.status}; returning empty reviews`);
      }
      return emptyResponse();
    }

    data = (await res.json()) as PlacesResponse;
  } catch (error) {
    if (!warnedUpstream) {
      warnedUpstream = true;
      console.warn("[google-reviews] Places API request failed; returning empty reviews", error);
    }
    return emptyResponse();
  }

  const reviews = Array.isArray(data.reviews) ? data.reviews : [];

  const fiveStarRecent: GoogleReview[] = reviews
    .filter((review) => review?.rating === 5)
    .sort(
      (a, b) =>
        (b?.publishTime ? Date.parse(b.publishTime) : 0) -
        (a?.publishTime ? Date.parse(a.publishTime) : 0)
    )
    .slice(0, 5)
    .map((review) => ({
      authorName: review.authorAttribution?.displayName,
      profilePhotoUrl: review.authorAttribution?.photoUri,
      rating: review.rating,
      text: review.text?.text || "",
      relativeTime: review.relativePublishTimeDescription,
      time: review.publishTime ? Date.parse(review.publishTime) : 0,
    }));

  return NextResponse.json(
    {
      place: {
        name: data.displayName?.text,
        rating: data.rating,
        totalRatings: data.userRatingCount,
      },
      reviews: fiveStarRecent,
      note:
        "Google Places API does not expose reviewer total review counts; filtering applied to 5-star reviews only.",
    },
    { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } }
  );
}
