const SMALL_WORDS = new Set(["a", "and", "for", "in", "of", "on", "the", "to", "with"]);
const ACRONYMS = new Set(["WC", "EPC", "UPVC", "EV", "CCTV", "NHBC", "UK", "M25", "A10", "A1"]);

/** Listings are often typed in capitals; they read better in title case. Mixed-case text is left alone. */
export function readableLabel(label: string): string {
  if (/[a-z]/.test(label)) return label;
  return label
    .split(" ")
    .map((word, index) => {
      if (ACRONYMS.has(word)) return word;
      const lower = word.toLowerCase();
      if (index > 0 && SMALL_WORDS.has(lower)) return lower;
      return lower.replace(/(^|-)([a-z])/g, (_match, lead: string, letter: string) => lead + letter.toUpperCase());
    })
    .join(" ");
}
