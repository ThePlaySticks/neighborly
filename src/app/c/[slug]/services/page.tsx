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
import { Wrench, ArrowLeft, Star, Phone, ShieldCheck } from 'lucide-react'

export default async function CommunityServicesPage({ params }: { params: Promise<{ slug: string }> }) {
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
            <p className="text-xs text-muted-foreground">Community service directory is private to verified residents.</p>
            <Link href={`/c/${slug}`}><Button size="sm">Go to Estate</Button></Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const providers = dal.getServiceProviders(community.id)

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
              <h1 className="text-2xl font-black text-foreground">Trusted Services &amp; Artisans</h1>
              <p className="text-xs text-muted-foreground">Discovered and recommended in {community.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {providers.map((srv) => (
            <Card key={srv.id} className="p-5 border border-border bg-card space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5">
                    {srv.category}
                  </Badge>
                  <h2 className="text-base font-bold text-foreground mt-1">{srv.name}</h2>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{srv.rating}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{srv.description}</p>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <a
                  href={`tel:${srv.phone}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" /> {srv.phone}
                </a>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-primary" /> Verified Artisan
                </span>
              </div>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
