import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { dal } from '@/lib/dal'
import { getCurrentUser } from '@/lib/auth/session'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { AdminResidentRequests } from '@/components/features/community/AdminResidentRequests'
import { AdminCreateAnnouncementModal } from '@/components/features/community/AdminCreateAnnouncementModal'
import { CopyRegistrationLink } from '@/components/features/community/CopyRegistrationLink'
import {
  ShieldCheck, Users, Megaphone, CheckCircle2, UserCheck,
  AlertTriangle, Link2, ExternalLink, Building2
} from 'lucide-react'

export default async function ManagerDashboardPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/login?redirect=/manager/dashboard')
  }

  // Find all communities where this user is an admin
  const memberships = dal.getUserMemberships(currentUser.id)
  const adminMemberships = memberships.filter(
    (m) => m.role === 'COMMUNITY_ADMIN' || m.role === 'SUPER_ADMIN'
  )

  if (adminMemberships.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md text-center space-y-4 border-destructive/20 bg-card">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-xl font-black text-foreground">No Managed Estates</h1>
            <p className="text-xs text-muted-foreground">
              You are not an administrator of any estate on Neighborly. If you manage a gated estate, register it first.
            </p>
            <Link href="/">
              <Button size="sm" variant="outline">Back to Home</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  // For now, show the first admin community (multi-estate support later)
  const adminMem = adminMemberships[0]
  const community = adminMem.community

  const pendingRequests = dal.getCommunityMembers(community.id, 'PENDING')
  const approvedResidents = dal.getCommunityMembers(community.id, 'APPROVED')
  const announcements = dal.getAnnouncements(community.id)

  // Build the resident registration link
  const registrationPath = `/community/${community.slug}/register`

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border/80 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl">
              {community.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-foreground">{community.name}</h1>
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Estate Management
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Logged in as <strong>{currentUser.fullName}</strong> ({adminMem.role})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AdminCreateAnnouncementModal communitySlug={community.slug} />
            <Link href={`/c/${community.slug}`}>
              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                View Resident Portal →
              </Button>
            </Link>
          </div>
        </div>

        {/* PRIVATE REGISTRATION LINK */}
        <Card className="p-5 border border-primary/20 bg-primary/[0.03] space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Private Resident Registration Link</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link <strong>privately</strong> with your estate residents (via WhatsApp, notice board, or email). Only people with this link can request to join your community.
          </p>
          <CopyRegistrationLink path={registrationPath} />
        </Card>

        {/* METRIC STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 border border-border bg-card space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Pending Requests</span>
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-foreground">{pendingRequests.length}</p>
            <p className="text-[11px] text-muted-foreground">Awaiting your approval</p>
          </Card>

          <Card className="p-5 border border-border bg-card space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Verified Residents</span>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-black text-foreground">{approvedResidents.length}</p>
            <p className="text-[11px] text-muted-foreground">Active in private network</p>
          </Card>

          <Card className="p-5 border border-border bg-card space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Announcements</span>
              <Megaphone className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-black text-foreground">{announcements.length}</p>
            <p className="text-[11px] text-muted-foreground">Official notices posted</p>
          </Card>
        </div>

        {/* PENDING RESIDENT REQUESTS SECTION */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              Pending Resident Verification Requests
            </h2>
            <p className="text-xs text-muted-foreground">
              Review and approve genuine residents of {community.name}. Only approved members gain access to private community features.
            </p>
          </div>

          <AdminResidentRequests
            communitySlug={community.slug}
            requests={pendingRequests}
          />
        </div>

        {/* CURRENT VERIFIED RESIDENTS DIRECTORY */}
        <div className="space-y-4 pt-6 border-t border-border/60">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Verified Community Residents
            </h2>
            <p className="text-xs text-muted-foreground">
              All residents currently approved to access this estate.
            </p>
          </div>

          <Card className="overflow-hidden border border-border bg-card">
            <div className="divide-y divide-border/60">
              {approvedResidents.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No approved residents yet. Share your private registration link to invite residents.
                </div>
              ) : (
                approvedResidents.map((res) => (
                  <div key={res.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {res.user.fullName[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{res.user.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {res.block} • House {res.houseNumber} ({res.residentType})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5">
                        {res.role}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground hidden sm:inline">
                        Approved
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
