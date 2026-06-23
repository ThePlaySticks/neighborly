'use client'

import React, { createContext, useContext, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void
  success: (message: string, description?: string) => void
  error: (message: string, description?: string) => void
  warning: (message: string, description?: string) => void
  info: (message: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200',
  error: 'border-red-500/30 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200',
  warning: 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200',
  info: 'border-blue-500/30 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200',
}

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
  error: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const variant = toast.variant ?? 'info'

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'pointer-events-auto flex w-80 items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm animate-slide-in-right',
        variantStyles[variant]
      )}
    >
      {variantIcons[variant]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug">{toast.message}</p>
        {toast.description && (
          <p className="text-xs mt-0.5 opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const duration = opts.duration ?? 4000
    setToasts((prev) => [...prev, { ...opts, id }])
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  const value: ToastContextValue = {
    toast: addToast,
    success: (message, description) => addToast({ message, description, variant: 'success' }),
    error: (message, description) => addToast({ message, description, variant: 'error' }),
    warning: (message, description) => addToast({ message, description, variant: 'warning' }),
    info: (message, description) => addToast({ message, description, variant: 'info' }),
  }

  const portal = typeof document !== 'undefined'
    ? createPortal(
        <div id="toast-portal">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )
    : null

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portal}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
