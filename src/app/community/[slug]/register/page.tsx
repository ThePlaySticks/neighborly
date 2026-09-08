import React from 'react'
import { notFound } from 'next/navigation'
import { dal } from '@/lib/dal'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { ResidentRegistrationForm } from '@/components/features/community/ResidentRegistrationForm'
import { ShieldCheck, Building2 } from 'lucide-react'

export default async function ResidentRegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const community = dal.getCommunityBySlug(slug)

  if (!community) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg space-y-6">
          {/* Estate Identity Header */}
          <div className="text-center space-y-3">
            <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl mx-auto">
              {community.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Join {community.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {community.city}, {community.state} · {community.communityType}
              </p>
            </div>
          </div>

          <Card className="p-6 border border-border bg-card">
            <div className="flex items-start gap-3 p-3 mb-5 rounded-xl bg-primary/[0.04] border border-primary/10">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your request will be reviewed by the estate management. Only verified residents of <strong className="text-foreground">{community.name}</strong> will be approved.
              </p>
            </div>

            <ResidentRegistrationForm communitySlug={community.slug} communityName={community.name} />
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
