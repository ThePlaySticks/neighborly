'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Shield, CreditCard, Bell, ShoppingBag, AlertTriangle, Users,
  ArrowRight, CheckCircle, Percent, DollarSign, Globe, Settings, MapPin, Mail, Phone, Send,
  Sparkles, Zap, Lock, MessageSquare, Wrench, Star, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

// ============================================================
// Scroll-triggered reveal: IntersectionObserver hook
// ============================================================
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

    // Observe the container AND all reveal children inside it
    const revealElements = el.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
    revealElements.forEach((child) => observer.observe(child))
    // Also observe the container itself if it has a reveal class
    if (el.classList.contains('reveal') || el.classList.contains('reveal-scale')) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return ref
}

export default function SaaSProductLanding() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const heroRef = useScrollReveal()
  const featuresRef = useScrollReveal()
  const stepsRef = useScrollReveal()
  const pricingRef = useScrollReveal()
  const contactRef = useScrollReveal()

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubscribed(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative overflow-hidden py-24 lg:py-40 flex items-center min-h-[90vh]">
        {/* Rich abstract gradient background */}
        <div className="absolute inset-0 z-0 bg-mesh-light dark:hidden" />
        <div className="absolute inset-0 z-0 hidden dark:block bg-mesh-dark" />

        {/* Floating gradient blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-300/10 to-transparent animate-blob-1 animate-morph-blob blur-3xl pointer-events-none" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-blue-400/15 via-indigo-300/10 to-transparent animate-blob-2 animate-morph-blob blur-3xl pointer-events-none" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[-15%] left-[30%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-amber-400/12 via-orange-300/8 to-transparent animate-blob-3 animate-morph-blob blur-3xl pointer-events-none" style={{ animationDelay: '6s' }} />
        <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-gradient-to-tl from-violet-400/10 via-purple-300/8 to-transparent animate-blob-1 blur-3xl pointer-events-none" style={{ animationDelay: '9s' }} />

        {/* Background image — visible behind blobs */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80')",
            opacity: 0.12,
            mixBlendMode: 'luminosity'
          }}
        />

        {/* Subtle grid texture overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full" ref={heroRef}>
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="reveal" style={{ transitionDelay: '0ms' }}>
              <Badge
                variant="success"
                className="px-5 py-2 text-xs font-semibold rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10 backdrop-blur-md"
              >
                🇳🇬 Built for modern Gated Communities &amp; Estates in Nigeria
              </Badge>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-[1.05] reveal" style={{ transitionDelay: '100ms' }}>
              Personalized Portals for{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                  Every Estate
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-full opacity-60 animate-pulse-glow" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto reveal" style={{ transitionDelay: '200ms' }}>
              Provide your residents with a secure, private community space. Get a dedicated subdomain website for notice boards, marketplaces, security alerts, and utility billing.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 reveal" style={{ transitionDelay: '300ms' }}>
              <Link href="/signup">
                <Button size="lg" className="btn-interactive font-semibold px-8 shadow-lg shadow-primary/25 rounded-xl text-base">
                  Register Your Estate <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="btn-interactive font-semibold px-8 rounded-xl text-base glass border-white/20 dark:border-white/10">
                  Explore Features <ChevronDown className="ml-1 h-4 w-4 animate-bounce-light" />
                </Button>
              </a>
            </div>

            {/* Subdomain visual representation */}
            <div className="pt-8 max-w-lg mx-auto reveal" style={{ transitionDelay: '400ms' }}>
              <div className="glass-strong rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="flex gap-1.5 shrink-0">
                  <div className="h-3 w-3 rounded-full bg-red-500 shadow-sm" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500 shadow-sm" />
                  <div className="h-3 w-3 rounded-full bg-green-500 shadow-sm" />
                </div>
                <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-lg py-2 px-3 text-sm text-muted-foreground font-mono flex items-center justify-between">
                  <span>https://<strong className="text-primary font-bold">your-estate</strong>.neighborly.ng</span>
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="pt-8 reveal" style={{ transitionDelay: '500ms' }}>
              <a href="#features" className="inline-flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <span className="text-xs font-medium uppercase tracking-widest">Discover More</span>
                <ChevronDown className="h-5 w-5 animate-bounce-light" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES SECTION ===================== */}
      <section id="features" className="relative py-28 overflow-hidden">
        {/* Section background */}
        <div className="absolute inset-0 bg-mesh-light dark:hidden opacity-60" />
        <div className="absolute inset-0 hidden dark:block bg-mesh-dark opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={featuresRef}>
          <div className="text-center space-y-4 mb-16">
            <div className="reveal">
              <Badge variant="success" className="text-xs font-semibold rounded-full px-4 py-1.5 shadow-sm">
                <Sparkles className="inline h-3 w-3 mr-1" /> SaaS Features
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground reveal" style={{ transitionDelay: '100ms' }}>
              Everything Needed to Run a{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                Gated Community
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto reveal" style={{ transitionDelay: '200ms' }}>
              Each estate gets their own isolated instance. No two estates share resident details, notices, or trades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
            {[
              { icon: Globe, color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-500/10', title: 'Personalized Subdomains', desc: 'Choose a unique domain name (e.g., lekki-estate.neighborly.ng). Your residents log in, verify, and interact in a portal configured just for your estate.' },
              { icon: Shield, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', title: 'Strict Resident Isolation', desc: 'Full database level row isolation. Residents from Estate A can never view Estate B notices, marketplace items, or directories.' },
              { icon: CreditCard, color: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-500/10', title: 'Levies & Payments', desc: 'Configure utility bills, security fees, and maintenance charges. Residents pay online instantly using cards or bank transfers.' },
              { icon: Bell, color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-500/10', title: 'Notice & Broadcast Board', desc: 'Estate admins can publish official bulletins, emergency circulars, power outages, and maintenance announcements directly.' },
              { icon: AlertTriangle, color: 'from-red-500 to-rose-500', bgColor: 'bg-red-500/10', title: 'Panic & Security Alerts', desc: 'Integrated one-click emergency triggers. Alert gate security officers and neighbors instantly during hazards.' },
              { icon: ShoppingBag, color: 'from-cyan-500 to-blue-500', bgColor: 'bg-cyan-500/10', title: 'Private Local Marketplace', desc: 'Safe, scam-free buying and selling limited strictly to verified estate residents. Trade furniture, cars, and more.' },
            ].map((feature) => (
              <div key={feature.title} className="reveal-scale">
                <Card className="glass-card p-6 space-y-4 card-lift group relative overflow-hidden">
                  {/* Hover gradient line */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className={`h-12 w-12 rounded-xl ${feature.bgColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className="h-6 w-6" style={{ color: 'inherit' }} />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="how-it-works" className="relative py-28 overflow-hidden">
        {/* Abstract background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-background to-sky-50/30 dark:from-emerald-950/20 dark:via-background dark:to-sky-950/10" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={stepsRef}>
          <div className="text-center space-y-4 mb-20">
            <div className="reveal">
              <Badge variant="success" className="text-xs font-semibold rounded-full px-4 py-1.5 shadow-sm">
                <Zap className="inline h-3 w-3 mr-1" /> Onboarding Process
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground reveal" style={{ transitionDelay: '100ms' }}>
              Setup Your Estate in{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">3 Steps</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto reveal" style={{ transitionDelay: '200ms' }}>
              Supercharge your estate community management in under 5 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line between steps (desktop) */}
            <div className="hidden md:block absolute top-[56px] left-[17%] right-[17%] h-[2px] bg-gradient-to-r from-primary/40 via-secondary/40 to-emerald-500/40 z-0" />

            {[
              { step: '1', color: 'bg-gradient-to-br from-emerald-500 to-teal-600', title: 'Create Admin Account', desc: 'Sign up as an Estate Admin on the root portal and specify your estate name and desired subdomain name.' },
              { step: '2', color: 'bg-gradient-to-br from-amber-500 to-orange-600', title: 'Invite Residents', desc: 'Share your personalized subdomain URL (e.g. lekki.neighborly.ng/signup) with your residents so they can register.' },
              { step: '3', color: 'bg-gradient-to-br from-blue-500 to-indigo-600', title: 'Approve & Manage', desc: 'Verify resident identities from your estate admin console, post notice updates, and start collecting levies.' },
            ].map((item, i) => (
              <div key={item.step} className="reveal text-center space-y-5 relative z-10" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className={`h-16 w-16 ${item.color} text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-xl relative`}>
                  {item.step}
                  <div className={`absolute inset-0 ${item.color} rounded-2xl animate-pulse-glow opacity-30 blur-md`} />
                </div>
                <h3 className="font-bold text-foreground text-xl">{item.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PRICING SECTION ===================== */}
      <section id="pricing" className="relative py-28 overflow-hidden">
        {/* Section background with gradient mesh */}
        <div className="absolute inset-0 bg-mesh-light dark:hidden" />
        <div className="absolute inset-0 hidden dark:block bg-mesh-dark" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

        {/* Floating accent blobs */}
        <div className="absolute top-[20%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-400/10 to-transparent animate-blob-2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-5%] w-[350px] h-[350px] rounded-full bg-gradient-to-tl from-violet-400/10 to-transparent animate-blob-1 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={pricingRef}>
          <div className="text-center space-y-4 mb-16">
            <div className="reveal">
              <Badge variant="success" className="text-xs font-semibold rounded-full px-4 py-1.5 shadow-sm">
                <DollarSign className="inline h-3 w-3 mr-1" /> Pricing Plans
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground reveal" style={{ transitionDelay: '100ms' }}>
              Simple,{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                Configurable
              </span>{' '}
              Pricing
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto reveal" style={{ transitionDelay: '200ms' }}>
              Only estate administrators pay a flat yearly subscription. Residents join and use the portal completely free!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto reveal-stagger">
            {/* Starter Plan */}
            <div className="reveal-scale">
              <Card className="glass-card pricing-glow p-8 shadow-xl flex flex-col justify-between h-full relative overflow-hidden">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-emerald-500" />
                      </div>
                      <h4 className="font-extrabold text-foreground text-xl">Starter</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Best for small residential communities</p>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-foreground">₦150,000</span>
                    <span className="text-muted-foreground text-xs font-semibold">/ year</span>
                  </div>
                  <ul className="space-y-3 text-xs text-foreground">
                    {['Dedicated subdomain website URL', 'Up to 300 resident accounts', 'Notice board & buy/sell marketplace', 'Artisan & service provider directory'].map(item => (
                      <li key={item} className="flex items-center gap-2.5">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/signup" className="mt-8 block">
                  <Button variant="outline" className="w-full font-semibold rounded-xl btn-interactive glass border-white/20 dark:border-white/10">
                    Get Started
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Professional Plan — POPULAR */}
            <div className="reveal-scale">
              <Card className="glass-strong pricing-glow p-8 border-2 border-primary/40 shadow-2xl flex flex-col justify-between h-full relative overflow-hidden">
                {/* Popular badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[9px] uppercase font-bold tracking-wider px-4 py-1.5 rounded-bl-xl shadow-lg">
                  ⭐ Most Popular
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Star className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-extrabold text-foreground text-xl">Professional</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Best for medium-sized active estates</p>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-foreground">₦300,000</span>
                    <span className="text-muted-foreground text-xs font-semibold">/ year</span>
                  </div>
                  <ul className="space-y-3 text-xs text-foreground">
                    {['Everything in Starter included', 'Up to 1,500 resident accounts', 'Community chat & support tickets', 'Visitor / guest access codes'].map(item => (
                      <li key={item} className="flex items-center gap-2.5">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/signup" className="mt-8 block">
                  <Button className="w-full font-semibold rounded-xl btn-interactive shadow-lg shadow-primary/25 text-sm">
                    Register Pro Estate <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Enterprise Plan */}
            <div className="reveal-scale">
              <Card className="glass-card pricing-glow p-8 shadow-xl flex flex-col justify-between h-full relative overflow-hidden">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-violet-500" />
                      </div>
                      <h4 className="font-extrabold text-foreground text-xl">Enterprise</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">For large and premium developments</p>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-foreground">₦500,000</span>
                    <span className="text-muted-foreground text-xs font-semibold">/ year</span>
                  </div>
                  <ul className="space-y-3 text-xs text-foreground">
                    {['Everything in Pro included', 'Unlimited resident & staff accounts', 'Optional custom domains (yourestate.com)', 'White-label branding & API access'].map(item => (
                      <li key={item} className="flex items-center gap-2.5">
                        <CheckCircle className="h-4 w-4 text-violet-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/signup" className="mt-8 block">
                  <Button variant="outline" className="w-full font-semibold rounded-xl btn-interactive glass border-white/20 dark:border-white/10">
                    Contact Sales
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CONTACT SECTION ===================== */}
      <section id="contact" className="relative py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-background to-sky-50/30 dark:from-emerald-950/10 dark:via-background dark:to-sky-950/10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={contactRef}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="reveal">
                  <Badge variant="success" className="text-xs font-semibold rounded-full px-4 py-1.5 shadow-sm">
                    <Mail className="inline h-3 w-3 mr-1" /> Contact Us
                  </Badge>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground reveal" style={{ transitionDelay: '100ms' }}>
                  Get in Touch
                </h2>
                <p className="text-muted-foreground leading-relaxed reveal" style={{ transitionDelay: '200ms' }}>
                  Questions about setup, payment gateways, or custom integrations for your estate? Our team is here to assist.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  { icon: Phone, label: 'Phone', value: '+234 801 234 5678' },
                  { icon: Mail, label: 'Email', value: 'saas-support@neighborly.ng' },
                  { icon: MapPin, label: 'HQ Address', value: 'Victoria Island, Lagos, Nigeria' },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-4 reveal" style={{ transitionDelay: `${(i + 3) * 100}ms` }}>
                    <div className="h-12 w-12 rounded-xl glass flex items-center justify-center shrink-0 shadow-md">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal-scale" style={{ transitionDelay: '300ms' }}>
              <Card className="glass-strong p-8 space-y-5 shadow-xl">
                <h3 className="text-xl font-bold text-foreground">Request a Product Demo</h3>
                <p className="text-xs text-muted-foreground">Leave your details and we will reach out to schedule a live demo of the estate panel.</p>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    className="w-full rounded-xl border border-input bg-background/50 backdrop-blur-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    className="w-full rounded-xl border border-input bg-background/50 backdrop-blur-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                  />
                  <input
                    type="text"
                    placeholder="Your Gated Estate (Name &amp; Location)"
                    required
                    className="w-full rounded-xl border border-input bg-background/50 backdrop-blur-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                  />
                  <Button type="submit" className="w-full font-semibold rounded-xl py-5 btn-interactive shadow-lg shadow-primary/20">
                    <Send className="mr-2 h-4 w-4" /> Submit Request
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
