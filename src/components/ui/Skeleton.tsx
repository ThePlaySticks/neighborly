import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'circle' | 'rect'
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, variant = 'rect', width, height, style, ...props }: SkeletonProps) {
  const variantClass = {
    line: 'rounded-full h-4',
    circle: 'rounded-full aspect-square',
    rect: 'rounded-lg',
  }

  return (
    <div
      className={cn('skeleton', variantClass[variant], className)}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  )
}

// --- Preset Card Skeleton ---
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 animate-fade-in">
      <div className="flex items-center space-x-3">
        <Skeleton variant="circle" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="line" className="w-1/2 h-3.5" />
          <Skeleton variant="line" className="w-1/3 h-3" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="space-y-2">
        <Skeleton variant="line" className="w-full h-3" />
        <Skeleton variant="line" className="w-4/5 h-3" />
        <Skeleton variant="line" className="w-2/3 h-3" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="line" className="w-20 h-5" />
        <Skeleton className="w-24 h-9 rounded-lg" />
      </div>
    </div>
  )
}

// --- Preset List Item Skeleton ---
export function ListItemSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-border animate-fade-in">
      <Skeleton variant="circle" width={44} height={44} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="line" className="w-3/4 h-4" />
        <Skeleton variant="line" className="w-1/2 h-3" />
      </div>
      <Skeleton className="w-16 h-8 rounded-full" />
    </div>
  )
}

// --- Preset Page Header Skeleton ---
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <Skeleton variant="line" className="w-24 h-5 rounded-full" />
      <Skeleton variant="line" className="w-2/3 h-10" />
      <div className="space-y-2">
        <Skeleton variant="line" className="w-full h-4" />
        <Skeleton variant="line" className="w-4/5 h-4" />
      </div>
    </div>
  )
}
