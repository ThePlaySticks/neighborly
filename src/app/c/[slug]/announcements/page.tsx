import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { dal } from '@/lib/dal'
import { getCurrentUser } from '@/lib/auth/session'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Bell, ArrowLeft, Megaphone, ShieldAlert, Calendar, Shield } from 'lucide-react'

export default async function CommunityAnnouncementsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const community = dal.getCommunityBySlug(slug)

  if (!community) {
    notFound()
  }

  const currentUser = await getCurrentUser()
  const membership = currentUser ? dal.getMembership(currentUser.id, community.id) : null

  if (!membership || membership.status !== 'APPROVED') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md text-center space-y-4 bg-card">
            <Shield className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-xl font-black text-foreground">Verified Residents Only</h1>
            <p className="text-xs text-muted-foreground">
              Official estate announcements for {community.name} are private and accessible only to approved residents.
            </p>
            <Link href={`/c/${slug}`}>
              <Button size="sm" className="rounded-xl">Go to Community Gate</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const announcements = dal.getAnnouncements(community.id)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/c/${community.slug}`}>
              <Button variant="ghost" size="sm" className="rounded-xl gap-1 text-xs">
                <ArrowLeft className="w-4 h-4" /> Back to Feed
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-foreground">Official Announcements</h1>
              <p className="text-xs text-muted-foreground">{community.name}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card className="p-8 text-center border border-border bg-card space-y-2">
              <Megaphone className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">No official announcements posted yet.</p>
            </Card>
          ) : (
            announcements.map((ann) => (
              <Card key={ann.id} className="p-6 border border-border bg-card space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30 bg-primary/5">
                      {ann.category}
                    </Badge>
                    {ann.priority === 'urgent' || ann.priority === 'high' ? (
                      <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                        {ann.priority.toUpperCase()}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-foreground">{ann.title}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {ann.content}
                </p>

                <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                  Published by <strong>{ann.authorName}</strong> (Estate Management)
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
