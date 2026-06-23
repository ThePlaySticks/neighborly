'use client'

import React, { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface DropdownItem {
  label: string
  value?: string
  icon?: React.ReactNode
  href?: string
  danger?: boolean
  disabled?: boolean
  onClick?: () => void
  divider?: boolean
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
  const [open, setOpen] = React.useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-48 rounded-xl border border-border bg-popover shadow-xl ring-1 ring-black/5 dark:ring-white/5 p-1.5 animate-slide-down',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} className="my-1 h-px bg-border" />
            }

            const handleClick = () => {
              if (!item.disabled) {
                item.onClick?.()
                setOpen(false)
              }
            }

            if (item.href) {
              return (
                <a
                  key={i}
                  href={item.href}
                  onClick={handleClick}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors',
                    item.danger
                      ? 'text-destructive hover:bg-destructive/10'
                      : 'text-foreground hover:bg-muted',
                    item.disabled && 'opacity-40 pointer-events-none'
                  )}
                >
                  {item.icon && <span className="shrink-0 text-muted-foreground">{item.icon}</span>}
                  {item.label}
                </a>
              )
            }

            return (
              <button
                key={i}
                onClick={handleClick}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors text-left',
                  item.danger
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-foreground hover:bg-muted',
                  item.disabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                {item.icon && <span className="shrink-0 text-muted-foreground">{item.icon}</span>}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --- Simple Select-style Dropdown Trigger Convenience ---
export function DropdownTrigger({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg bg-card text-foreground hover:bg-muted transition-colors',
        className
      )}
    >
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  )
}
