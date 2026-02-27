"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "circle" | "text" | "rect";
  width?: string | number;
  height?: string | number;
  animated?: boolean;
}

export function Skeleton({
  className,
  variant = "default",
  width,
  height,
  animated = true,
}: SkeletonProps) {
  const baseClasses = cn(
    "bg-muted",
    animated && "animate-pulse",
    variant === "circle" && "rounded-full",
    variant === "text" && "rounded-md",
    variant === "rect" && "rounded-none",
    variant === "default" && "rounded-xl",
    className
  );

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return <div className={baseClasses} style={style} aria-hidden="true" />;
}

// Pre-built skeleton patterns for common use cases

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton variant="rect" className="aspect-[4/3] w-full" />
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton variant="text" className="h-8 w-20" />
        <Skeleton variant="text" className="h-8 w-20" />
      </div>
    </div>
  );
}

export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 rounded-xl bg-card p-3", className)}>
      <Skeleton variant="rect" className="aspect-[4/3] w-full rounded-lg" />
      <Skeleton variant="text" className="h-6 w-1/3" />
      <Skeleton variant="text" className="h-5 w-3/4" />
      <Skeleton variant="text" className="h-4 w-1/2" />
      <div className="flex gap-4 pt-2">
        <Skeleton variant="text" className="h-4 w-16" />
        <Skeleton variant="text" className="h-4 w-16" />
        <Skeleton variant="text" className="h-4 w-16" />
      </div>
    </div>
  );
}

export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function AvatarSkeleton({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Skeleton
      variant="circle"
      className={className}
      width={size}
      height={size}
    />
  );
}

export function ButtonSkeleton({ className }: { className?: string }) {
  return <Skeleton variant="text" className={cn("h-10 w-32", className)} />;
}

export function SearchResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero skeleton */}
      <Skeleton variant="rect" className="h-[50vh] w-full" />
      
      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-4">
          <Skeleton variant="text" className="h-8 w-1/3" />
          <TextSkeleton lines={3} />
        </div>
        
        <SearchResultsSkeleton count={3} />
        
        <div className="space-y-4">
          <Skeleton variant="text" className="h-8 w-1/4" />
          <TextSkeleton lines={4} />
        </div>
      </div>
    </div>
  );
}
