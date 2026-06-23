'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  online?: boolean
  ring?: boolean
}

const sizeMap = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
}

const onlineSizeMap = {
  xs: 'h-1.5 w-1.5 ring-1',
  sm: 'h-2 w-2 ring-1',
  md: 'h-2.5 w-2.5 ring-1',
  lg: 'h-3 w-3 ring-2',
  xl: 'h-3.5 w-3.5 ring-2',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-emerald-500',
    'bg-teal-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-orange-500',
    'bg-blue-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-pink-500',
    'bg-indigo-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({
  src,
  name = '',
  size = 'md',
  online,
  ring,
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  const showFallback = !src || imgError

  return (
    <div
      className={cn('relative inline-flex shrink-0', className)}
      {...props}
    >
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-semibold text-white',
          sizeMap[size],
          showFallback ? getColorFromName(name || 'U') : 'bg-muted',
          ring && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
        )}
      >
        {!showFallback ? (
          <img
            src={src!}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{getInitials(name) || '?'}</span>
        )}
      </div>

      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-background',
            onlineSizeMap[size],
            online ? 'bg-emerald-500' : 'bg-muted-foreground'
          )}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  )
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
}: {
  avatars: { src?: string; name: string }[]
  max?: number
  size?: AvatarProps['size']
}) {
  const visible = avatars.slice(0, max)
  const remaining = avatars.length - max

  return (
    <div className="flex -space-x-2">
      {visible.map((av, i) => (
        <Avatar
          key={i}
          src={av.src}
          name={av.name}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold ring-2 ring-background',
            sizeMap[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
