'use client'

import React, { createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs sub-components must be inside <Tabs />')
  return ctx
}

export interface TabsProps {
  defaultTab: string
  children: React.ReactNode
  onChange?: (tab: string) => void
  className?: string
}

export function Tabs({ defaultTab, children, onChange, className }: TabsProps) {
  const [activeTab, setActiveTabState] = React.useState(defaultTab)

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab)
    onChange?.(tab)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export interface TabListProps {
  children: React.ReactNode
  className?: string
  variant?: 'underline' | 'pill' | 'card'
}

export function TabList({ children, className, variant = 'underline' }: TabListProps) {
  const variantStyle = {
    underline: 'border-b border-border flex gap-1 overflow-x-auto scrollbar-hide',
    pill: 'flex gap-1.5 overflow-x-auto scrollbar-hide bg-muted p-1 rounded-lg',
    card: 'flex gap-1 overflow-x-auto scrollbar-hide bg-muted p-1 rounded-xl',
  }

  return (
    <div role="tablist" className={cn(variantStyle[variant], className)}>
      {children}
    </div>
  )
}

export interface TabProps {
  value: string
  children: React.ReactNode
  className?: string
  variant?: 'underline' | 'pill' | 'card'
  icon?: React.ReactNode
  badge?: string | number
  disabled?: boolean
}

export function Tab({ value, children, className, variant = 'underline', icon, badge, disabled }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value

  const variants: Record<string, Record<'active' | 'inactive', string>> = {
    underline: {
      active: 'border-b-2 border-primary text-primary font-semibold',
      inactive: 'border-b-2 border-transparent text-muted-foreground hover:text-foreground',
    },
    pill: {
      active: 'bg-card text-foreground font-semibold shadow-sm',
      inactive: 'text-muted-foreground hover:text-foreground',
    },
    card: {
      active: 'bg-background text-foreground font-semibold shadow-sm',
      inactive: 'text-muted-foreground hover:text-foreground',
    },
  }

  return (
    <button
      role="tab"
      id={`tab-${value}`}
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm rounded-md transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant][isActive ? 'active' : 'inactive'],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {badge !== undefined && (
        <span
          className={cn(
            'ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold',
            isActive ? 'bg-primary text-white' : 'bg-muted-foreground/20 text-muted-foreground'
          )}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

export interface TabPanelProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { activeTab } = useTabsContext()
  if (activeTab !== value) return null

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={cn('mt-4 animate-fade-in', className)}
    >
      {children}
    </div>
  )
}
