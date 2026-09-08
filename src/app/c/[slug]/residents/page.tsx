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
import { Users, ArrowLeft, ShieldCheck, Shield } from 'lucide-react'

export default async function CommunityResidentsDirectoryPage({ params }: { params: Promise<{ slug: string }> }) {
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
              To protect resident privacy, the resident directory of {community.name} is accessible only to approved neighbors.
            </p>
            <Link href={`/c/${slug}`}>
              <Button size="sm" className="rounded-xl">Go to Community</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const approvedResidents = dal.getCommunityMembers(community.id, 'APPROVED')

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/c/${community.slug}`}>
            <Button variant="ghost" size="sm" className="rounded-xl gap-1 text-xs">
              <ArrowLeft className="w-4 h-4" /> Back to Feed
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground">Resident Directory</h1>
            <p className="text-xs text-muted-foreground">Verified neighbors in {community.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {approvedResidents.map((res) => (
            <Card key={res.id} className="p-4 border border-border/80 bg-card space-y-2 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {res.user.fullName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-foreground truncate">{res.user.fullName}</p>
                    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {res.block} • House {res.houseNumber}
                  </p>
                </div>
                <Badge variant="outline" className="text-[9px] text-primary border-primary/20 bg-primary/5">
                  {res.residentType}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
