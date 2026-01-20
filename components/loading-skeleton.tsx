"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <LoadingSkeleton className="h-6 w-1/3" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-4/5" />
      <div className="flex gap-2 pt-2">
        <LoadingSkeleton className="h-9 w-24" />
        <LoadingSkeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function OutputSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
      <div className="space-y-3">
        <LoadingSkeleton className="h-7 w-2/5" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-3">
        <LoadingSkeleton className="h-5 w-1/4" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-5/6" />
        <LoadingSkeleton className="h-4 w-4/5" />
      </div>
      <div className="space-y-3">
        <LoadingSkeleton className="h-5 w-1/3" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function HistoryItemSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <LoadingSkeleton className="h-5 w-2/3" />
        <LoadingSkeleton className="h-3 w-1/3" />
      </div>
      <LoadingSkeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}
