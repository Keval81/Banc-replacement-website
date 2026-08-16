import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

interface PropertyPhotoPlaceholderProps {
  message?: string;
  className?: string;
}

export function PropertyPhotoPlaceholder({
  message = "No photos available",
  className,
}: PropertyPhotoPlaceholderProps): React.ReactElement {
  return (
    <div
      role="img"
      aria-label={message}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3 bg-banc-grey-pale px-6 text-center text-banc-muted-readable",
        className
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-banc-dark/15 bg-white text-banc-dark">
        <ImageOff className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
