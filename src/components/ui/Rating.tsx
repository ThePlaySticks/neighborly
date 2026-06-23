'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

export interface RatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
  onChange?: (value: number) => void
  showValue?: boolean
  className?: string
}

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function Rating({
  value,
  max = 5,
  size = 'md',
  readonly = true,
  onChange,
  showValue = false,
  className,
}: RatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null)
  const display = hovered ?? value

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
        const filled = display >= star
        const halfFilled = !filled && display >= star - 0.5
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            aria-label={`Rate ${star} out of ${max}`}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(null)}
            className={cn(
              'transition-transform',
              !readonly && 'cursor-pointer hover:scale-110',
              readonly && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizeMap[size],
                filled || halfFilled ? 'star-filled' : 'star-empty'
              )}
            />
          </button>
        )
      })}
      {showValue && (
        <span className="ml-1.5 text-sm font-semibold text-foreground tabular-nums">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export function RatingDisplay({
  value,
  count,
  size = 'sm',
}: {
  value: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <Rating value={value} size={size} readonly showValue />
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>
      )}
    </div>
  )
}
