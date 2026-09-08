export interface BodyLockStyle {
  position: string;
  top: string;
  width: string;
}

export interface ScrollLockEnvironment {
  getScrollY(): number;
  setBodyStyle(style: BodyLockStyle): void;
  scrollTo(y: number): void;
}

// iOS ignores overflow: hidden on <body>, so an open drawer pins the body at
// the current scroll position instead. The position lives in this closure,
// never on the DOM: the header is rendered per page, and a value parked on
// document.body outlived the page that wrote it — the next page's header
// "restored" it on mount and opened the team page at the homepage's scroll.
export interface ReleaseOptions {
  // False when the menu closes because a link was tapped: the old page's
  // position must not be scrolled back into a page that is being replaced.
  // (framer-motion's exit measurement and the router's scroll-to-top were
  // racing that restore, and the restore won: /the-team opened at 900px.)
  restoreScroll?: boolean;
}

export type ReleaseScrollLock = (options?: ReleaseOptions) => void;

export function lockBodyScroll(env: ScrollLockEnvironment): ReleaseScrollLock {
  const scrollY = env.getScrollY();
  env.setBodyStyle({ position: "fixed", top: `-${scrollY}px`, width: "100%" });

  let released = false;
  return ({ restoreScroll = true }: ReleaseOptions = {}) => {
    if (released) return;
    released = true;
    env.setBodyStyle({ position: "", top: "", width: "" });
    if (restoreScroll) env.scrollTo(scrollY);
  };
}
