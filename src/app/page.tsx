import React from 'react'
import Link from 'next/link'
import { dal } from '@/lib/dal'
import { getCurrentUser } from '@/lib/auth/session'
import { Building2, Users, ShieldCheck, ArrowRight, CheckCircle2, Lock, Sparkles, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CommunityRegisterModal } from '@/components/features/community/CommunityRegisterModal'

export default async function HomePage() {
  const communities = dal.getAllCommunities()
  const currentUser = await getCurrentUser()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-16 md:py-24 border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Private & Verified Nigerian Gated Estates</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                A Private Digital Community <br className="hidden sm:inline" />
                <span className="text-primary">For Your Estate.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Unlike public social networks, Neighborly creates an isolated, secure portal for each estate. Connect with verified neighbors, receive official management notices, discover trusted local artisans, and post marketplace items.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <CommunityRegisterModal />
                <a href="#estates">
                  <Button variant="outline" className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold">
                    Explore Estates
                  </Button>
                </a>
              </div>

              {/* HOW IT WORKS MINI BADGES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 text-left border-t border-border/60">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">1. Estate Registers</p>
                  <p className="text-[11px] text-muted-foreground">Admin registers the estate & claims a unique slug</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">2. Residents Join</p>
                  <p className="text-[11px] text-muted-foreground">Residents submit house & block details for review</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">3. Admin Verifies</p>
                  <p className="text-[11px] text-muted-foreground">Estate management approves verified residents</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">4. Private Feed</p>
                  <p className="text-[11px] text-muted-foreground">Safe, isolated discussions without outsiders</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVE ESTATES / COMMUNITIES */}
        <section id="estates" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Active Communities</h2>
              <p className="text-sm text-muted-foreground mt-1">Each estate operates inside its own isolated digital network.</p>
            </div>
            <CommunityRegisterModal buttonText="Register Your Estate" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {communities.map((comm) => {
              const residentCount = dal.getCommunityMembers(comm.id, 'APPROVED').length
              return (
                <Card key={comm.id} className="overflow-hidden border border-border/80 hover:border-primary/50 transition-all hover:shadow-xl group flex flex-col justify-between bg-card rounded-2xl">
                  <div>
                    {/* Nextdoor-style Estate Cover Photo Banner */}
                    <div className="relative h-44 w-full overflow-hidden bg-muted">
                      {comm.coverImage ? (
                        <img
                          src={comm.coverImage}
                          alt={comm.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-primary/30 to-muted flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-black/60 text-white backdrop-blur-md border border-white/10">
                          {comm.communityType}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-card text-primary font-black text-lg flex items-center justify-center shadow-lg border border-border shrink-0 overflow-hidden">
                          {comm.logo ? (
                            <img src={comm.logo} alt={comm.name} className="w-full h-full object-cover" />
                          ) : (
                            comm.name[0]
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-white tracking-tight truncate drop-shadow-sm">
                            {comm.name}
                          </h3>
                          <p className="text-[11px] text-white/80 flex items-center gap-1 drop-shadow-sm">
                            <MapPin className="w-3 h-3 text-primary" />
                            {comm.city}, {comm.state}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {comm.description || 'Private gated residential estate on Neighborly.'}
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          <span className="inline-block h-5 w-5 rounded-full ring-2 ring-card bg-primary/20 text-primary text-[9px] font-bold text-center leading-5">F</span>
                          <span className="inline-block h-5 w-5 rounded-full ring-2 ring-card bg-emerald-500/20 text-emerald-600 text-[9px] font-bold text-center leading-5">C</span>
                          <span className="inline-block h-5 w-5 rounded-full ring-2 ring-card bg-amber-500/20 text-amber-600 text-[9px] font-bold text-center leading-5">A</span>
                        </div>
                        <span>
                          <strong className="text-foreground font-semibold">{residentCount}</strong> verified neighbors
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link href={`/c/${comm.slug}`} className="block">
                      <Button size="sm" className="w-full rounded-xl text-xs font-semibold gap-1.5 py-2.5">
                        Enter Estate <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        {/* COMPARISON: NEIGHBORLY VS GENERAL SOCIAL NETWORKS */}
        <section className="py-16 bg-muted/20 border-t border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Built specifically for gated estates
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Why generic neighborhood networks fail Nigerian estates and why Neighborly works.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 border-destructive/20 bg-destructive/5 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-destructive">Traditional Neighborhood Apps</p>
                <h3 className="text-lg font-bold text-foreground">Open, Unverified &amp; Public</h3>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">✕ Anyone within a wide radius can join and post</li>
                  <li className="flex items-start gap-2">✕ Zero estate-level admin gatekeeping or address verification</li>
                  <li className="flex items-start gap-2">✕ Private estate notices leak to the public</li>
                  <li className="flex items-start gap-2">✕ Security reports are visible to unknown strangers</li>
                </ul>
              </Card>

              <Card className="p-6 border-primary/20 bg-primary/5 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Neighborly Platform</p>
                <h3 className="text-lg font-bold text-foreground">Strict Multi-Tenant Isolation</h3>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Dedicated digital community with verified resident approval</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Community admins approve members by Block &amp; House Number</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> 100% tenant isolation: Banana Island never sees Lekki Phase 1 data</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Official announcements clearly badged and prioritized</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
