interface Window {
  // Called by the Google Maps JS API when it rejects the key
  // (InvalidKey / RefererNotAllowedMapError). The map still initializes and
  // then paints an empty box, so this is the only signal available.
  gm_authFailure?: () => void;
}
