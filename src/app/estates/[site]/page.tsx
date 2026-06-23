'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  Shield, Bell, ShoppingBag, AlertTriangle, Users, MapPin, Wrench, ArrowRight,
  MessageSquare, FileText, Key, LogIn, UserPlus, CheckCircle, Globe, Lock, Zap
} from 'lucide-react'
import Link from 'next/link'

interface Estate {
  id: string
  name: string
  subdomain: string
  subscription_status: string
}

interface Branding {
  primary_color: string
  secondary_color: string
  welcome_message: string
}

export default function EstatePortal({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()
  
  const [estate, setEstate] = useState<Estate | null>(null)
  const [branding, setBranding] = useState<Branding | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch estate info
        const { data: estateData } = await supabase
          .from('estates')
          .select('*')
          .eq('subdomain', site)
          .single()
        
        if (estateData) {
          setEstate(estateData)

          // Fetch branding
          const { data: brandingData } = await supabase
            .from('tenant_branding')
            .select('primary_color, secondary_color, welcome_message')
            .eq('id', estateData.id)
            .single()

          if (brandingData) {
            setBranding(brandingData)
          }
        }

        // Check auth
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setIsAuthenticated(true)
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()
          if (profile) setUserName(profile.full_name || 'Resident')
        }
      } catch (err) {
        console.error('Error fetching estate:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [site])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading Estate Portal...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!estate) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="text-center max-w-md space-y-6">
            <MapPin className="h-16 w-16 text-red-500 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Portal Not Found
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The estate portal for <span className="font-semibold text-foreground">"{site}"</span> does not exist or has not been initialized.
              </p>
            </div>
            <Link href="/signup">
              <Button className="font-semibold rounded-xl">Register Your Estate</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ============ UNAUTHENTICATED: Estate Landing Page ============
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />

        {/* Hero */}
        <section className="relative overflow-hidden py-20 lg:py-32 bg-background">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)/0.06,transparent_60%)] pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
            <Badge variant="success" className="px-4 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wider">
              🏡 Official Community Portal
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                {estate.name}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {branding?.welcome_message || `Your secure, private digital community portal. Access notice boards, marketplace, visitor management, and more — exclusively for verified residents of ${estate.name}.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/login">
                <Button size="lg" className="font-semibold px-8 shadow-lg shadow-primary/20 rounded-xl">
                  <LogIn className="mr-2 h-4 w-4" /> Resident Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="font-semibold px-8 rounded-xl">
                  <UserPlus className="mr-2 h-4 w-4" /> Register as Resident
                </Button>
              </Link>
            </div>

            {/* URL Badge */}
            <div className="pt-4 max-w-sm mx-auto">
              <div className="bg-card border border-border rounded-2xl p-3 shadow-lg flex items-center gap-3">
                <div className="flex gap-1.5 shrink-0">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 bg-muted/50 rounded-lg py-1 px-3 text-xs text-muted-foreground font-mono flex items-center gap-2">
                  <Lock className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>{estate.subdomain}.neighborly.ng</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-20 bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                What&apos;s Inside Your Portal
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm">
                Everything you need to stay connected, secure, and informed within {estate.name}.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Bell, color: 'bg-blue-500/10 text-blue-500', title: 'Notice Board', desc: 'Official announcements, water schedules, and emergency circulars from management.' },
                { icon: ShoppingBag, color: 'bg-emerald-500/10 text-emerald-500', title: 'Marketplace', desc: 'Buy and sell household items safely with your verified neighbors.' },
                { icon: Wrench, color: 'bg-violet-500/10 text-violet-500', title: 'Artisans & Services', desc: 'Book verified plumbers, electricians, cleaners, and other service providers.' },
                { icon: Key, color: 'bg-amber-500/10 text-amber-500', title: 'Guest Access Codes', desc: 'Generate secure 6-digit passcodes for your visitors to present at the gate.' },
                { icon: MessageSquare, color: 'bg-cyan-500/10 text-cyan-500', title: 'Community Chat', desc: 'Real-time chat with your verified neighbors inside the estate.' },
                { icon: FileText, color: 'bg-rose-500/10 text-rose-500', title: 'Support Tickets', desc: 'File complaints about water, electricity, or security issues directly to admin.' },
              ].map((feature) => (
                <Card key={feature.title} className="p-6 space-y-3 border border-border hover:border-primary/50 transition-all hover:shadow-md">
                  <div className={`h-11 w-11 rounded-xl ${feature.color} flex items-center justify-center`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-background">
          <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
            <Zap className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Ready to Get Started?</h2>
            <p className="text-muted-foreground">
              Sign in with your existing account or register as a new resident. Your estate administrator will verify your identity.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="font-semibold px-8 rounded-xl">
                  Login to Portal
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="font-semibold px-8 rounded-xl">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    )
  }

  // ============ AUTHENTICATED: Resident Dashboard ============
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Header */}
      <section className="relative bg-muted/30 border-b border-border py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <Badge variant="success" className="px-3 py-1 text-xs rounded-full uppercase tracking-wider font-semibold">
            🏡 Official Estate Portal
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground">
            {estate.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, <span className="font-semibold text-foreground">{userName}</span>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>{estate.subdomain}.neighborly.ng</span>
          </div>
        </div>
      </section>

      {/* Main resident menu */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {estate.subscription_status !== 'active' && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Portal Access Suspended</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                This estate&apos;s subscription has expired. Features are temporarily locked. Contact your estate management.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Resident Dashboard Actions */}
          <div className="md:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {[
                { icon: Bell, color: 'bg-blue-500/10 text-blue-500', title: 'Notice Board', desc: 'Updates, notices, and announcements from estate management.', href: '/notices' },
                { icon: ShoppingBag, color: 'bg-emerald-500/10 text-emerald-500', title: 'Marketplace', desc: `Buy, sell, and trade items with verified neighbors.`, href: '/marketplace' },
                { icon: Wrench, color: 'bg-violet-500/10 text-violet-500', title: 'Artisans & Services', desc: 'Book verified service providers for your home.', href: '/services' },
                { icon: Users, color: 'bg-amber-500/10 text-amber-500', title: 'Guest Codes', desc: 'Generate secure passcodes for your visitors.', href: '/visitors' },
                { icon: MessageSquare, color: 'bg-cyan-500/10 text-cyan-500', title: 'Community Chat', desc: 'Chat live with your verified neighbors.', href: '/chat' },
                { icon: FileText, color: 'bg-rose-500/10 text-rose-500', title: 'Support Tickets', desc: 'File complaints for estate management.', href: '/support' },
              ].map((item) => (
                <Card key={item.title} className="p-5 card-lift group hover:border-primary transition-all">
                  <div className={`h-11 w-11 rounded-xl ${item.color} flex items-center justify-center mb-3`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                    {item.desc}
                  </p>
                  <Link
                    href={estate.subscription_status === 'active' ? item.href : '#'}
                    className="inline-flex items-center text-primary text-xs font-semibold hover:underline gap-1"
                  >
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Card>
              ))}

            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Card className="p-5 border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground text-sm">Estate Admin</h3>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                If you are the administrator, manage residents, branding, and subscriptions.
              </p>
              <Link href="/admin" className="block">
                <Button className="w-full font-semibold rounded-xl text-sm">
                  Manage Estate
                </Button>
              </Link>
            </Card>

            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-foreground text-sm">Verification</h3>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                You must be a verified resident approved by estate admin to access all features.
              </p>
            </Card>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
