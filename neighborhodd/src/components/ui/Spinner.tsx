import React from 'react'
import { cn } from '@/lib/utils'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'white' | 'muted'
}

const sizeMap = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-12 w-12 border-4',
}

const variantMap = {
  primary: 'border-primary border-t-transparent',
  white: 'border-white border-t-transparent',
  muted: 'border-muted-foreground border-t-transparent',
}

export function Spinner({ size = 'md', variant = 'primary', className, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading…"
      className={cn(
        'inline-block animate-spin rounded-full',
        sizeMap[size],
        variantMap[variant],
        className
      )}
      {...props}
    />
  )
}

export function FullPageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
      <Spinner size="xl" />
      <p className="text-sm text-muted-foreground font-medium animate-pulse">{label}</p>
    </div>
  )
}
