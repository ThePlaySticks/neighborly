'use client'

import React, { useState } from 'react'
import { createAnnouncementAction } from '@/lib/actions/community'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Megaphone, Plus } from 'lucide-react'

export function AdminCreateAnnouncementModal({ communitySlug }: { communitySlug: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('General')
  const [priority, setPriority] = useState('normal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('communitySlug', communitySlug)
    formData.append('title', title)
    formData.append('content', content)
    formData.append('category', category)
    formData.append('priority', priority)

    const res = await createAnnouncementAction(formData)
    setLoading(false)

    if (res.success) {
      setTitle('')
      setContent('')
      setIsOpen(false)
    } else {
      setError(res.error || 'Failed to post announcement')
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        className="rounded-xl text-xs font-semibold gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> Publish Announcement
      </Button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Publish Official Notice">
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-xl border border-destructive/20 font-medium">
              {error}
            </div>
          )}

          <Input
            label="Announcement Title"
            placeholder="e.g. Estate Generator Maintenance Schedule"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="General">General</option>
                <option value="Security">Security</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Emergency">Emergency</option>
                <option value="Utilities">Utilities</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notice Content</label>
            <textarea
              required
              rows={4}
              placeholder="Enter official estate notice details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-input bg-card text-xs text-foreground focus:ring-1 focus:ring-primary outline-none resize-none"
            />
          </div>

          <Button type="submit" isLoading={loading} className="w-full rounded-xl py-3 font-semibold text-xs">
            Publish Notice
          </Button>
        </form>
      </Modal>
    </>
  )
}
