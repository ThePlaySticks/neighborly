import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { dal, ResidentType } from '@/lib/dal'
import { getCurrentUser } from '@/lib/auth/session'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { ResidentJoinForm } from '@/components/features/community/ResidentJoinForm'
import { ShieldCheck, MapPin, Building2 } from 'lucide-react'

export default async function JoinCommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const community = dal.getCommunityBySlug(slug)

  if (!community) {
    notFound()
  }

  const currentUser = await getCurrentUser()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl">
              {community.name[0]}
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Join {community.name}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {community.location}, {community.city}
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-card border border-border shadow-xl">
            <ResidentJoinForm communitySlug={community.slug} currentUser={currentUser} />
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Already approved?{' '}
            <Link href={`/login?redirect=/c/${community.slug}`} className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
