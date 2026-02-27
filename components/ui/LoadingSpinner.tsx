"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "primary" | "white" | "muted";
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-3",
  xl: "h-12 w-12 border-4",
};

const colorClasses = {
  primary: "border-primary border-t-transparent",
  white: "border-white border-t-transparent",
  muted: "border-muted-foreground border-t-transparent",
};

export function LoadingSpinner({ 
  size = "md", 
  className,
  color = "primary" 
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Full page loading state
export function FullPageLoader({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "flex min-h-[50vh] items-center justify-center",
        className
      )}
    >
      <LoadingSpinner size="xl" />
    </div>
  );
}

// Inline loading state for buttons/forms
export function InlineLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LoadingSpinner size="sm" />
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  );
}

// Loading overlay for cards/containers
interface LoadingOverlayProps {
  children: React.ReactNode;
  isLoading: boolean;
  className?: string;
}

export function LoadingOverlay({ children, isLoading, className }: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}

// Dots loading animation (alternative style)
export function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label="Loading">
      <span className="sr-only">Loading...</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
