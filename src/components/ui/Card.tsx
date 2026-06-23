import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  gradientBorder?: boolean
}

export function Card({
  className,
  hoverEffect = true,
  gradientBorder = false,
  children
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-lg border border-border shadow-sm overflow-hidden transition-all duration-300',
        hoverEffect && 'hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30',
        gradientBorder && 'relative p-[1px] before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary before:to-secondary before:-z-10 before:rounded-lg',
        className
      )}
    >
      {gradientBorder ? (
        <div className="bg-card w-full h-full rounded-[calc(var(--radius)-1px)] p-6">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-6 flex flex-col space-y-1.5', className)}>{children}</div>
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-lg font-semibold leading-tight tracking-tight', className)}>{children}</h3>
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-6 pt-0 flex items-center', className)}>{children}</div>
}
