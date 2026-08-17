"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { PropertyGallery } from "@/components/PropertyGallery";
import { FloorplanViewer } from "@/components/FloorplanViewer";
import { Button } from "@/components/ui/button";
import {
  Bed,
  Bath,
  Sofa,
  ChevronRight,
  FileText,
  Loader2,
  Phone,
  Video,
} from "lucide-react";

// Live property detail — data comes from /api/properties/[id]
// (Expert Agent feed -> Supabase). No mock fallback: an unknown reference
// renders a not-found state, never someone else's house.

interface Gallery {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface LiveDetail {
  id: string;
  title: string;
  address: string;
  postcode: string;
  price: string;
  priceQualifier?: string;
  tags: string[];
  stats: { beds: number; baths: number };
  receptions: number;
  summary: string;
  description: string;
  features: string[];
  tenure: string;
  brochureUrl: string;
  virtualTourUrl: string;
  rooms: Array<{ name: string; measurement: string; description: string }>;
  gallery: Gallery[];
  floorplans: Array<{ id: string; url: string; title: string }>;
  department: "sales" | "lettings";
  latitude?: number;
  longitude?: number;
  epcRating?: string;
  epcImageUrl: string;
}

interface SimilarCard {
  id: string;
  title: string;
  address: string;
  price: string;
  tags: string[];
  stats: { beds: number; baths: number };
  images: string[];
  summary: string;
}

type LoadState =
  | { phase: "loading" }
  | { phase: "notfound" }
  | { phase: "ready"; property: LiveDetail; similar: SimilarCard[] };

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [state, setState] = React.useState<LoadState>({ phase: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/properties/${encodeURIComponent(id)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        if (!d.property) setState({ phase: "notfound" });
        else {
          setState({ phase: "ready", property: d.property, similar: d.similar ?? [] });
          document.title = `${d.property.title} | Banc Property Group`;
        }
      })
      .catch(() => {
        if (!cancelled) setState({ phase: "notfound" });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {state.phase === "loading" && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-banc-sky" />
          <p className="text-banc-grey">Loading property…</p>
        </div>
      )}

      {state.phase === "notfound" && (
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-3 text-2xl font-semibold text-banc-dark">
            This property is no longer available
          </h1>
          <p className="mb-6 text-banc-grey">
            It may have been sold or withdrawn. Our current listings are updated
            directly from our sales system.
          </p>
          <Link href="/sales/properties">
            <Button className="bg-banc-sky text-white hover:bg-banc-sky-dark">
              View current properties
            </Button>
          </Link>
        </div>
      )}

      {state.phase === "ready" && (
        <DetailBody property={state.property} similar={state.similar} />
      )}

      <Footer />
    </div>
  );
}

function DetailBody({
  property,
  similar,
}: {
  property: LiveDetail;
  similar: SimilarCard[];
}) {
  const paragraphs = property.description.split("\n\n").filter(Boolean);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-banc-grey/20 bg-banc-grey-pale">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-banc-grey">
            <Link href="/" className="transition-colors hover:text-banc-sky">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={
                property.department === "lettings"
                  ? "/lettings/properties"
                  : "/sales/properties"
              }
              className="transition-colors hover:text-banc-sky"
            >
              {property.department === "lettings" ? "To Let" : "For Sale"}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="max-w-[200px] truncate text-banc-dark sm:max-w-[400px]">
              {property.address}
            </span>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-4 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-6">
        <div className="grid gap-6 lg:grid-cols-[65%_35%] lg:gap-8">
          {/* Left: gallery + content */}
          <div>
            <PropertyGallery images={property.gallery} className="mb-6" />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-6">
                {property.tags.length > 0 && (
                  <span className="mb-2 inline-block rounded-full bg-banc-dark px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
                    {property.tags[0]}
                  </span>
                )}
                <h1 className="text-2xl font-semibold text-banc-dark sm:text-3xl">
                  {property.title}
                </h1>
                <p className="mt-1 text-banc-grey">
                  {property.address} · {property.postcode}
                </p>
                <p className="mt-3 text-3xl font-semibold text-banc-dark">
                  {property.priceQualifier ?? property.price}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-5 border-y border-banc-grey/20 py-4 text-sm text-banc-dark">
                  <span className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-banc-grey" />
                    {property.stats.beds} bedrooms
                  </span>
                  <span className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-banc-grey" />
                    {property.stats.baths} bathrooms
                  </span>
                  {property.receptions > 0 && (
                    <span className="flex items-center gap-2">
                      <Sofa className="h-4 w-4 text-banc-grey" />
                      {property.receptions} receptions
                    </span>
                  )}
                  {property.tenure && (
                    <span className="text-banc-grey">{property.tenure}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <section className="mb-8">
                <h2 className="mb-3 text-lg font-semibold text-banc-dark">
                  About this property
                </h2>
                <div className="space-y-4 leading-relaxed text-banc-dark-mid">
                  {paragraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>

              {/* Features */}
              {property.features.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-3 text-lg font-semibold text-banc-dark">
                    Key features
                  </h2>
                  <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    {property.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-banc-dark-mid">
                        <span className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-banc-sky" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Rooms (feed rarely fills these — hide when empty) */}
              {property.rooms.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-3 text-lg font-semibold text-banc-dark">
                    Room dimensions
                  </h2>
                  <div className="divide-y divide-banc-grey/15 border-y border-banc-grey/15">
                    {property.rooms.map((room, i) => (
                      <div key={i} className="flex flex-wrap items-baseline gap-x-4 py-2.5">
                        <span className="font-medium text-banc-dark">{room.name}</span>
                        <span className="text-sm text-banc-grey">{room.measurement}</span>
                        {room.description && (
                          <span className="w-full text-sm text-banc-dark-mid">
                            {room.description}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Floorplan */}
              {property.floorplans.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-3 text-lg font-semibold text-banc-dark">Floorplan</h2>
                  <FloorplanViewer floorplans={property.floorplans} />
                </section>
              )}

              {/* EPC — official graph from the sales system; band derived
                  from its filename when encoded */}
              {property.epcImageUrl && (
                <section className="mb-8">
                  <h2 className="mb-3 flex items-center gap-3 text-lg font-semibold text-banc-dark">
                    Energy performance
                    {property.epcRating && (
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded text-sm font-bold text-white ${
                          { A: "bg-emerald-700", B: "bg-emerald-500", C: "bg-lime-500",
                            D: "bg-yellow-500", E: "bg-orange-500", F: "bg-orange-700",
                            G: "bg-red-700" }[property.epcRating] ?? "bg-banc-grey"
                        }`}
                      >
                        {property.epcRating}
                      </span>
                    )}
                  </h2>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={property.epcImageUrl}
                    alt={`Energy performance certificate graph${property.epcRating ? `, current rating ${property.epcRating}` : ""}`}
                    className="max-w-md rounded-lg border border-banc-grey/20"
                  />
                </section>
              )}

              {/* Location — postcode-level map (the feed carries no exact
                  coordinates, so the pin marks the postcode area).
                  Google's keyless embed, matching /contact and /offices: the
                  OpenStreetMap embed's WebGL renderer paints blank inside this
                  page (verified: same URL renders standalone, and this URL
                  renders in this exact slot). */}
              {property.latitude !== undefined && property.longitude !== undefined && (
                <section className="mb-8">
                  <h2 className="mb-3 text-lg font-semibold text-banc-dark">Location</h2>
                  <div className="overflow-hidden rounded-lg border border-banc-grey/20">
                    <iframe
                      title={`Map of ${property.postcode}`}
                      src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=14&output=embed`}
                      className="h-[360px] w-full border-0"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-2 text-xs text-banc-grey">
                    Map shows the {property.postcode} postcode area.
                  </p>
                </section>
              )}
            </motion.div>
          </div>

          {/* Right: enquiry panel */}
          <aside className="lg:pt-0">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-banc-grey/20 bg-banc-grey-pale p-6">
                <p className="text-sm uppercase tracking-[0.15em] text-banc-grey">
                  Banc Property Group
                </p>
                <p className="mt-1 font-medium text-banc-dark">
                  1 Station Road, Cuffley, EN6 4HU
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link href={`/book-viewing?property=${encodeURIComponent(property.id)}`}>
                    <Button className="w-full bg-banc-sky text-white hover:bg-banc-sky-dark">
                      Book a viewing
                    </Button>
                  </Link>
                  <Link href={`/make-offer?property=${encodeURIComponent(property.id)}`}>
                    <Button
                      variant="outline"
                      className="w-full border-banc-dark/25 text-banc-dark hover:border-banc-dark"
                    >
                      Make an offer
                    </Button>
                  </Link>
                  <a
                    href="tel:01707877781"
                    className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-banc-dark transition-colors hover:text-banc-sky"
                  >
                    <Phone className="h-4 w-4" /> 01707 877781
                  </a>
                </div>
              </div>

              {(property.brochureUrl || property.virtualTourUrl) && (
                <div className="rounded-2xl border border-banc-grey/20 p-6">
                  <p className="mb-3 text-sm font-semibold text-banc-dark">
                    More about this home
                  </p>
                  <div className="flex flex-col gap-2">
                    {property.brochureUrl && (
                      <a
                        href={property.brochureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-banc-dark transition-colors hover:text-banc-sky"
                      >
                        <FileText className="h-4 w-4" /> Full brochure (PDF)
                      </a>
                    )}
                    {property.virtualTourUrl && (
                      <a
                        href={property.virtualTourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-banc-dark transition-colors hover:text-banc-sky"
                      >
                        <Video className="h-4 w-4" /> Virtual tour
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Similar properties — live, same department, nearby price */}
        {similar.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 text-xl font-semibold text-banc-dark">
              Similar properties
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <PropertyCard key={s.id} {...s} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
