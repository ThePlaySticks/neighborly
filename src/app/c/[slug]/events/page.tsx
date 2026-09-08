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
import { Calendar, ArrowLeft, MapPin, Clock, Plus } from 'lucide-react'

export default async function CommunityEventsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const community = dal.getCommunityBySlug(slug)

  if (!community) notFound()

  const currentUser = await getCurrentUser()
  const membership = currentUser ? dal.getMembership(currentUser.id, community.id) : null

  if (!membership || membership.status !== 'APPROVED') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md text-center space-y-4">
            <h1 className="text-xl font-bold">Verified Residents Only</h1>
            <p className="text-xs text-muted-foreground">Estate events are private to verified residents.</p>
            <Link href={`/c/${slug}`}><Button size="sm">Go to Estate</Button></Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const events = dal.getEvents(community.id)

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
              <h1 className="text-2xl font-black text-foreground">Community Events</h1>
              <p className="text-xs text-muted-foreground">{community.name}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {events.length === 0 ? (
            <Card className="p-8 text-center border border-border bg-card space-y-2">
              <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">No upcoming estate events scheduled.</p>
            </Card>
          ) : (
            events.map((evt) => (
              <Card key={evt.id} className="p-6 border border-border bg-card space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/20 bg-primary/5">
                    Estate Event
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" /> {evt.date}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-foreground">{evt.title}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{evt.description}</p>
                <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {evt.location}
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
