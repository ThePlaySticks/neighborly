import React from 'react'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { dal } from '@/lib/dal'
import { getCurrentUser } from '@/lib/auth/session'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, UserPlus, LogIn, Lock, Users } from 'lucide-react'
import { CommunityFeedView } from '@/components/features/community/CommunityFeedView'

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const community = dal.getCommunityBySlug(slug)

  if (!community) {
    notFound()
  }

  const currentUser = await getCurrentUser()
  const membership = currentUser ? dal.getMembership(currentUser.id, community.id) : null

  // If approved member -> show community feed experience
  if (membership && membership.status === 'APPROVED') {
    const posts = dal.getCommunityPosts(community.id)
    const announcements = dal.getAnnouncements(community.id)
    const members = dal.getCommunityMembers(community.id, 'APPROVED')

    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <CommunityFeedView
          community={community}
          currentUser={currentUser!}
          membership={membership}
          posts={posts}
          announcements={announcements}
          membersCount={members.length}
        />
        <Footer />
      </div>
    )
  }

  // If pending approval -> show Pending State
  if (membership && membership.status === 'PENDING') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 py-16">
          <Card className="max-w-md w-full p-8 text-center space-y-6 border border-border shadow-xl bg-card">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                Request Pending
              </Badge>
              <h1 className="text-2xl font-black text-foreground">{community.name}</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your membership request has been submitted for <strong>{membership.block} • House {membership.houseNumber}</strong> ({membership.residentType}).
              </p>
            </div>

            <div className="bg-muted/40 p-4 rounded-xl text-left border border-border/60 text-xs space-y-2">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" /> Admin Verification Required
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                To safeguard the privacy and security of residents in {community.name}, an estate administrator must verify and approve your account before you can access the community feed, announcements, and resident directory.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="rounded-xl">
                  Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  // If rejected -> show rejection note with option to reapply
  if (membership && membership.status === 'REJECTED') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 py-16">
          <Card className="max-w-md w-full p-8 text-center space-y-6 border border-destructive/30 shadow-xl bg-card">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <Badge variant="outline" className="text-destructive border-destructive/30">
                Membership Rejected
              </Badge>
              <h1 className="text-2xl font-black text-foreground">{community.name}</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your membership request for {community.name} was not approved.
              </p>
              {membership.rejectionReason && (
                <p className="text-xs bg-destructive/10 text-destructive p-3 rounded-xl border border-destructive/20 font-medium">
                  Reason: {membership.rejectionReason}
                </p>
              )}
            </div>

            <Link href={`/c/${community.slug}/join`}>
              <Button size="sm" className="rounded-xl">
                Re-submit Registration Details
              </Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  // Default: Unauthenticated or non-member landing for this specific community
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-xl w-full text-center space-y-6">
          {/* Nextdoor-Style Estate Identity Card with Photo Header */}
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-card">
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-muted">
              {community.coverImage ? (
                <img
                  src={community.coverImage}
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-primary/30 to-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-black/30 to-transparent" />
              
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/60 text-white backdrop-blur-md border border-white/10">
                  {community.communityType}
                </span>
              </div>
            </div>

            <div className="px-6 pb-8 pt-0 -mt-12 relative z-10 space-y-5">
              <div className="h-20 w-20 mx-auto rounded-2xl bg-card border-2 border-border text-primary flex items-center justify-center font-black text-3xl shadow-xl overflow-hidden">
                {community.logo ? (
                  <img src={community.logo} alt={community.name} className="w-full h-full object-cover" />
                ) : (
                  community.name[0]
                )}
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Private Estate Network
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                  {community.name}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {community.description || `Welcome to the private digital community for ${community.name}. Connect with verified neighbors, artisans, and estate management.`}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {community.location}, {community.city}
                </p>
              </div>

              <div className="border-t border-border/70 pt-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href={`/c/${community.slug}/join`} className="w-full">
                    <Button className="w-full rounded-xl py-3 font-semibold text-xs gap-2 shadow-md">
                      <UserPlus className="w-4 h-4" />
                      Join This Community
                    </Button>
                  </Link>

                  <Link href={`/login?redirect=/c/${community.slug}`} className="w-full">
                    <Button variant="outline" className="w-full rounded-xl py-3 font-semibold text-xs gap-2">
                      <LogIn className="w-4 h-4" />
                      Resident Sign In
                    </Button>
                  </Link>
                </div>

                <div className="pt-2">
                  <Link href={`/c/${community.slug}/admin`} className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium">
                    Estate Management Portal →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
                  <LogIn className="w-4 h-4" />
                  Resident Sign In
                </Button>
              </Link>
            </div>

            <div className="pt-2">
              <Link href={`/c/${community.slug}/admin`} className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
                Estate Management Login →
              </Link>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
