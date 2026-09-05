// Aker-style exhibit opener: numbered eyebrow + monumental light serif heading,
// separated from content by a hairline. See DESIGN.md.
interface SectionHeaderProps {
  number: string;
  label: string;
  title: string;
  dark?: boolean;
}

export function SectionHeader({ number, label, title, dark = false }: SectionHeaderProps) {
  const ink = dark ? "text-white" : "text-banc-dark";
  const mut = dark ? "text-white/60" : "text-banc-muted-readable";
  const hair = dark ? "border-white/15" : "border-banc-dark/15";
  return (
    <div className={`border-t ${hair} pt-5`}>
      <div className="flex items-baseline gap-4">
        <span className={`font-mono text-[11px] tracking-[0.14em] ${mut}`}>{number}</span>
        <span className={`text-[11px] uppercase tracking-[0.18em] ${mut}`}>{label}</span>
      </div>
      <h2
        className={`mt-4 font-display font-light leading-[1.02] tracking-[-0.02em] ${ink}`}
        style={{ fontSize: "clamp(38px, 5.5vw, 72px)" }}
      >
        {title}
      </h2>
    </div>
  );
}
