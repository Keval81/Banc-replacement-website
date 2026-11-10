import { confidenceGauge, type GaugeTone } from "@/lib/valuation/present";
import type { Confidence } from "@/lib/valuation/engine";

// Muted so they sit with the brand blues; each is at least 3:1 against the card.
const TONE: Record<GaugeTone, string> = { red: "#B4443A", amber: "#B7791F", green: "#2E7D5B" };
const SEGMENT_TONES: GaugeTone[] = ["red", "amber", "green"];

const CX = 60;
const CY = 58;
const R = 46;
const GAP_DEG = 3;
const point = (deg: number, radius = R) => {
  const rad = (deg * Math.PI) / 180;
  return `${(CX + radius * Math.cos(rad)).toFixed(2)} ${(CY - radius * Math.sin(rad)).toFixed(2)}`;
};
// Segments run left (low) to right (high) across the top half: 180° → 0°.
const arc = (segment: number) => {
  const from = 180 - segment * 60 - GAP_DEG / 2;
  const to = 180 - (segment + 1) * 60 + GAP_DEG / 2;
  return `M ${point(from)} A ${R} ${R} 0 0 1 ${point(to)}`;
};

export function ConfidenceGauge({ confidence }: { confidence: Confidence }) {
  const gauge = confidenceGauge(confidence);
  const needleDeg = 150 - gauge.segment * 60;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 66" className="h-auto w-24 shrink-0" role="img" aria-label={gauge.label}>
        {SEGMENT_TONES.map((tone, i) => (
          <path
            key={tone}
            d={arc(i)}
            fill="none"
            stroke={TONE[tone]}
            strokeWidth={10}
            strokeLinecap="butt"
            opacity={i === gauge.segment ? 1 : 0.22}
          />
        ))}
        <line x1={CX} y1={CY} x2={point(needleDeg, R - 12).split(" ")[0]} y2={point(needleDeg, R - 12).split(" ")[1]} stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="text-banc-dark" />
        <circle cx={CX} cy={CY} r={4.5} className="fill-banc-dark" />
      </svg>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-banc-dark">
          <span aria-hidden className="inline-block size-2 rounded-full" style={{ backgroundColor: TONE[gauge.tone] }} />
          {gauge.label}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-banc-muted-readable">{gauge.caption}</p>
      </div>
    </div>
  );
}
