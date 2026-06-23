'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Shield, CreditCard, Bell, ShoppingBag, AlertTriangle, Users,
  ArrowRight, CheckCircle, Percent, DollarSign, Globe, Settings, MapPin, Mail, Phone, Send
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function SaaSProductLanding() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubscribed(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative overflow-hidden py-24 lg:py-40 bg-background flex items-center min-h-[85vh]">
        {/* Background Image with Blurry Glassmorphic Overlay */}
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-25 dark:opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80')" }} />
        <div className="absolute inset-0 z-1 bg-gradient-to-b from-background/95 via-background/80 to-background backdrop-blur-[3px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="animate-fade-in hover:scale-102 transition-all duration-300">
              <Badge
                variant="success"
                className="px-4 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              >
                🇳🇬 Built for modern Gated Communities &amp; Estates in Nigeria
              </Badge>
            </div>

            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05] animate-slide-up">
              Personalized Portals for <span className="text-primary bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Every Estate</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto animate-fade-in">
              Provide your residents with a secure, private community space. Get a dedicated subdomain website for notice boards, marketplaces, security alerts, and utility billing.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 animate-fade-in">
              <Link href="/signup">
                <Button size="lg" className="font-semibold px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 rounded-xl">
                  Register Your Estate <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="font-semibold px-8 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 rounded-xl">
                  Explore Features
                </Button>
              </a>
            </div>

            {/* Subdomain visual representation */}
            <div className="pt-8 max-w-lg mx-auto">
              <div className="bg-card border border-border rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="flex gap-1.5 shrink-0">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 bg-muted/50 rounded-lg py-1 px-3 text-xs text-muted-foreground font-mono flex items-center justify-between">
                  <span>https://<strong className="text-primary font-bold">your-estate</strong>.neighborly.ng</span>
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES SECTION ===================== */}
      <section id="features" className="py-24 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="success" className="text-xs font-semibold rounded-full px-3 py-1">SaaS Features</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Everything Needed to Run a Gated Community
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each estate gets their own isolated instance. No two estates share resident details, notices, or trades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 space-y-4 border border-border hover:border-primary transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Personalized Subdomains</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Choose a unique domain name (e.g., `lekki-estate.neighborly.ng`). Your residents log in, verify, and interact in a portal configured just for your estate.
              </p>
            </Card>

            <Card className="p-6 space-y-4 border border-border hover:border-primary transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Strict Resident Isolation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Full database level row isolation. Residents from Estate A can never view Estate B notices, marketplace items, or directories, keeping everything completely private.
              </p>
            </Card>

            <Card className="p-6 space-y-4 border border-border hover:border-primary transition-all">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Levies &amp; Payments</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Configure utility bills, security fees, and maintenance charges. Residents pay online instantly using cards or bank transfers, and get digital receipts.
              </p>
            </Card>

            <Card className="p-6 space-y-4 border border-border hover:border-primary transition-all">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Notice &amp; Broadcast Board</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Estate admins can publish official bulletins, emergency circulars, power outages, and maintenance announcements directly to their estate portal dashboard.
              </p>
            </Card>

            <Card className="p-6 space-y-4 border border-border hover:border-primary transition-all">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Panic &amp; Security Alerts</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Integrated one-click emergency triggers. Alert gate security officers and neighbors instantly during high-priority fire, medical, or security hazards.
              </p>
            </Card>

            <Card className="p-6 space-y-4 border border-border hover:border-primary transition-all">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Private Local Marketplace</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Safe, scam-free buying and selling limited strictly to verified estate residents. Trade furniture, cars, groceries, and swap tools within your gates.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="success" className="text-xs font-semibold rounded-full px-3 py-1">Onboarding Process</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Setup Your Estate in 3 Steps
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Supercharge your estate community management in under 5 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                1
              </div>
              <h3 className="font-bold text-foreground text-lg">Create Admin Account</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Sign up as an **Estate Admin** on the root portal and specify your estate name and desired subdomain name.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-12 w-12 bg-secondary text-white rounded-xl flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                2
              </div>
              <h3 className="font-bold text-foreground text-lg">Invite Residents</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Share your personalized subdomain URL (e.g. `lekki.neighborly.ng/signup`) with your residents so they can register.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-12 w-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                3
              </div>
              <h3 className="font-bold text-foreground text-lg">Approve &amp; Manage</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Verify resident identities from your estate admin console, post notice updates, and start collecting levies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PRICING SECTION ===================== */}
      <section id="pricing" className="py-24 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="success" className="text-xs font-semibold rounded-full px-3 py-1">Pricing Plans</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Simple, Configurable Pricing
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Only estate administrators pay a flat yearly subscription. Residents join and use the portal completely free!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="p-8 border border-border bg-card/60 backdrop-blur-md shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-foreground text-xl">Starter Plan</h4>
                  <p className="text-xs text-muted-foreground mt-1">Best for small residential communities</p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-foreground">₦150,000</span>
                  <span className="text-muted-foreground text-xs font-semibold">/ year</span>
                </div>
                <ul className="space-y-3 text-xs text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Dedicated subdomain website URL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Up to 300 resident accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Notice board & buy/sell marketplace</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Artisan & service provider directory</span>
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full font-semibold rounded-xl text-xs">
                  Register Starter Estate
                </Button>
              </Link>
            </Card>

            {/* Professional Plan */}
            <Card className="p-8 border-2 border-primary bg-card/85 backdrop-blur-md shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-primary text-white text-[9px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-lg">
                Popular
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-foreground text-xl">Professional Plan</h4>
                  <p className="text-xs text-muted-foreground mt-1">Best for medium-sized active estates</p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-foreground">₦300,000</span>
                  <span className="text-muted-foreground text-xs font-semibold">/ year</span>
                </div>
                <ul className="space-y-3 text-xs text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Everything in Starter included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Up to 1,500 resident accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Community chat & support tickets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Visitor / guest access codes</span>
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full font-semibold rounded-xl text-xs shadow-lg shadow-primary/20">
                  Register Pro Estate
                </Button>
              </Link>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-8 border border-border bg-card/60 backdrop-blur-md shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-foreground text-xl">Enterprise Plan</h4>
                  <p className="text-xs text-muted-foreground mt-1">For large and premium developments</p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-foreground">₦500,000</span>
                  <span className="text-muted-foreground text-xs font-semibold">/ year</span>
                </div>
                <ul className="space-y-3 text-xs text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Everything in Pro included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Unlimited resident & staff accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Optional custom domains (yourestate.com)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>White-label branding & API access</span>
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full font-semibold rounded-xl text-xs">
                  Contact Sales / Onboard
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* ===================== CONTACT SECTION ===================== */}
      <section id="contact" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="success" className="text-xs font-semibold rounded-full px-3 py-1">Contact Us</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Get in Touch
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Questions about setup, payment gateways, or custom integrations for your estate? Our team is here to assist.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">+234 801 234 5678</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">saas-support@neighborly.ng</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">HQ Address</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">Victoria Island, Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-8 space-y-4">
              <h3 className="text-xl font-bold text-foreground">Request a Product Demo</h3>
              <p className="text-xs text-muted-foreground">Leave your details and we will reach out to schedule a live demo of the estate panel.</p>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Your Gated Estate (Name &amp; Location)"
                  required
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button type="submit" className="w-full font-semibold rounded-xl py-5">
                  <Send className="mr-2 h-4 w-4" /> Submit Request
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
