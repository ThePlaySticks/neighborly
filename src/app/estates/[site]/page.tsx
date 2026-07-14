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
  MessageSquare, FileText, Key, LogIn, UserPlus, Lock, Zap, Clock, Home, Upload,
  Send, Filter, Tag, Plus, Check, Copy
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

interface FeedItem {
  id: string
  type: 'announcement' | 'marketplace' | 'chat'
  title?: string
  content: string
  price?: number
  sender_name: string
  created_at: string
  owner_id?: string
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

  // Feed and Posting States
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [feedFilter, setFeedFilter] = useState<'all' | 'announcement' | 'marketplace' | 'chat'>('all')
  const [newChatMsg, setNewChatMsg] = useState('')
  const [postingChat, setPostingChat] = useState(false)

  // Quick Guest Pass Generator States
  const [quickVisitorName, setQuickVisitorName] = useState('')
  const [quickGeneratedCode, setQuickGeneratedCode] = useState('')
  const [generatingCode, setGeneratingCode] = useState(false)
  const [guestSuccessMsg, setGuestSuccessMsg] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)

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

  // Fetch unified activity feed
  const fetchFeed = async (estateId: string) => {
    try {
      // 1. Fetch announcements
      const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .eq('estate_id', estateId)
        .limit(15)

      // 2. Fetch marketplace
      const { data: marketplace } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('estate_id', estateId)
        .limit(15)

      // 3. Fetch chat messages
      const { data: chats } = await supabase
        .from('estate_messages')
        .select('*')
        .eq('estate_id', estateId)
        .limit(20)

      // Map everything to a common format
      const formattedAnnouncements: FeedItem[] = (announcements || []).map((a: any) => ({
        id: a.id,
        type: 'announcement',
        title: a.title,
        content: a.content,
        sender_name: 'Estate Management',
        created_at: a.created_at
      }))

      const formattedMarketplace: FeedItem[] = (marketplace || []).map((m: any) => ({
        id: m.id,
        type: 'marketplace',
        title: m.title,
        content: m.description || '',
        price: m.price,
        sender_name: 'Verified Resident',
        created_at: m.created_at,
        owner_id: m.owner_id
      }))

      const formattedChats: FeedItem[] = (chats || []).map((c: any) => ({
        id: c.id,
        type: 'chat',
        content: c.content,
        sender_name: c.sender_name || 'Resident',
        created_at: c.created_at,
        owner_id: c.profile_id
      }))

      // Combine and sort by date descending
      const combined = [...formattedAnnouncements, ...formattedMarketplace, ...formattedChats]
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setFeedItems(combined)
    } catch (e) {
      console.error('Failed to load activity feed:', e)
    }
  }

  // Handle post new message to feed
  const handlePostChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChatMsg.trim() || !estate || !userId) return
    setPostingChat(true)

    try {
      const { data, error } = await supabase
        .from('estate_messages')
        .insert({
          estate_id: estate.id,
          profile_id: userId,
          sender_name: userName,
          content: newChatMsg.trim()
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        // Prepend new post to the feed
        const newItem: FeedItem = {
          id: data.id,
          type: 'chat',
          content: data.content,
          sender_name: data.sender_name,
          created_at: data.created_at,
          owner_id: data.profile_id
        }
        setFeedItems([newItem, ...feedItems])
        setNewChatMsg('')
      }
    } catch (err) {
      console.error('Error posting message:', err)
    } finally {
      setPostingChat(false)
    }
  }

  // Handle quick generate passcode
  const handleQuickGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickVisitorName.trim() || !estate || !userId) return
    setGeneratingCode(true)
    setGuestSuccessMsg('')
    setCopiedCode(false)

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const { data, error } = await supabase
        .from('visitor_logs')
        .insert({
          estate_id: estate.id,
          resident_id: userId,
          visitor_name: quickVisitorName.trim(),
          check_in_code: code,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setQuickGeneratedCode(code)
        setGuestSuccessMsg(`Visitor pass generated!`)
        setQuickVisitorName('')
      }
    } catch (err) {
      console.error('Failed to generate quick guest code:', err)
    } finally {
      setGeneratingCode(false)
    }
  }

  const copyPasscode = () => {
    if (!quickGeneratedCode) return
    navigator.clipboard.writeText(quickGeneratedCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2500)
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

          // Fetch authenticated details & feed
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            setIsAuthenticated(true)
            setUserId(user.id)
            await fetchKycData(user.id)
            await fetchFeed(estateData.id)
          }
        }
      } catch (err: any) {
        const msg = err?.message || ''
        if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
          localStorage.setItem('neighborly_offline', 'true')
          window.location.reload()
          return
        }
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
        <section className="relative overflow-hidden py-16 sm:py-24 bg-mesh-light bg-mesh-auto">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full sm:w-auto max-w-md mx-auto">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto font-semibold px-6 rounded-xl btn-interactive text-xs justify-center py-5">
                  <LogIn className="mr-2 h-4 w-4" /> Resident Login
                </Button>
              </Link>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold px-6 rounded-xl btn-interactive text-xs border-border hover:bg-muted justify-center py-5">
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
  const filteredFeed = feedItems.filter(item => {
    if (feedFilter === 'all') return true
    return item.type === feedFilter
  })

  const isKycLocked = kycStatus !== 'approved' && (userRole === 'resident' || userRole === 'unverified')

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="relative bg-muted/40 border-b border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="outline" className="px-2.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-bold text-primary border-primary/20 bg-primary/5">
                🏡 Estate Resident
              </Badge>
              {kycStatus === 'approved' ? (
                <Badge variant="outline" className="px-2.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-bold text-emerald-600 border-emerald-500/20 bg-emerald-500/5">
                  ✓ Verified Dweller
                </Badge>
              ) : (
                <Badge variant="outline" className="px-2.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-bold text-amber-600 border-amber-500/20 bg-amber-500/5">
                  ⚠ Unverified
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {estate.name}
            </h1>
            <p className="text-muted-foreground text-xs">
              Welcome back, <span className="font-bold text-foreground">{userName}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-mono bg-card px-3 py-1.5 rounded-lg border border-border/60 shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{estate.subdomain}.neighborly.ng</span>
          </div>
        </div>
      </section>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
        
        {estate.subscription_status !== 'active' && (
          <div className="p-4 mb-6 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5 max-w-4xl mx-auto">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Subscription Pending / Suspended</p>
              <p className="text-muted-foreground text-[10px] mt-0.5 leading-relaxed">
                This estate&apos;s annual system license is currently unpaid. Core features are locked. Please alert your estate administration.
              </p>
            </div>
          </div>
        )}

        {/* 3-Column Nextdoor Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Navigation Sidebar (Hidden on mobile) */}
          <aside className="hidden lg:block lg:col-span-1 space-y-3">
            <div className="sticky top-20 bg-card rounded-2xl border border-border/80 p-4 space-y-1 shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">Navigation</p>
              <Link href={`/estates/${site}`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-primary bg-primary/5">
                <Home className="h-4.5 w-4.5" />
                <span>Home Feed</span>
              </Link>
              <Link href={`/estates/${site}/notices`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Bell className="h-4.5 w-4.5" />
                <span>Notices</span>
              </Link>
              <Link href={`/estates/${site}/marketplace`} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${isKycLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                <ShoppingBag className="h-4.5 w-4.5" />
                <span>Marketplace</span>
              </Link>
              <Link href={`/estates/${site}/visitors`} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${isKycLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                <Users className="h-4.5 w-4.5" />
                <span>Guest Codes</span>
              </Link>
              <Link href={`/estates/${site}/chat`} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${isKycLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                <MessageSquare className="h-4.5 w-4.5" />
                <span>Community Chat</span>
              </Link>
              <Link href={`/estates/${site}/support`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <FileText className="h-4.5 w-4.5" />
                <span>Support Tickets</span>
              </Link>

              {userRole === 'admin' && (
                <div className="pt-4 mt-3 border-t border-border/60">
                  <Link href={`/estates/${site}/admin`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-foreground bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all">
                    <Shield className="h-4.5 w-4.5 text-amber-600" />
                    <span>Estate Management</span>
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* Center Column: Hyperlocal Activity Feed */}
          <section className="col-span-1 lg:col-span-2 space-y-6">
            
            {/* KYC Alert/Form (Prominent if not verified) */}
            {kycStatus !== 'approved' && (userRole === 'resident' || userRole === 'unverified') && (
              <Card className="p-5 border border-border/80 bg-card shadow-sm rounded-xl overflow-hidden relative">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 animate-pulse" style={{ strokeWidth: 2 }} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground">Identity Verification Required</h2>
                      <p className="text-muted-foreground text-[10px]">
                        Submit valid credentials to unlock full community interactions.
                      </p>
                    </div>
                  </div>

                  {kycStatus === 'rejected' && (
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/15 text-destructive text-[10px] space-y-1">
                      <p className="font-bold">KYC Rejected</p>
                      <p className="text-muted-foreground text-[9px]"><strong>Reason:</strong> {kycRejectionReason || 'Details mismatch.'}</p>
                    </div>
                  )}

                  {kycStatus === 'pending' ? (
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/40 text-center space-y-2">
                      <Clock className="h-6 w-6 text-primary mx-auto animate-spin" />
                      <h3 className="font-bold text-foreground text-xs">Verification Pending</h3>
                      <p className="text-muted-foreground text-[9px] max-w-sm mx-auto leading-relaxed">
                        Your credentials are being reviewed by the estate administration. Full access will unlock shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleKycSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">ID Document Type</label>
                          <select
                            value={selectedDocType}
                            onChange={(e) => setSelectedDocType(e.target.value)}
                            className="w-full rounded-lg border border-input bg-card p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="nin">National Identity (NIN)</option>
                            <option value="passport">Passport</option>
                            <option value="drivers_license">Driver&apos;s License</option>
                            <option value="voters_card">Voter&apos;s Card</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Document Image</label>
                          <div className="relative border border-dashed border-border hover:border-primary/50 transition-all rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer bg-muted/30">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setSelectedDocUrl(reader.result as string)
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              required={!selectedDocUrl}
                            />
                            {selectedDocUrl ? (
                              <p className="text-[9px] text-primary font-bold">✓ Image Selected</p>
                            ) : (
                              <span className="text-[9px] text-muted-foreground text-center">Click to upload ID photo</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {kycMsg && <p className="text-[9px] font-bold text-primary">{kycMsg}</p>}

                      <Button type="submit" disabled={submittingKyc} className="w-full font-semibold rounded-xl text-xs py-1.5 btn-interactive">
                        {submittingKyc ? 'Uploading...' : 'Submit Credentials'}
                      </Button>
                    </form>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Post Box (Locked if unverified) */}
            <Card className="p-4 border border-border/80 bg-card shadow-sm rounded-2xl">
              <form onSubmit={handlePostChat} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {userName[0]?.toUpperCase() || 'U'}
                  </div>
                  <textarea
                    rows={2}
                    disabled={isKycLocked}
                    value={isKycLocked ? 'Verify your identity to post updates and chat with neighbors.' : newChatMsg}
                    onChange={(e) => setNewChatMsg(e.target.value)}
                    placeholder={isKycLocked ? 'Identity verification required' : 'Share something with your verified neighbors...'}
                    className="w-full text-sm text-foreground bg-transparent border-0 placeholder:text-muted-foreground/60 focus:outline-none resize-none pt-1"
                  />
                </div>
                {!isKycLocked && (
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground">Posting in Community Chat</span>
                    <Button type="submit" size="sm" disabled={postingChat || !newChatMsg.trim()} className="font-semibold rounded-lg text-xs py-1 px-3 btn-interactive flex items-center gap-1">
                      <Send className="h-3 w-3" /> Post
                    </Button>
                  </div>
                )}
              </form>
            </Card>

            {/* Feed Navigation and Filters */}
            <div className="flex items-center justify-between border-b border-border/45 pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
                {[
                  { value: 'all', label: 'All Updates' },
                  { value: 'announcement', label: 'Notices' },
                  { value: 'marketplace', label: 'Marketplace' },
                  { value: 'chat', label: 'Chatter' }
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setFeedFilter(tab.value as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      feedFilter === tab.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block shrink-0" />
            </div>

            {/* Activity Feed Render */}
            <div className="space-y-4">
              {filteredFeed.length === 0 ? (
                <Card className="p-8 text-center py-14 border border-border/80">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 opacity-60">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">No updates found</h3>
                  <p className="text-muted-foreground text-xs mt-1">Check back later or change your filter tab.</p>
                </Card>
              ) : (
                filteredFeed.map(item => (
                  <Card key={item.id} className="p-5 border border-border/70 hover:border-border/95 transition-all shadow-sm rounded-2xl flex flex-col justify-between">
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          {item.type === 'announcement' && (
                            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                              <Bell className="h-4 w-4" />
                            </div>
                          )}
                          {item.type === 'marketplace' && (
                            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                              <ShoppingBag className="h-4 w-4" />
                            </div>
                          )}
                          {item.type === 'chat' && (
                            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                              {item.sender_name[0]?.toUpperCase() || 'R'}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-foreground leading-none">{item.sender_name}</p>
                            <p className="text-[9px] text-muted-foreground mt-1">
                              {new Date(item.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {item.type === 'announcement' && (
                          <Badge variant="outline" className="text-[9px] font-bold text-amber-600 bg-amber-500/5 border-amber-500/20">Official Notice</Badge>
                        )}
                        {item.type === 'marketplace' && (
                          <Badge variant="outline" className="text-[9px] font-bold text-emerald-600 bg-emerald-500/5 border-emerald-500/20">Marketplace</Badge>
                        )}
                        {item.type === 'chat' && (
                          <Badge variant="outline" className="text-[9px] font-bold text-primary bg-primary/5 border-primary/20">Chatter</Badge>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="space-y-2 mt-2">
                        {item.title && <h3 className="font-bold text-sm text-foreground">{item.title}</h3>}
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.content}</p>
                      </div>
                    </div>

                    {/* Card Footer / Contextual Action */}
                    {item.type === 'marketplace' && (
                      <div className="border-t border-border/40 mt-4 pt-3 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-muted-foreground">Listed Price</p>
                          <p className="text-sm font-extrabold text-primary">₦{item.price?.toLocaleString()}</p>
                        </div>
                        <Link href={`/estates/${site}/marketplace`}>
                          <Button size="sm" className="font-semibold rounded-lg text-xs py-1 px-3.5 btn-interactive">Contact Seller</Button>
                        </Link>
                      </div>
                    )}

                    {item.type === 'announcement' && (
                      <div className="border-t border-border/40 mt-4 pt-2.5 flex justify-end">
                        <Link href={`/estates/${site}/notices`} className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5">
                          View details <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Right Column: Quick Utilities Sidebar (Desktop only) */}
          <aside className="hidden lg:block lg:col-span-1 space-y-4">
            
            {/* Quick Guest Pass Generator Widget */}
            <Card className="p-4 border border-border/80 bg-card shadow-sm rounded-2xl">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-3">
                <Key className="h-4.5 w-4.5 text-primary" />
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">Quick Guest Pass</h3>
              </div>

              {isKycLocked ? (
                <div className="p-3 text-center bg-muted/40 rounded-xl border border-border/40">
                  <Lock className="h-5 w-5 text-muted-foreground/60 mx-auto mb-1.5" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Verify residency to generate secure entry passes for your visitors.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {!quickGeneratedCode ? (
                    <form onSubmit={handleQuickGenerateCode} className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Visitor Full Name</label>
                        <input
                          type="text"
                          required
                          value={quickVisitorName}
                          onChange={(e) => setQuickVisitorName(e.target.value)}
                          placeholder="e.g. Kola Alabi"
                          className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <Button type="submit" disabled={generatingCode} className="w-full font-semibold rounded-lg text-xs py-1.5 btn-interactive">
                        {generatingCode ? 'Generating...' : 'Generate Entry Code'}
                      </Button>
                    </form>
                  ) : (
                    <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl text-center space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Gate Passcode</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl font-black text-primary tracking-wider">{quickGeneratedCode}</span>
                        <button onClick={copyPasscode} className="p-1 hover:bg-primary/10 rounded transition-all cursor-pointer">
                          {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-primary" />}
                        </button>
                      </div>
                      <p className="text-[8px] text-muted-foreground leading-tight">
                        Give this 6-digit passcode to your guest to show security at the gate.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => setQuickGeneratedCode('')} className="w-full text-[10px] py-1 rounded-lg">
                        Create Another
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Quick Status / Emergency Contacts */}
            <Card className="p-4 border border-border/80 bg-card shadow-sm rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <Zap className="h-4.5 w-4.5 text-primary" />
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">Gate Security</h3>
              </div>
              <div className="space-y-2.5 text-xs text-foreground/90">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Emergency Line:</span>
                  <span className="font-bold font-mono">+234 802 000 1122</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Security Gate A:</span>
                  <span className="font-bold font-mono">+234 802 000 1133</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Security Gate B:</span>
                  <span className="font-bold font-mono">+234 802 000 1144</span>
                </div>
              </div>
            </Card>

          </aside>

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
        <Link href={`/estates/${site}/visitors`} className={`flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary ${isKycLocked ? 'opacity-40 pointer-events-none' : ''}`}>
          <Users className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Guests</span>
        </Link>
        <Link href={`/estates/${site}/chat`} className={`flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary ${isKycLocked ? 'opacity-40 pointer-events-none' : ''}`}>
          <MessageSquare className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Chat</span>
        </Link>
      </div>

      <Footer />
    </div>
  )
}
