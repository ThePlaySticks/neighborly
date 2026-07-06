'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Shield, CreditCard, Bell, ShoppingBag, AlertTriangle,
  ArrowRight, CheckCircle, DollarSign, Globe, MapPin, Mail, Phone, Send,
  Zap, Lock, ChevronDown, Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

// Scroll reveal IntersectionObserver hook (fallback if Motion is still installing)
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const revealElements = el.querySelectorAll('.reveal, .reveal-scale')
    revealElements.forEach((child) => observer.observe(child))
    if (el.classList.contains('reveal') || el.classList.contains('reveal-scale')) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return ref
}

export default function SaaSProductLanding() {
  const [email, setEmail] = useState('')
  const [demoRequested, setDemoRequested] = useState(false)

  const heroRef = useScrollReveal()
  const featuresRef = useScrollReveal()
  const stepsRef = useScrollReveal()
  const pricingRef = useScrollReveal()
  const contactRef = useScrollReveal()

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setDemoRequested(true)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* ===================== HERO SECTION ===================== */}
      {/* Viewport stability: min-h-[100dvh], Hero top padding cap: pt-20 */}
      <section className="relative overflow-hidden pt-20 pb-20 flex items-center min-h-[100dvh] bg-mesh-light dark:bg-mesh-dark">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full" ref={heroRef}>
          {/* Content stack has exactly 4 elements to avoid layout clutter */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Element 1: Hero Eyebrow (Limit: 1 eyebrow per 3 sections) */}
            <div className="reveal" style={{ transitionDelay: '0ms' }}>
              <Badge
                variant="outline"
                className="px-4 py-1.5 text-xs font-semibold rounded-full border-border/80 bg-card text-primary shadow-sm"
              >
                🇳🇬 Built for modern Gated Communities &amp; Estates in Nigeria
              </Badge>
            </div>

            {/* Element 2: Headline (Strictly 2 lines, no gradient text) */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-[1.05] reveal" style={{ transitionDelay: '80ms' }}>
              Personalized Portals for <span className="text-primary">Every Estate</span>
            </h1>

            {/* Element 3: Subtext (Max 20 words) */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto reveal" style={{ transitionDelay: '160ms' }}>
              Secure private subdomains for notice boards, community marketplaces, visitor gate passes, and automated levy billing.
            </p>

            {/* Element 4: CTAs (1 primary, 1 secondary) */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 reveal" style={{ transitionDelay: '240ms' }}>
              <Link href="/signup">
                <Button size="lg" className="btn-interactive font-semibold px-8 shadow-sm rounded-xl text-sm">
                  Register Your Estate <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="btn-interactive font-semibold px-8 rounded-xl text-sm border-border hover:bg-muted">
                  Explore Features
                </Button>
              </a>
            </div>

            {/* Premium browser URL representation - replacing low-fidelity details */}
            <div className="pt-8 max-w-md mx-auto reveal" style={{ transitionDelay: '320ms' }}>
              <div className="glass rounded-xl p-3.5 shadow-sm border border-border/60 flex items-center gap-3">
                <div className="flex gap-1.5 shrink-0">
                  <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                </div>
                <div className="flex-1 bg-muted/60 rounded-lg py-1.5 px-3 text-xs text-muted-foreground font-mono flex items-center justify-between border border-border/30">
                  <span>https://<strong className="text-primary font-bold">your-estate</strong>.neighborly.ng</span>
                  <Lock className="h-3 w-3 text-primary shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES SECTION (Bento Grid) ===================== */}
      <section id="features" className="relative py-24 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={featuresRef}>
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground reveal" style={{ transitionDelay: '0ms' }}>
              Everything Needed to Run a Gated Community
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm reveal" style={{ transitionDelay: '80ms' }}>
              Each estate gets an isolated database row, notice boards, local trades, and visitor validation.
            </p>
          </div>

          {/* Rhythmic Bento Grid (Varied sizes and drenching, replacing identical card grids) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal-stagger">
            
            {/* Card 1: Personalized Subdomain (col-span-2, light tint background) */}
            <div className="md:col-span-2 reveal-scale">
              <Card className="p-8 h-full bg-primary/5 border-primary/10 hover:border-primary/30 flex flex-col justify-between hoverEffect={false}">
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground">Dedicated Subdomains</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-md">
                      Set up an estate-specific site (e.g., lekki-gardens.neighborly.ng). Residents verify their identity, pay dues, and stay updated inside a private space.
                    </p>
                  </div>
                </div>
                
                {/* Visual mock search field */}
                <div className="mt-8 bg-card border border-border/80 rounded-xl p-3 shadow-sm flex items-center gap-3 max-w-sm">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground font-mono flex-1">banana-island.neighborly.ng</span>
                  <Check className="h-4 w-4 text-primary" />
                </div>
              </Card>
            </div>

            {/* Card 2: Isolation (col-span-1) */}
            <div className="reveal-scale">
              <Card className="p-8 h-full flex flex-col justify-between hoverEffect={false}">
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-muted text-foreground flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground">Strict Database Isolation</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                      Row-level tenant isolation ensures residents from Estate A can never access Estate B logs, support requests, or visitor records.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs text-primary font-semibold">
                  <Lock className="h-3.5 w-3.5" />
                  <span>RLS Security Locked</span>
                </div>
              </Card>
            </div>

            {/* Card 3: Levies (col-span-1) */}
            <div className="reveal-scale">
              <Card className="p-8 h-full flex flex-col justify-between hoverEffect={false}">
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-muted text-foreground flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground">Levies &amp; Utility Billing</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                      Automate security fees, power tokens, and waste levies. Residents pay online with fast cards or local bank transfers.
                    </p>
                  </div>
                </div>
                <div className="mt-6 bg-muted/60 border border-border/30 rounded-xl p-3 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Monthly Security</span>
                  <span className="font-bold text-foreground">₦10,000 / month</span>
                </div>
              </Card>
            </div>

            {/* Card 4: Panic System (col-span-2, Dark Drenched block) */}
            <div className="md:col-span-2 reveal-scale">
              <Card className="p-8 h-full bg-slate-950 text-slate-100 border-slate-800 flex flex-col justify-between hoverEffect={false}">
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-100">Security Alerts &amp; Panic Trigger</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mt-2 max-w-md">
                      Instantly alert gate security officers and neighbors in a crisis. The one-tap panic button triggers real-time warning logs for nearby residents.
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-3 max-w-md">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-slate-400 font-mono">Panic broadcast active</span>
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer">
                    Test Trigger
                  </button>
                </div>
              </Card>
            </div>

            {/* Card 5: Broadcast Notice (col-span-1) */}
            <div className="reveal-scale">
              <Card className="p-8 h-full flex flex-col justify-between hoverEffect={false}">
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-muted text-foreground flex items-center justify-center">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground">Notice Broadcast Board</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                      Broadcast bulletins, electrical maintenance outages, or emergency alerts immediately to resident notifications.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-1.5">
                  <div className="h-1.5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-1.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </Card>
            </div>

            {/* Card 6: Local Marketplace (col-span-2, Accent tint background) */}
            <div className="md:col-span-2 reveal-scale">
              <Card className="p-8 h-full bg-accent/5 border-accent/10 hover:border-accent/30 flex flex-col justify-between hoverEffect={false}">
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground">Private Local Marketplace</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-md">
                      Verified members can trade furniture, vehicles, or items safely within the physical confines of the estate community.
                    </p>
                  </div>
                </div>
                <div className="mt-8 bg-card border border-border/80 rounded-xl p-3 flex items-center gap-3 max-w-sm shadow-sm">
                  <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] font-bold text-muted-foreground">IMG</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">Ergonomic Office Chair</p>
                    <p className="text-[9px] text-muted-foreground">Lekki Gate A • Verified Resident</p>
                  </div>
                  <span className="text-xs font-extrabold text-primary">₦45,000</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="how-it-works" className="relative py-24 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={stepsRef}>
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground reveal" style={{ transitionDelay: '0ms' }}>
              Set Up Your Estate in 3 Steps
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm reveal" style={{ transitionDelay: '80ms' }}>
              Transition your resident management online in under five minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {[
              { step: '1', title: 'Create Admin Account', desc: 'Register as an Estate Admin, provide your development name, and claim your subdomain.' },
              { step: '2', title: 'Invite Residents', desc: 'Share your custom portal URL (e.g. lekki.neighborly.ng/signup) to onboard your community.' },
              { step: '3', title: 'Verify & Manage', desc: 'Approve resident KYC documentation, publish announcements, and configure bills.' },
            ].map((item, i) => (
              <div key={item.step} className="reveal text-center space-y-4 relative z-10" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground font-black text-lg mx-auto flex items-center justify-center shadow-sm">
                  {item.step}
                </div>
                <h3 className="font-bold text-foreground text-lg">{item.title}</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PRICING SECTION ===================== */}
      {/* Overhauled pricing cards: no ghost-card shadows, Cobalt styling */}
      <section id="pricing" className="relative py-24 border-t border-border/40 bg-mesh-light dark:bg-mesh-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={pricingRef}>
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground reveal" style={{ transitionDelay: '0ms' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm reveal" style={{ transitionDelay: '80ms' }}>
              Only estate administrators pay a flat yearly subscription fee. Resident accounts are always free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto reveal-stagger">
            
            {/* Starter Plan */}
            <div className="reveal-scale">
              <Card hoverEffect={false} className="p-8 h-full flex flex-col justify-between border border-border shadow-sm rounded-xl">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-foreground text-xl">Starter</h4>
                    <p className="text-xs text-muted-foreground mt-1">Best for small residential communities</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-foreground">₦150,000</span>
                    <span className="text-muted-foreground text-xs font-semibold">/ year</span>
                  </div>
                  <ul className="space-y-3 text-xs text-foreground/80">
                    {['Dedicated subdomain URL', 'Up to 300 resident accounts', 'Notice board & local marketplace', 'Artisan & directory listings'].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/signup" className="mt-8 block">
                  <Button variant="outline" className="w-full font-semibold rounded-xl btn-interactive text-sm">
                    Get Started
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Professional Plan — solid border accent */}
            <div className="reveal-scale">
              <Card hoverEffect={false} className="p-8 h-full flex flex-col justify-between border-2 border-primary shadow-sm rounded-xl relative bg-card">
                <div className="absolute top-0 right-0 bg-primary text-white text-[9px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-bl-xl shadow-sm">
                  ⭐ Most Popular
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-foreground text-xl">Professional</h4>
                    <p className="text-xs text-muted-foreground mt-1">Best for medium active estates</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-foreground">₦300,000</span>
                    <span className="text-muted-foreground text-xs font-semibold">/ year</span>
                  </div>
                  <ul className="space-y-3 text-xs text-foreground/80">
                    {['Everything in Starter', 'Up to 1,500 resident accounts', 'Visitor access gate code generator', 'Community discussion groups'].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/signup" className="mt-8 block">
                  <Button className="w-full font-semibold rounded-xl btn-interactive text-sm">
                    Register Pro Estate
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Enterprise Plan */}
            <div className="reveal-scale">
              <Card hoverEffect={false} className="p-8 h-full flex flex-col justify-between border border-border shadow-sm rounded-xl">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-foreground text-xl">Enterprise</h4>
                    <p className="text-xs text-muted-foreground mt-1">For large premium developments</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-foreground">₦500,000</span>
                    <span className="text-muted-foreground text-xs font-semibold">/ year</span>
                  </div>
                  <ul className="space-y-3 text-xs text-foreground/80">
                    {['Everything in Pro', 'Unlimited residents & staff', 'Custom domain mapping (yourestate.com)', 'White-label logo branding'].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/signup" className="mt-8 block">
                  <Button variant="outline" className="w-full font-semibold rounded-xl btn-interactive text-sm">
                    Contact Sales
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CONTACT SECTION ===================== */}
      {/* Forms overhaul: label ABOVE input, gap-2 inputs */}
      <section id="contact" className="relative py-24 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={contactRef}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground reveal" style={{ transitionDelay: '0ms' }}>
                  Get in Touch
                </h2>
                <p className="text-muted-foreground leading-relaxed reveal text-sm" style={{ transitionDelay: '80ms' }}>
                  Have questions about payment integration, verification APIs, or gated security setups? Let us know.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Phone, label: 'Phone', value: '+234 801 234 5678' },
                  { icon: Mail, label: 'Email', value: 'support@neighborly.ng' },
                  { icon: MapPin, label: 'Office', value: 'Victoria Island, Lagos, Nigeria' },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-3.5 reveal" style={{ transitionDelay: `${(i + 2) * 80}ms` }}>
                    <div className="h-10 w-10 rounded-xl bg-muted border border-border/50 flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal-scale" style={{ transitionDelay: '200ms' }}>
              <Card className="p-8 space-y-6 shadow-sm border border-border/60" hoverEffect={false}>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Request a Product Demo</h3>
                  <p className="text-xs text-muted-foreground mt-1">Leave your details and a representative will schedule a custom walk-through.</p>
                </div>
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  {/* Rule: Label ABOVE input, standard gap-2 inside form groups */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gated Estate Name &amp; Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lekki Heights, Lagos"
                      className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
                    />
                  </div>

                  <Button type="submit" className="w-full font-semibold rounded-xl py-5 btn-interactive mt-2 shadow-sm text-sm">
                    <Send className="mr-2 h-4 w-4" /> Submit Demo Request
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
