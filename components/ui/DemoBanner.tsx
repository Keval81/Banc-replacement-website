import { Info } from "lucide-react";

interface DemoBannerProps {
  className?: string;
}

// Honest preview notice for portal/progress surfaces that still render
// illustrative data. Keep the copy plain: this is sample content, not the
// visitor's own account.
export function DemoBanner({ className = "" }: DemoBannerProps) {
  return (
    <div
      role="note"
      aria-label="Demo preview"
      className={`mb-6 flex items-start gap-3 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 ${className}`.trim()}
    >
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <p>
        <strong className="font-semibold">Demo preview</strong> — the details
        shown here are sample data. Live account data is coming soon.
      </p>
    </div>
  );
}

export default DemoBanner;
