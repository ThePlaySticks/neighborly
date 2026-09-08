'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Check, Copy, ExternalLink } from 'lucide-react'

export function CopyRegistrationLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)

  const getFullUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`
    }
    return path
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = getFullUrl()
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-muted/60 border border-border rounded-xl px-4 py-2.5 text-xs font-mono text-foreground truncate select-all">
        {typeof window !== 'undefined' ? getFullUrl() : path}
      </div>
      <Button
        type="button"
        size="sm"
        variant={copied ? 'primary' : 'outline'}
        className="rounded-xl text-xs font-semibold gap-1.5 shrink-0 min-w-[90px]"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            Copy Link
          </>
        )}
      </Button>
      <a href={path} target="_blank" rel="noopener noreferrer">
        <Button type="button" size="sm" variant="ghost" className="rounded-xl text-xs h-9 w-9 p-0">
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </a>
    </div>
  )
}
