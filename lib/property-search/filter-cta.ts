export interface FilterCtaInput {
  isLoading: boolean;
  resultCount?: number;
  /** The last count the drawer showed, kept so a recount does not blank it. */
  lastKnownCount?: number;
}

export interface FilterCtaState {
  label: string;
  disabled: boolean;
  tone: "primary" | "muted";
}

// The button used to disable itself for the ~1s recount after every filter
// change and read "Loading…". On a phone a tap on a disabled button gives no
// feedback at all, so a visitor who set several filters and went straight for
// the button believed the search was broken. It now stays tappable throughout
// and keeps the last number rather than blanking.
export function getFilterCtaState({
  isLoading,
  resultCount,
  lastKnownCount,
}: FilterCtaInput): FilterCtaState {
  const count = resultCount ?? (isLoading ? lastKnownCount : undefined);

  if (count === 0) {
    return { label: "No matches — change a filter", disabled: false, tone: "muted" };
  }
  if (count === undefined) {
    return { label: "Show results", disabled: false, tone: "primary" };
  }
  return {
    label: `Show ${count} result${count === 1 ? "" : "s"}`,
    disabled: false,
    tone: "primary",
  };
}
