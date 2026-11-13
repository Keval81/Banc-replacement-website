// The site's one set of form and action styles. See DESIGN.md "Forms and calculators".
// Compose with cn(); override only layout (width, margin), never colour or shape.

/** Label above a control: the museum-label voice. */
export const fieldLabel =
  "mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-banc-muted-readable";
export const fieldLabelOnDark =
  "mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-white/70";

/** Text input, select and textarea on a light surface. 16px text stops iOS zooming on focus. */
export const fieldControl =
  "h-12 w-full rounded-[var(--radius-md)] border border-banc-line bg-white px-4 text-base text-banc-dark-deep placeholder:text-banc-muted-readable transition-colors duration-200 focus:border-banc-focus focus:outline-none focus:ring-2 focus:ring-banc-focus disabled:cursor-not-allowed disabled:opacity-60";
/** Same control sitting on a dark band: white field, dark text. */
export const fieldControlOnDark =
  "h-12 w-full rounded-[var(--radius-md)] border border-white bg-white px-4 text-base text-banc-dark-deep placeholder:text-banc-muted-readable transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--banc-focus-dark)] disabled:cursor-not-allowed disabled:opacity-60";
export const fieldTextarea = "min-h-32 py-3";
export const fieldHelp = "mt-2 text-sm text-banc-muted-readable";
export const fieldError = "mt-2 text-sm text-red-700";

/** One white panel holding a form or a calculator. Never nest a panel in a panel. */
export const formPanel =
  "rounded-[var(--radius-md)] border border-banc-line bg-white p-5 sm:p-6 lg:p-8";

/** Either/or choice (Buy | Rent, Sell | Let, repayment type). */
export const segmented =
  "grid w-full auto-cols-fr grid-flow-col rounded-[var(--radius-md)] border border-banc-line bg-white p-1";
export const segmentedOnDark =
  "grid w-full auto-cols-fr grid-flow-col rounded-[var(--radius-md)] border border-white/30 p-1";
export function segmentedOption(active: boolean): string {
  return `min-h-11 rounded-md px-4 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 ${
    active ? "bg-banc-focus text-white" : "text-banc-muted-readable hover:text-banc-dark-deep"
  }`;
}
export function segmentedOptionOnDark(active: boolean): string {
  return `min-h-11 rounded-md px-4 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--banc-focus-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep ${
    active ? "bg-white text-banc-dark-deep" : "text-white/75 hover:text-white"
  }`;
}

/** Multi-select chip (features, quick amounts, bedrooms). */
export function choiceChip(active: boolean): string {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 ${
    active
      ? "border-banc-focus bg-banc-focus text-white"
      : "border-banc-line bg-white text-banc-dark-deep hover:border-banc-focus"
  }`;
}

/** The main action. Spans the row on phones. Teal on light, sky on dark. Flat: no gradient, no shadow. */
export const actionPrimary =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-banc-focus px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-banc-focus-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";
export const actionPrimaryOnDark =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--banc-focus-dark)] px-6 text-sm font-semibold text-banc-dark-deep transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--banc-focus-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";
export const actionSecondary =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-banc-dark/30 px-6 text-sm font-semibold text-banc-dark-deep transition-colors duration-200 hover:border-banc-dark-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 sm:w-auto";
export const actionSecondaryOnDark =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-white/30 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--banc-focus-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep sm:w-auto";

/** Section rhythm: tight on phones, generous from desktop up. */
export const sectionPadding = "px-4 py-12 sm:px-6 lg:px-10 lg:py-20";
/** Eyebrow above a section heading. */
export const eyebrow = "text-[11px] font-medium uppercase tracking-[0.18em] text-banc-muted-readable";
export const eyebrowOnDark = "text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--banc-focus-dark)]";
/** Section heading: light serif, left-aligned. */
export const sectionHeading =
  "font-display font-light leading-[1.08] tracking-[-0.02em] text-banc-dark text-[clamp(28px,3.5vw,44px)]";
export const sectionHeadingOnDark =
  "font-display font-light leading-[1.08] tracking-[-0.02em] text-white text-[clamp(28px,3.5vw,44px)]";
