import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getGoogleMapLoadState,
  getFallbackMapEmbedUrl,
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

test("selects the keyless embed when the Google key is absent", () => {
  assert.deepEqual(getPropertyMapPresentation("", "map-id"), {
    provider: "keyless-embed",
  });
});

test("builds a keyless Google postcode-area embed centred on live coordinates", () => {
  const url = new URL(getFallbackMapEmbedUrl(51.7252, -0.2049));

  assert.equal(url.origin, "https://www.google.com");
  assert.equal(url.pathname, "/maps");
  assert.equal(url.searchParams.get("q"), "51.7252,-0.2049");
  assert.equal(url.searchParams.get("output"), "embed");
});

test("keeps Google mounted while awaiting initialization and uses the keyless embed when its watchdog expires", () => {
  assert.equal(getGoogleMapLoadState(false, false, false), "loading");
  assert.equal(getGoogleMapLoadState(true, false, false), "initializing");
  assert.equal(getGoogleMapLoadState(true, true, false), "ready");
  assert.equal(getGoogleMapLoadState(true, false, true), "fallback");
});
