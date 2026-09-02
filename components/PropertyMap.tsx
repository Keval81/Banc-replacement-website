"use client";

import * as React from "react";
import Link from "next/link";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { getPropertyMapPoints } from "@/lib/property-map-view";
import { buildPropertyHref, type PropertyCardData } from "@/lib/property-view";

type MapProperty = Pick<
  PropertyCardData,
  "id" | "title" | "address" | "price" | "images" | "department" | "coordinates"
>;
const containerStyle = { width: "100%", height: "100%" };

export default function PropertyMap({ properties }: { properties: MapProperty[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    id: "banc-google-maps",
    googleMapsApiKey: apiKey ?? "",
  });
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const points = React.useMemo(
    () => getPropertyMapPoints(properties),
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

  if (points.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <p className="text-banc-muted-readable">
          Map locations are unavailable for these properties.
        </p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="h-full flex items-center justify-center text-center px-6">
        <p className="text-banc-grey">
          Map unavailable — set <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable the map view.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-banc-grey">Loading map…</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={points[0].position}
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
              <Link href={buildPropertyHref(p.department, p.id)} className="block w-44">
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                ) : null}
                <p className="text-sm font-semibold text-banc-dark-deep">{p.title}</p>
                <p className="text-xs text-banc-muted-readable">{p.address}</p>
                <p className="mt-1 text-sm font-bold text-banc-focus">{p.price}</p>
              </Link>
            </InfoWindowF>
          ) : null
        )}
      </GoogleMap>
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-banc-muted-readable shadow-sm">
        Map locations are approximate postcode areas
      </p>
    </div>
  );
}
