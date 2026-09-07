interface GestureTarget {
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface PlayableVideo {
  play(): Promise<void>;
}

interface PlayWhenAllowedOptions {
  video: PlayableVideo;
  gestureTarget: GestureTarget;
}

// iOS refuses autoplay in Low Power Mode but honours play() during a gesture,
// so a scroll or tap anywhere on the page is enough to start a silent film.
export const AUTOPLAY_GESTURE_EVENTS = ["touchend", "pointerup", "keydown"] as const;

export function playWhenAllowed({ video, gestureTarget }: PlayWhenAllowedOptions): () => void {
  let listening = false;

  const stopListening = () => {
    if (!listening) return;
    listening = false;
    for (const type of AUTOPLAY_GESTURE_EVENTS) gestureTarget.removeEventListener(type, attempt);
  };

  const startListening = () => {
    if (listening) return;
    listening = true;
    for (const type of AUTOPLAY_GESTURE_EVENTS) gestureTarget.addEventListener(type, attempt);
  };

  const attempt: EventListener = () => {
    video.play().then(stopListening, startListening);
  };

  attempt(new Event("attempt"));
  return stopListening;
}
