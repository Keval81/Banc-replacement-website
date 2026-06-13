"use client";

import * as React from "react";
import Link from "next/link";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";

interface MapProperty {
  id: string;
  title: string;
  address: string;
  price: string;
  images: string[];
}

// Approximate town-centre coordinates for the agency's coverage area.
// Replace with real per-property coordinates once listings come from the CRM.
const TOWN_COORDS: Record<string, { lat: number; lng: number }> = {
  cuffley: { lat: 51.7102, lng: -0.1131 },
  "hadley wood": { lat: 51.6603, lng: -0.1703 },
  "brookmans park": { lat: 51.7252, lng: -0.2049 },
  "potters bar": { lat: 51.6939, lng: -0.1916 },
  enfield: { lat: 51.6521, lng: -0.0807 },
  "mount street": { lat: 51.5106, lng: -0.1486 },
  mayfair: { lat: 51.5101, lng: -0.149 },
  w1: { lat: 51.5101, lng: -0.149 },
};

const DEFAULT_CENTER = { lat: 51.7102, lng: -0.1131 }; // Cuffley
const containerStyle = { width: "100%", height: "100%" };

function coordsFor(address: string, index: number) {
  const lower = address.toLowerCase();
  const key = Object.keys(TOWN_COORDS).find((town) => lower.includes(town));
  const base = key ? TOWN_COORDS[key] : DEFAULT_CENTER;
  // Deterministic small offset so multiple listings in one town don't overlap.
  return {
    lat: base.lat + ((index % 5) - 2) * 0.004,
    lng: base.lng + ((index % 3) - 1) * 0.004,
  };
}

export default function PropertyMap({ properties }: { properties: MapProperty[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    id: "banc-google-maps",
    googleMapsApiKey: apiKey ?? "",
  });
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const points = React.useMemo(
    () => properties.map((p, i) => ({ ...p, position: coordsFor(p.address, i) })),
    [properties]
  );

  const onLoad = React.useCallback(
    (map: google.maps.Map) => {
      if (points.length === 0) return;
      if (points.length === 1) {
        map.setCenter(points[0].position);
        map.setZoom(14);
        return;
      }
      const bounds = new google.maps.LatLngBounds();
      points.forEach((p) => bounds.extend(p.position));
      map.fitBounds(bounds, 80);
    },
    [points]
  );

  if (!apiKey) {
    return (
      <div className="h-full flex items-center justify-center text-center px-6">
        <p className="text-[#8A8880]">
          Map unavailable — set <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable the map view.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#8A8880]">Loading map…</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={DEFAULT_CENTER}
      zoom={11}
      onLoad={onLoad}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {points.map((p) => (
        <MarkerF key={p.id} position={p.position} onClick={() => setActiveId(p.id)} />
      ))}
      {points.map((p) =>
        activeId === p.id ? (
          <InfoWindowF
            key={`iw-${p.id}`}
            position={p.position}
            onCloseClick={() => setActiveId(null)}
          >
            <Link href={`/sales/properties/${p.id}`} className="block w-44">
              {p.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.images[0]}
                  alt={p.title}
                  className="w-full h-24 object-cover rounded mb-2"
                />
              ) : null}
              <p className="text-sm font-semibold text-[#1A1917]">{p.title}</p>
              <p className="text-xs text-[#8A8880]">{p.address}</p>
              <p className="mt-1 text-sm font-bold text-[#1A9BBF]">{p.price}</p>
            </Link>
          </InfoWindowF>
        ) : null
      )}
    </GoogleMap>
  );
}
