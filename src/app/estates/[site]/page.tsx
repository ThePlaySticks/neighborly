'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  Shield, Bell, ShoppingBag, AlertTriangle, Users, MapPin, Wrench, ArrowRight,
  MessageSquare, FileText, Key, LogIn, UserPlus, Lock, Zap, Clock, Home
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
  const [userRole, setUserRole] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [kycDocType, setKycDocType] = useState<string | null>(null)
  const [kycDocUrl, setKycDocUrl] = useState<string | null>(null)
  const [kycRejectionReason, setKycRejectionReason] = useState<string | null>(null)

  // KYC Form states
  const [selectedDocType, setSelectedDocType] = useState('nin')
  const [selectedDocUrl, setSelectedDocUrl] = useState('https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=80')
  const [submittingKyc, setSubmittingKyc] = useState(false)
  const [kycMsg, setKycMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchKycData = async (uid: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, kyc_status, kyc_document_type, kyc_document_url, kyc_rejection_reason')
        .eq('id', uid)
        .single()
      if (profile) {
        setUserName(profile.full_name || 'Resident')
        setUserRole(profile.role || 'resident')
        setKycStatus(profile.kyc_status || 'unuploaded')
        setKycDocType(profile.kyc_document_type)
        setKycDocUrl(profile.kyc_document_url)
        setKycRejectionReason(profile.kyc_rejection_reason)
      }
    } catch (e) {
      console.error('Error fetching profile:', e)
    }
  }

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSubmittingKyc(true)
    setKycMsg('')
    try {
      const { error: kycError } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'pending',
          kyc_document_type: selectedDocType,
          kyc_document_url: selectedDocUrl,
          kyc_rejection_reason: null
        })
        .eq('id', userId)

      if (kycError) throw kycError
      setKycMsg('KYC documents submitted successfully for review.')
      await fetchKycData(userId)
    } catch (err: any) {
      console.error(err)
      setKycMsg(err.message || 'Failed to submit KYC documents.')
    } finally {
      setSubmittingKyc(false)
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: estateData } = await supabase
          .from('estates')
          .select('*')
          .eq('subdomain', site)
          .single()
        
        if (estateData) {
          setEstate(estateData)

          const { data: brandingData } = await supabase
            .from('tenant_branding')
            .select('primary_color, secondary_color, welcome_message')
            .eq('id', estateData.id)
            .single()

          if (brandingData) {
            setBranding(brandingData)
          }
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setIsAuthenticated(true)
          setUserId(user.id)
          await fetchKycData(user.id)
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
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground text-xs font-semibold">Loading Portal...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!estate) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md space-y-5">
            <MapPin className="h-12 w-12 text-destructive mx-auto animate-bounce" />
            <div className="space-y-1.5">
              <h1 className="text-2xl font-black text-foreground">
                Portal Not Found
              </h1>
              <p className="text-muted-foreground text-xs leading-relaxed">
                The estate subdomain <span className="font-bold text-foreground">"{site}"</span> is not registered in our system.
              </p>
            </div>
            <Link href="/signup">
              <Button className="font-semibold rounded-xl text-xs py-2 px-5 btn-interactive">Register Your Estate</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ============ UNAUTHENTICATED: Estate Subdomain Landing Page ============
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />

        {/* Hero */}
        <section className="relative overflow-hidden py-16 sm:py-24 bg-mesh-light dark:bg-mesh-dark">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
            <div>
              <Badge variant="outline" className="px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider text-primary border-primary/20 bg-primary/5">
                🏡 Gated Community Portal
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Welcome to <span className="text-primary">{estate.name}</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {branding?.welcome_message || `Access circulars, trade inside our secure local marketplace, request visitor gate passes, and file utility support tickets — exclusively for verified residents of ${estate.name}.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/login">
                <Button size="lg" className="font-semibold px-6 rounded-xl btn-interactive text-xs">
                  <LogIn className="mr-2 h-4 w-4" /> Resident Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="font-semibold px-6 rounded-xl btn-interactive text-xs border-border hover:bg-muted">
                  <UserPlus className="mr-2 h-4 w-4" /> Register Dwellings
                </Button>
              </Link>
            </div>

            {/* URL Badge */}
            <div className="pt-4 max-w-xs mx-auto">
              <div className="bg-card border border-border/80 rounded-xl p-2.5 shadow-sm flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <div className="flex-1 bg-muted/60 rounded-lg py-1 px-3 text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 border border-border/30">
                  <Lock className="h-3 w-3 text-primary shrink-0" />
                  <span>{estate.subdomain}.neighborly.ng</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-16 border-y border-border/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Digital Utilities &amp; Features
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto text-xs">
                Services integrated directly into the {estate.name} community dashboard.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Bell, color: 'text-primary bg-primary/5 border border-primary/10', title: 'Notice Board', desc: 'Updates, maintenance schedules, and broadcast details from estate admin.' },
                { icon: ShoppingBag, color: 'text-primary bg-primary/5 border border-primary/10', title: 'Marketplace', desc: 'Scam-free trading restricted to physically verified neighbors.' },
                { icon: Wrench, color: 'text-primary bg-primary/5 border border-primary/10', title: 'Artisans & Services', desc: 'Book verified electricians, plumbers, and mechanics near you.' },
                { icon: Key, color: 'text-primary bg-primary/5 border border-primary/10', title: 'Guest Pass Codes', desc: 'Generate 6-digit access codes for security gate check-in logs.' },
                { icon: MessageSquare, color: 'text-primary bg-primary/5 border border-primary/10', title: 'Community Chat', desc: 'Real-time discussions and message boards for estate residents.' },
                { icon: FileText, color: 'text-primary bg-primary/5 border border-primary/10', title: 'Support Tickets', desc: 'Submit and track service repairs, issues, or gate complaints.' },
              ].map((feature) => (
                <Card key={feature.title} hoverEffect={false} className="p-6 space-y-3 border border-border/70">
                  <div className={`h-10 w-10 rounded-xl ${feature.color} flex items-center justify-center`}>
                    <feature.icon className="h-4 w-4" style={{ strokeWidth: 2 }} />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    )
  }

  // ============ AUTHENTICATED: Resident Dashboard ============
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="relative bg-muted/40 border-b border-border/50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <div>
            <Badge variant="outline" className="px-2.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-bold text-primary border-primary/20 bg-primary/5">
              🏡 Estate Resident
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {estate.name}
          </h1>
          <p className="text-muted-foreground text-xs">
            Welcome back, <span className="font-bold text-foreground">{userName}</span>
          </p>
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] font-mono mt-2">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <span>{estate.subdomain}.neighborly.ng</span>
          </div>
        </div>
      </section>

      {/* Main resident menu */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24 md:pb-12">
        {estate.subscription_status !== 'active' && (
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5 max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Subscription Pending / Suspended</p>
              <p className="text-muted-foreground text-[10px] mt-0.5 leading-relaxed">
                This estate&apos;s annual system license is currently unpaid. Core features are locked. Please alert your estate administration.
              </p>
            </div>
          </div>
        )}

        {/* KYC Verification Required Card */}
        {kycStatus !== 'approved' && (userRole === 'resident' || userRole === 'unverified') && (
          <Card className="p-6 border border-border/80 bg-card shadow-sm rounded-xl max-w-2xl mx-auto overflow-hidden relative hoverEffect={false}">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5" style={{ strokeWidth: 2 }} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Identity Verification Required</h2>
                  <p className="text-muted-foreground text-[10px]">
                    Submit local credentials to authenticate your residency.
                  </p>
                </div>
              </div>

              {kycStatus === 'rejected' && (
                <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/15 text-destructive text-[11px] space-y-1">
                  <p className="font-bold">KYC Upload Rejected</p>
                  <p className="text-muted-foreground text-[10px]"><strong>Reason:</strong> {kycRejectionReason || 'Details mismatch.'}</p>
                </div>
              )}

              {kycStatus === 'pending' ? (
                <div className="p-5 rounded-xl bg-muted/50 border border-border/40 text-center space-y-2">
                  <Clock className="h-8 w-8 text-primary mx-auto animate-spin" />
                  <h3 className="font-bold text-foreground text-xs">Awaiting Approval</h3>
                  <p className="text-muted-foreground text-[10px] max-w-sm mx-auto leading-relaxed">
                    Your {kycDocType?.toUpperCase()} document is undergoing verification by the estate administrator. Dwellings access will unlock shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleKycSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Rule: Label ABOVE input, standard gap-2 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Document Type</label>
                      <select
                        value={selectedDocType}
                        onChange={(e) => setSelectedDocType(e.target.value)}
                        className="w-full rounded-lg border border-input bg-card p-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="nin">National Identity (NIN)</option>
                        <option value="passport">Passport</option>
                        <option value="drivers_license">Driver&apos;s License</option>
                        <option value="voters_card">Voter&apos;s Card</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Document Image URL</label>
                      <input
                        type="text"
                        value={selectedDocUrl}
                        onChange={(e) => setSelectedDocUrl(e.target.value)}
                        placeholder="Image URL link"
                        className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/60"
                        required
                      />
                    </div>
                  </div>

                  {kycMsg && (
                    <p className="text-[10px] font-bold text-primary">{kycMsg}</p>
                  )}

                  <Button type="submit" disabled={submittingKyc} className="w-full font-semibold rounded-xl text-xs py-2 btn-interactive">
                    {submittingKyc ? 'Uploading...' : 'Submit Credentials'}
                  </Button>
                </form>
              )}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Resident Dashboard Actions */}
          <div className="md:col-span-2 space-y-6">
            {/* Grid has tactile scale feedback on clicks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {[
                { icon: Bell, color: 'text-primary bg-primary/5 border border-primary/10', title: 'Notice Board', desc: 'Updates and circulars from estate management.', href: '/notices' },
                { icon: ShoppingBag, color: 'text-primary bg-primary/5 border border-primary/10', title: 'Marketplace', desc: `Trade items inside our community.`, href: '/marketplace' },
                { icon: Wrench, color: 'text-primary bg-primary/5 border border-primary/10', title: 'Artisans & Services', desc: 'Book verified estate helpers.', href: '/services' },
                { icon: Users, color: 'text-primary bg-primary/5 border border-primary/10', title: 'Guest Codes', desc: 'Generate gate visitor codes.', href: '/visitors' },
                { icon: MessageSquare, color: 'text-primary bg-primary/5 border border-primary/10', title: 'Community Chat', desc: 'Real-time neighbor messaging.', href: '/chat' },
                { icon: FileText, color: 'text-primary bg-primary/5 border border-primary/10', title: 'Support Tickets', desc: 'File utility complaints.', href: '/support' },
              ].map((item) => {
                const isLocked = kycStatus !== 'approved' && (userRole === 'resident' || userRole === 'unverified');
                return (
                  <Card key={item.title} hoverEffect={false} className={`p-5 card-lift border border-border/80 relative overflow-hidden ${isLocked ? 'opacity-40 cursor-not-allowed select-none' : 'cursor-pointer'}`}>
                    <div className={`h-9 w-9 rounded-xl ${item.color} flex items-center justify-center mb-3`}>
                      <item.icon className="h-4 w-4" style={{ strokeWidth: 2 }} />
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                      {isLocked && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                    </div>
                    <p className="text-muted-foreground text-[10px] leading-relaxed mb-3">
                      {item.desc}
                    </p>
                    <Link
                      href={(!isLocked && estate.subscription_status === 'active') ? `/estates/${site}${item.href}` : '#'}
                      className={`inline-flex items-center text-primary text-[10px] font-bold hover:underline gap-1 ${isLocked ? 'pointer-events-none' : ''}`}
                    >
                      Open {!isLocked && <ArrowRight className="h-3 w-3" />}
                    </Link>
                  </Card>
                )
              })}

            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-5 border-primary/20 bg-primary/5 space-y-2.5 hoverEffect={false}">
              <div className="flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-primary" style={{ strokeWidth: 2 }} />
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">Estate Admin</h3>
              </div>
              <p className="text-muted-foreground text-[10px] leading-relaxed">
                Management console access for verified administrators.
              </p>
              <Link href={`/estates/${site}/admin`} className="block pt-1">
                <Button className="w-full font-semibold rounded-xl text-xs py-2 btn-interactive">
                  Manage Estate Portal
                </Button>
              </Link>
            </Card>

            <Card hoverEffect={false} className="p-5 space-y-2 border border-border/85">
              <div className="flex items-center gap-2">
                <Zap className="h-4.5 w-4.5 text-primary" style={{ strokeWidth: 2 }} />
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">System Status</h3>
              </div>
              <p className="text-muted-foreground text-[10px] leading-relaxed">
                Emergency gate connections and database networks are operating normally.
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Tab Bar (Sticky navigation, only visible on mobile < md) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl shadow-lg p-2.5 flex justify-around items-center">
        <Link href={`/estates/${site}`} className="flex flex-col items-center gap-0.5 text-primary">
          <Home className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Home</span>
        </Link>
        <Link href={`/estates/${site}/notices`} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary">
          <Bell className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Notices</span>
        </Link>
        <Link href={`/estates/${site}/visitors`} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary">
          <Users className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Guests</span>
        </Link>
        <Link href={`/estates/${site}/chat`} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary">
          <MessageSquare className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Chat</span>
        </Link>
      </div>

      <Footer />
    </div>
  )
}
