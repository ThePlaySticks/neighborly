'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Bell, Shield, Calendar, Plus, CheckCircle, AlertTriangle } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
}

interface Profile {
  estate_id: string
  role: string
}

export default function NoticeBoard({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [estateId, setEstateId] = useState<string | null>(null)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        // Get user session
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('estate_id, role')
            .eq('id', user.id)
            .single()

          if (profileData) {
            setProfile(profileData)
            setEstateId(profileData.estate_id)

            // Fetch Announcements for this estate
            const { data: announcementsData } = await supabase
              .from('announcements')
              .select('*')
              .eq('estate_id', profileData.estate_id)
              .order('created_at', { ascending: false })

            if (announcementsData) {
              setAnnouncements(announcementsData)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching notice data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [site])

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estateId) return
    setSubmitting(true)
    setSuccessMsg('')

    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          estate_id: estateId,
          title,
          content,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setAnnouncements([data, ...announcements])
        setTitle('')
        setContent('')
        setSuccessMsg('Announcement posted successfully!')
        setShowAddForm(false)
      }
    } catch (err) {
      console.error('Failed to post announcement:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading Notice Board...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isAdmin = profile?.role === 'estate_admin' || profile?.role === 'super_admin'

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/20 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Notice Board
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Official broadcasts and notices for residents.
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="font-semibold rounded-xl flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Create Broadcast
              </Button>
            )}
          </div>

          {/* Add announcement Form */}
          {showAddForm && (
            <Card className="p-6 border-primary/20 bg-primary/5 animate-slide-down">
              <h3 className="font-bold text-foreground text-lg mb-4 flex items-center gap-1.5">
                <Shield className="h-5 w-5 text-primary" /> New Announcement Broadcast
              </h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Broadcast Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Water Pump Maintenance Scheduled"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detailed Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide detailed instruction, times, contact numbers, etc."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="font-semibold">
                    {submitting ? 'Posting...' : 'Post Broadcast'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-2 animate-fade-in">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Announcements list */}
          <div className="space-y-6">
            {announcements.length === 0 ? (
              <Card className="p-8 text-center py-16">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40 animate-pulse" />
                <h3 className="font-bold text-foreground text-lg">No Announcements</h3>
                <p className="text-muted-foreground text-sm mt-1">There are no notices posted yet for this estate.</p>
              </Card>
            ) : (
              announcements.map((announcement) => (
                <Card key={announcement.id} className="p-6 hover:shadow-lg transition-shadow border border-border">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-lg text-foreground leading-tight">{announcement.title}</h3>
                    <Badge variant="default" className="text-xs shrink-0 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3 leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </Card>
              ))
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
