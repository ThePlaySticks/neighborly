import React from 'react'
import Link from 'next/link'
import { Building2, ShieldCheck, CheckCircle2, Lock, Users, Bell, MessageSquare, ShoppingBag, Wrench, ArrowRight, Eye, EyeOff, Globe, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CommunityRegisterModal } from '@/components/features/community/CommunityRegisterModal'

export default async function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1">
        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden py-20 md:py-32 border-b border-border/40">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.04] rounded-full blur-3xl" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06] text-primary text-xs font-semibold tracking-wide">
                <Lock className="w-3.5 h-3.5" />
                <span>Private Multi-Tenant Estate Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
                Your estate deserves its own <br className="hidden sm:inline" />
                <span className="text-primary">private digital community.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Neighborly gives each gated estate a fully isolated, secure portal — for announcements, resident verification, marketplace, and trusted service providers. No outsiders. No public profiles. Just your community.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <CommunityRegisterModal buttonText="Register Your Estate" />
                <Link href="/login">
                  <Button variant="outline" className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold gap-2">
                    <KeyRound className="w-4 h-4" />
                    Manager Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how-it-works" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              How it works
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Three steps to bring your estate online — in under five minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Estate Registers',
                desc: 'Your estate management registers on Neighborly and claims a unique community URL.',
                icon: Building2,
              },
              {
                step: '02',
                title: 'Share Private Link',
                desc: 'You receive a private resident registration link. Share it only with verified residents — via WhatsApp, notice board, or email.',
                icon: KeyRound,
              },
              {
                step: '03',
                title: 'Approve & Launch',
                desc: 'Review incoming resident requests, approve verified members, and your private community goes live.',
                icon: ShieldCheck,
              },
            ].map((item) => (
              <Card key={item.step} className="p-6 border border-border/80 bg-card space-y-4 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">{item.step}</span>
                </div>
                <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section id="features" className="py-20 bg-muted/20 border-y border-border/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Everything your estate needs
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Purpose-built tools for Nigerian gated communities. No generic social network noise.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Bell, title: 'Official Announcements', desc: 'Estate management posts notices that reach every verified resident — maintenance schedules, security alerts, levy updates.' },
                { icon: Users, title: 'Resident Verification', desc: 'Admin approves each member by block and house number. No strangers, no impersonators.' },
                { icon: MessageSquare, title: 'Community Feed', desc: 'Residents discuss estate matters, recommend service providers, and post helpful updates — privately.' },
                { icon: ShoppingBag, title: 'Marketplace', desc: 'Buy and sell within your estate. Furniture, electronics, household items — all from verified neighbors you trust.' },
                { icon: Wrench, title: 'Trusted Services', desc: 'Find plumbers, electricians, and cleaners recommended by your actual neighbors — not random reviews.' },
                { icon: Lock, title: 'Total Privacy', desc: '100% tenant isolation. Banana Island residents never see Lekki Phase 1 data. Your estate is your own.' },
              ].map((feat) => (
                <div key={feat.title} className="flex gap-4 p-5 rounded-xl border border-transparent hover:border-border/80 hover:bg-card transition-all">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRIVATE BY DESIGN — COMPARISON ===== */}
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Private by design
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Why generic neighborhood apps fail Nigerian gated estates — and why Neighborly works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 border-destructive/20 bg-destructive/[0.04] space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-destructive" />
                <p className="text-xs font-bold uppercase tracking-wider text-destructive">Public Neighborhood Apps</p>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="text-destructive font-bold mt-px">✕</span>
                  Anyone within a wide radius can join and post
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-destructive font-bold mt-px">✕</span>
                  Zero estate-level admin gatekeeping or address verification
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-destructive font-bold mt-px">✕</span>
                  Private estate notices visible to unknown strangers
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-destructive font-bold mt-px">✕</span>
                  Community data browsable by the public
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-primary/20 bg-primary/[0.04] space-y-4">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Neighborly Platform</p>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-px" />
                  Dedicated digital community with verified resident approval
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-px" />
                  Community admins approve members by Block &amp; House Number
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-px" />
                  100% tenant isolation — no cross-estate data leakage
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-px" />
                  Private registration link — only shared by estate management
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="py-20 bg-muted/20 border-t border-border/40">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Ready to bring your estate online?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Register your estate in under 2 minutes. You&apos;ll get a private registration link to share with your residents.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <CommunityRegisterModal buttonText="Register Your Estate" />
              <Link href="/login">
                <Button variant="outline" className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold">
                  Manager Login
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
