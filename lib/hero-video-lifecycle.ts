interface HeroVideoEventTarget {
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface HeroVideoLifecycleOptions {
  documentTarget: HeroVideoEventTarget;
  windowTarget: HeroVideoEventTarget;
  getVisibilityState: () => "hidden" | "visible";
  pause: () => void;
  resume: () => void;
}

export function startHeroVideoLifecycle(
  options: HeroVideoLifecycleOptions,
): () => void {
  const resumeIfVisible = () => {
    if (options.getVisibilityState() === "visible") options.resume();
  };
  const handleVisibilityChange = () => {
    if (options.getVisibilityState() === "hidden") {
      options.pause();
      return;
    }
    options.resume();
  };

  options.documentTarget.addEventListener("visibilitychange", handleVisibilityChange);
  options.windowTarget.addEventListener("pageshow", resumeIfVisible);
  options.windowTarget.addEventListener("focus", resumeIfVisible);

  return () => {
    options.documentTarget.removeEventListener("visibilitychange", handleVisibilityChange);
    options.windowTarget.removeEventListener("pageshow", resumeIfVisible);
    options.windowTarget.removeEventListener("focus", resumeIfVisible);
  };
}
