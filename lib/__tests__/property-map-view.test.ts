import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getGoogleMapLoadState,
  getOpenStreetMapEmbedUrl,
  getPropertyMapPoints,
  getPropertyMapPresentation,
} from "../property-map-view.ts";

test("uses labelled Google satellite with standard controls when an API key exists", () => {
  assert.deepEqual(getPropertyMapPresentation(" maps-key ", " map-id "), {
    provider: "google",
    mapId: "map-id",
    controls: {
      defaultMapType: "hybrid",
      mapTypeControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
      zoomControl: true,
      keyboardShortcuts: true,
      gestureHandling: "cooperative",
      heading: 0,
      tilt: 45,
    },
  });
});

test("keeps labelled Google satellite usable without a production map ID", () => {
  const presentation = getPropertyMapPresentation("maps-key", "   ");

  assert.equal(presentation.provider, "google");
  if (presentation.provider === "google") {
    assert.equal(presentation.mapId, undefined);
    assert.equal(presentation.controls.defaultMapType, "hybrid");
  }
});

test("selects OpenStreetMap when the Google key is absent", () => {
  assert.deepEqual(getPropertyMapPresentation("", "map-id"), {
    provider: "openstreetmap",
  });
});

test("builds an OpenStreetMap postcode-area embed around live coordinates without a marker", () => {
  const url = new URL(getOpenStreetMapEmbedUrl(51.7252, -0.2049));

  assert.equal(url.origin, "https://www.openstreetmap.org");
  assert.equal(url.pathname, "/export/embed.html");
  assert.equal(url.searchParams.get("layer"), "mapnik");
  assert.equal(url.searchParams.get("marker"), null);
  assert.equal(url.searchParams.get("bbox"), "-0.2169,51.7192,-0.1929,51.7312");
});

test("keeps Google mounted while awaiting initialization and uses OpenStreetMap when its watchdog expires", () => {
  assert.equal(getGoogleMapLoadState(false, false, false), "loading");
  assert.equal(getGoogleMapLoadState(true, false, false), "initializing");
  assert.equal(getGoogleMapLoadState(true, true, false), "ready");
  assert.equal(getGoogleMapLoadState(true, false, true), "fallback");
});

test("plots only exact CRM-provided coordinates without offsets", () => {
  const points = getPropertyMapPoints([
    {
      id: "mapped",
      coordinates: { latitude: 51.7101, longitude: -0.1124 },
    },
    { id: "missing" },
    {
      id: "invalid",
      coordinates: { latitude: Number.NaN, longitude: -0.2 },
    },
  ]);

  assert.deepEqual(points, [
    {
      id: "mapped",
      coordinates: { latitude: 51.7101, longitude: -0.1124 },
      position: { lat: 51.7101, lng: -0.1124 },
    },
  ]);
});
