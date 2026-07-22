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
  Send, Filter, Tag, Plus, Check, Copy, Heart, Smile, Megaphone, HelpCircle,
  Pin, Share2, AlertCircle, Star, ThumbsUp, MoreVertical, Bookmark, MessageCircle, Sparkles
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

interface Comment {
  id: string
  sender_name: string
  content: string
  created_at: string
  replies?: Comment[]
}

interface FeedItem {
  id: string
  type: 'announcement' | 'marketplace' | 'chat' | 'poll' | 'lost_found' | 'emergency' | 'recommendation'
  title?: string
  content: string
  price?: number
  sender_name: string
  created_at: string
  owner_id?: string
  likes_count?: number
  user_reacted?: string // 'like' | 'love' | 'thank' | 'sad' | null
  comments?: Comment[]
  poll_options?: { label: string; votes: number }[]
  poll_voted_index?: number
  lost_found?: { item: string; area: string; reward?: string }
  recommendation?: { category: string; rating: number }
  pinned?: boolean
  media_urls?: string[]
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
  const [feedFilter, setFeedFilter] = useState<'all' | 'announcement' | 'marketplace' | 'chat' | 'poll' | 'lost_found' | 'emergency' | 'recommendation' | 'pinned' | 'saved'>('all')
  const [savedPostIds, setSavedPostIds] = useState<string[]>([])
  
  // Rich Composer States
  const [composerTab, setComposerTab] = useState<'chat' | 'poll' | 'lost_found' | 'recommendation' | 'emergency'>('chat')
  const [newChatMsg, setNewChatMsg] = useState('')
  const [postingChat, setPostingChat] = useState(false)
  
  // Poll composer state
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  
  // Lost & Found composer state
  const [lostItem, setLostItem] = useState('')
  const [lostArea, setLostArea] = useState('')
  const [lostReward, setLostReward] = useState('')
  const [lostDesc, setLostDesc] = useState('')

  // Recommendation composer state
  const [recCategory, setRecCategory] = useState('Artisan')
  const [recRating, setRecRating] = useState(5)
  const [recDesc, setRecDesc] = useState('')

  // Emergency Alert composer state
  const [emergencyDesc, setEmergencyDesc] = useState('')

  // Comments and replies input state
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)
  const [newCommentText, setNewCommentText] = useState('')
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [newReplyText, setNewReplyText] = useState('')

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
        created_at: a.created_at,
        likes_count: 3,
        comments: [
          { id: '1', sender_name: 'Amara Nwachukwu', content: 'Thanks for this update. Good to know.', created_at: new Date(Date.now() - 3600000).toISOString() }
        ]
      }))

      const formattedMarketplace: FeedItem[] = (marketplace || []).map((m: any) => ({
        id: m.id,
        type: 'marketplace',
        title: m.title,
        content: m.description || '',
        price: m.price,
        sender_name: 'Verified Resident',
        created_at: m.created_at,
        owner_id: m.owner_id,
        likes_count: 1,
        comments: []
      }))

      const formattedChats: FeedItem[] = (chats || []).map((c: any) => ({
        id: c.id,
        type: 'chat',
        content: c.content,
        sender_name: c.sender_name || 'Resident',
        created_at: c.created_at,
        owner_id: c.profile_id,
        likes_count: 2,
        comments: []
      }))

      // MOCK POLLS, LOST & FOUND, RECOMMENDATIONS, ALERTS FOR RICH FEED EXPERIENCE
      const mockItems: FeedItem[] = [
        {
          id: 'mock-poll-1',
          type: 'poll',
          content: 'Should we upgrade the estate security gate to biometric scanner locks this quarter?',
          sender_name: 'Femi Kuti (Security Commitee)',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          likes_count: 12,
          poll_options: [
            { label: 'Yes, absolutely needed', votes: 45 },
            { label: 'No, too expensive', votes: 12 },
            { label: 'Need more details first', votes: 8 }
          ],
          comments: []
        },
        {
          id: 'mock-lost-found-1',
          type: 'lost_found',
          content: 'Missing brown Maltese puppy named Max. Wearing a red collar.',
          lost_found: { item: 'Puppy (Max)', area: 'Gate B Recreational Park', reward: '₦20,000' },
          sender_name: 'Mrs. Toyin Jacobs',
          created_at: new Date(Date.now() - 14400000).toISOString(),
          likes_count: 8,
          comments: [
            { id: '2', sender_name: 'Kunle A.', content: 'Shared max in the youth estate group. Hope you find him!', created_at: new Date(Date.now() - 12000000).toISOString() }
          ]
        },
        {
          id: 'mock-recommendation-1',
          type: 'recommendation',
          content: 'Highly recommend Ngozi Madu for all plumbing installations. Replaced our broken water heater within an hour!',
          recommendation: { category: 'Plumber', rating: 5 },
          sender_name: 'Dr. Obinna Oguejiofor',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          likes_count: 14,
          comments: []
        }
      ]

      // Combine and sort by date descending
      const combined = [...formattedAnnouncements, ...formattedMarketplace, ...formattedChats, ...mockItems]
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      // Make the first notice pinned by default
      if (combined.length > 0) {
        combined[0].pinned = true
      }
      
      setFeedItems(combined)
    } catch (e) {
      console.error('Failed to load activity feed:', e)
    }
  }

  // Handle post new item to feed based on composer tab
  const handlePostFeedItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estate || !userId) return
    setPostingChat(true)

    try {
      let newItem: FeedItem | null = null;

      if (composerTab === 'chat' && newChatMsg.trim()) {
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
          newItem = {
            id: data.id,
            type: 'chat',
            content: data.content,
            sender_name: data.sender_name,
            created_at: data.created_at,
            owner_id: data.profile_id,
            likes_count: 0,
            comments: []
          }
          setNewChatMsg('')
        }
      } else if (composerTab === 'poll' && pollQuestion.trim()) {
        const optionsList = pollOptions.filter(o => o.trim() !== '').map(label => ({ label, votes: 0 }))
        newItem = {
          id: `poll-${Date.now()}`,
          type: 'poll',
          content: pollQuestion.trim(),
          sender_name: userName,
          created_at: new Date().toISOString(),
          likes_count: 0,
          poll_options: optionsList,
          comments: []
        }
        setPollQuestion('')
        setPollOptions(['', ''])
      } else if (composerTab === 'lost_found' && lostItem.trim()) {
        newItem = {
          id: `lost-${Date.now()}`,
          type: 'lost_found',
          content: lostDesc.trim(),
          lost_found: { item: lostItem, area: lostArea, reward: lostReward },
          sender_name: userName,
          created_at: new Date().toISOString(),
          likes_count: 0,
          comments: []
        }
        setLostItem('')
        setLostArea('')
        setLostReward('')
        setLostDesc('')
      } else if (composerTab === 'recommendation' && recDesc.trim()) {
        newItem = {
          id: `rec-${Date.now()}`,
          type: 'recommendation',
          content: recDesc.trim(),
          recommendation: { category: recCategory, rating: recRating },
          sender_name: userName,
          created_at: new Date().toISOString(),
          likes_count: 0,
          comments: []
        }
        setRecDesc('')
        setRecCategory('Artisan')
      } else if (composerTab === 'emergency' && emergencyDesc.trim()) {
        newItem = {
          id: `emergency-${Date.now()}`,
          type: 'emergency',
          content: emergencyDesc.trim(),
          sender_name: userName,
          created_at: new Date().toISOString(),
          likes_count: 0,
          comments: []
        }
        setEmergencyDesc('')
      }

      if (newItem) {
        setFeedItems([newItem, ...feedItems])
      }
    } catch (err) {
      console.error('Error posting message:', err)
    } finally {
      setPostingChat(false)
    }
  }

  // Handle Poll Voting
  const handleVote = (itemId: string, optionIndex: number) => {
    setFeedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        // If already voted, ignore
        if (item.poll_voted_index !== undefined) return item
        const updatedOptions = [...(item.poll_options || [])]
        updatedOptions[optionIndex] = {
          ...updatedOptions[optionIndex],
          votes: updatedOptions[optionIndex].votes + 1
        }
        return {
          ...item,
          poll_options: updatedOptions,
          poll_voted_index: optionIndex
        }
      }
      return item
    }))
  }

  // Handle Reactions
  const handleReact = (itemId: string, reactionType: string) => {
    setFeedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const isSame = item.user_reacted === reactionType
        const countDiff = isSame ? -1 : (item.user_reacted ? 0 : 1)
        return {
          ...item,
          likes_count: (item.likes_count || 0) + countDiff,
          user_reacted: isSame ? undefined : reactionType
        }
      }
      return item
    }))
  }

  // Toggle Saved Posts
  const toggleSavePost = (postId: string) => {
    setSavedPostIds(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    )
  }

  // Add Comment
  const handleAddComment = (e: React.FormEvent, itemId: string) => {
    e.preventDefault()
    if (!newCommentText.trim()) return

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      sender_name: userName,
      content: newCommentText.trim(),
      created_at: new Date().toISOString(),
      replies: []
    }

    setFeedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          comments: [...(item.comments || []), newComment]
        }
      }
      return item
    }))

    setNewCommentText('')
    setActiveCommentId(null)
  }

  // Add Reply
  const handleAddReply = (e: React.FormEvent, itemId: string, commentId: string) => {
    e.preventDefault()
    if (!newReplyText.trim()) return

    const newReply: Comment = {
      id: `reply-${Date.now()}`,
      sender_name: userName,
      content: newReplyText.trim(),
      created_at: new Date().toISOString()
    }

    setFeedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedComments = (item.comments || []).map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            }
          }
          return comment
        })
        return { ...item, comments: updatedComments }
      }
      return item
    }))

    setNewReplyText('')
    setActiveReplyId(null)
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
            <MapPin className="h-12 w-12 text-destructive mx-auto" />
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
    if (feedFilter === 'pinned') return item.pinned
    if (feedFilter === 'saved') return savedPostIds.includes(item.id)
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
              <Link href={`/`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-primary bg-primary/5">
                <Home className="h-4.5 w-4.5" />
                <span>Home Feed</span>
              </Link>
              <Link href={`/notices`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Bell className="h-4.5 w-4.5" />
                <span>Notices</span>
              </Link>
              <Link href={`/marketplace`} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${isKycLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                <ShoppingBag className="h-4.5 w-4.5" />
                <span>Marketplace</span>
              </Link>
              <Link href={`/visitors`} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${isKycLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                <Users className="h-4.5 w-4.5" />
                <span>Guest Codes</span>
              </Link>
              <Link href="/chat" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${isKycLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                <MessageSquare className="h-4.5 w-4.5" />
                <span>Community Chat</span>
              </Link>
              <Link href="/support" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <FileText className="h-4.5 w-4.5" />
                <span>Support Tickets</span>
              </Link>

              {userRole === 'admin' && (
                <div className="pt-4 mt-3 border-t border-border/60">
                  <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-foreground bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all">
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

            {/* UPGRADED RICH POST COMPOSER */}
            <Card className="p-4 border border-border/80 bg-card shadow-sm rounded-2xl">
              {/* Tabs selector */}
              <div className="flex items-center gap-1.5 border-b border-border/40 pb-2 mb-3 overflow-x-auto no-scrollbar">
                {[
                  { value: 'chat', label: 'Discussion', icon: MessageSquare },
                  { value: 'poll', label: 'Create Poll', icon: HelpCircle },
                  { value: 'lost_found', label: 'Lost & Found', icon: Sparkles },
                  { value: 'recommendation', label: 'Recommend', icon: Star },
                  { value: 'emergency', label: 'Alert', icon: AlertCircle }
                ].map(tab => (
                  <button
                    key={tab.value}
                    type="button"
                    disabled={isKycLocked}
                    onClick={() => setComposerTab(tab.value as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                      composerTab === tab.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    } ${isKycLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handlePostFeedItem} className="space-y-3">
                {/* 1. Discussion Composer */}
                {composerTab === 'chat' && (
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
                )}

                {/* 2. Poll Composer */}
                {composerTab === 'poll' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Ask a question..."
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="space-y-2">
                      {pollOptions.map((option, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-xs text-muted-foreground font-bold">{idx + 1}.</span>
                          <input
                            type="text"
                            required
                            placeholder={`Option ${idx + 1}`}
                            value={option}
                            onChange={(e) => {
                              const updated = [...pollOptions]
                              updated[idx] = e.target.value
                              setPollOptions(updated)
                            }}
                            className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        className="text-[10px] py-1 px-2.5 rounded-lg"
                      >
                        + Add Option
                      </Button>
                    </div>
                  </div>
                )}

                {/* 3. Lost & Found Composer */}
                {composerTab === 'lost_found' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="What was lost?"
                        value={lostItem}
                        onChange={(e) => setLostItem(e.target.value)}
                        className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Where/Area?"
                        value={lostArea}
                        onChange={(e) => setLostArea(e.target.value)}
                        className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="text"
                        placeholder="Reward (optional)"
                        value={lostReward}
                        onChange={(e) => setLostReward(e.target.value)}
                        className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <textarea
                      rows={2}
                      required
                      placeholder="Add more details or item description..."
                      value={lostDesc}
                      onChange={(e) => setLostDesc(e.target.value)}
                      className="w-full rounded-xl border border-input bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                {/* 4. Recommendation Composer */}
                {composerTab === 'recommendation' && (
                  <div className="space-y-3">
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <select
                          value={recCategory}
                          onChange={(e) => setRecCategory(e.target.value)}
                          className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="Plumber">Plumbing</option>
                          <option value="Electrician">Electrical</option>
                          <option value="AC Technician">AC Repair</option>
                          <option value="Carpenter">Carpentry</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground font-bold">Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRecRating(star)}
                            className="p-0.5 cursor-pointer"
                          >
                            <Star className={`h-4.5 w-4.5 ${star <= recRating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      required
                      placeholder="Describe your recommendation..."
                      value={recDesc}
                      onChange={(e) => setRecDesc(e.target.value)}
                      className="w-full rounded-xl border border-input bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                {/* 5. Emergency Alert Composer */}
                {composerTab === 'emergency' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-600 bg-red-500/10 p-2.5 rounded-xl border border-red-500/25">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <span className="text-xs font-bold">This triggers an emergency notification to nearby guards and residents.</span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      placeholder="Specify emergency details (e.g. fire, security breach at gate...)"
                      value={emergencyDesc}
                      onChange={(e) => setEmergencyDesc(e.target.value)}
                      className="w-full rounded-xl border border-red-500/25 bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                )}

                {!isKycLocked && (
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground capitalize">Posting to Gated Feed</span>
                    <Button type="submit" size="sm" disabled={postingChat} className="font-semibold rounded-lg text-xs py-1 px-3 btn-interactive flex items-center gap-1">
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
                  { value: 'poll', label: 'Polls' },
                  { value: 'lost_found', label: 'Lost & Found' },
                  { value: 'recommendation', label: 'Recs' },
                  { value: 'pinned', label: 'Pinned' },
                  { value: 'saved', label: 'Saved' }
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
                  <Card key={item.id} className={`p-5 border hover:border-border/95 transition-all shadow-sm rounded-2xl flex flex-col justify-between ${item.pinned ? 'border-primary/45 bg-primary/[0.01]' : 'border-border/70'}`}>
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                            {item.sender_name[0]?.toUpperCase() || 'R'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-foreground leading-none">{item.sender_name}</p>
                              {item.pinned && <Pin className="h-3 w-3 text-primary fill-primary" />}
                            </div>
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

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleSavePost(item.id)}
                            className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Bookmark className={`h-4 w-4 ${savedPostIds.includes(item.id) ? 'text-primary fill-primary' : ''}`} />
                          </button>
                          <Badge variant="outline" className="text-[9px] font-bold capitalize">
                            {item.type}
                          </Badge>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="space-y-3 mt-2">
                        {item.title && <h3 className="font-bold text-sm text-foreground">{item.title}</h3>}
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.content}</p>

                        {/* Poll Widget inside Feed */}
                        {item.type === 'poll' && item.poll_options && (
                          <div className="space-y-2.5 bg-muted/30 p-3.5 rounded-xl border border-border/30">
                            {item.poll_options.map((opt, oIdx) => {
                              const totalVotes = (item.poll_options || []).reduce((sum, current) => sum + current.votes, 0)
                              const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
                              const isVoted = item.poll_voted_index !== undefined
                              return (
                                <div key={oIdx} className="space-y-1.5">
                                  <button
                                    type="button"
                                    disabled={isVoted}
                                    onClick={() => handleVote(item.id, oIdx)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex justify-between items-center transition-all ${
                                      item.poll_voted_index === oIdx
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'bg-card hover:bg-muted/70 border border-border/50'
                                    }`}
                                  >
                                    <span>{opt.label}</span>
                                    {isVoted && <span className="font-bold">{percent}%</span>}
                                  </button>
                                  {isVoted && (
                                    <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-primary h-full transition-all" style={{ width: `${percent}%` }} />
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                            <p className="text-[9px] text-muted-foreground font-mono">
                              Total Votes: {(item.poll_options || []).reduce((sum, current) => sum + current.votes, 0)}
                            </p>
                          </div>
                        )}

                        {/* Lost & Found Details */}
                        {item.type === 'lost_found' && item.lost_found && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-amber-500/5 p-3 rounded-xl border border-amber-500/15 text-xs text-foreground">
                            <div>
                              <p className="text-[9px] uppercase font-bold text-amber-700">Lost Item</p>
                              <p className="font-bold mt-0.5">{item.lost_found.item}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-amber-700">Area Last Seen</p>
                              <p className="font-semibold mt-0.5">{item.lost_found.area}</p>
                            </div>
                            {item.lost_found.reward && (
                              <div>
                                <p className="text-[9px] uppercase font-bold text-amber-700">Reward</p>
                                <p className="font-black text-primary mt-0.5">{item.lost_found.reward}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Recommendation details */}
                        {item.type === 'recommendation' && item.recommendation && (
                          <div className="flex items-center gap-3 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/15 text-xs text-foreground">
                            <div className="h-9 w-9 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                              <Star className="h-4.5 w-4.5 fill-emerald-600" />
                            </div>
                            <div>
                              <p className="font-bold">Recommended: {item.recommendation.category}</p>
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`h-3 w-3 ${s <= (item.recommendation?.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Actions (Likes & comment toggle) */}
                      <div className="flex items-center gap-4 mt-5 pt-3 border-t border-border/30 text-muted-foreground text-xs font-semibold">
                        {/* Reaction options list */}
                        <div className="flex items-center gap-1 group relative">
                          <button
                            onClick={() => handleReact(item.id, 'like')}
                            className={`flex items-center gap-1 p-1 rounded-lg hover:bg-muted transition-all cursor-pointer ${item.user_reacted ? 'text-primary' : ''}`}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{item.likes_count || 0}</span>
                          </button>
                          
                          {/* Hover reactions popup */}
                          <div className="hidden group-hover:flex absolute bottom-full left-0 bg-card border border-border/80 rounded-full shadow-lg p-1 items-center gap-1.5 animate-fade-in-scale z-20">
                            {[
                              { label: '👍', value: 'like' },
                              { label: '❤️', value: 'love' },
                              { label: '🙏', value: 'thank' },
                              { label: '😢', value: 'sad' }
                            ].map(reaction => (
                              <button
                                key={reaction.value}
                                onClick={() => handleReact(item.id, reaction.value)}
                                className="hover:scale-125 transition-transform p-1 cursor-pointer"
                              >
                                {reaction.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveCommentId(activeCommentId === item.id ? null : item.id)
                          }}
                          className="flex items-center gap-1 hover:text-foreground cursor-pointer"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Comments ({(item.comments || []).length})</span>
                        </button>

                        <button className="flex items-center gap-1 hover:text-foreground ml-auto cursor-pointer">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                      </div>

                      {/* Comments Drawer / Block */}
                      {activeCommentId === item.id && (
                        <div className="mt-4 pt-3 border-t border-border/40 space-y-4">
                          {/* Post comment form */}
                          <form onSubmit={(e) => handleAddComment(e, item.id)} className="flex gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Write a comment..."
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              className="w-full rounded-xl border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <Button type="submit" size="sm" className="font-semibold text-xs rounded-xl py-1 px-3">Comment</Button>
                          </form>

                          {/* Comments List */}
                          <div className="space-y-3.5 pl-2 border-l border-border/60">
                            {(item.comments || []).map(comment => (
                              <div key={comment.id} className="space-y-2">
                                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/25">
                                  <div className="flex justify-between items-center">
                                    <p className="text-xs font-bold text-foreground">{comment.sender_name}</p>
                                    <span className="text-[8px] text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{comment.content}</p>
                                  
                                  <div className="mt-2">
                                    <button
                                      onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                                      className="text-[9px] font-bold text-primary hover:underline cursor-pointer"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>

                                {/* Nested Replies */}
                                <div className="space-y-2 pl-4">
                                  {(comment.replies || []).map(reply => (
                                    <div key={reply.id} className="bg-muted/60 p-2 rounded-xl border border-border/15">
                                      <div className="flex justify-between items-center">
                                        <p className="text-[11px] font-bold text-foreground">{reply.sender_name}</p>
                                        <span className="text-[8px] text-muted-foreground">{new Date(reply.created_at).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{reply.content}</p>
                                    </div>
                                  ))}

                                  {/* Reply input */}
                                  {activeReplyId === comment.id && (
                                    <form onSubmit={(e) => handleAddReply(e, item.id, comment.id)} className="flex gap-2 pt-1">
                                      <input
                                        type="text"
                                        required
                                        placeholder="Reply to comment..."
                                        value={newReplyText}
                                        onChange={(e) => setNewReplyText(e.target.value)}
                                        className="w-full rounded-lg border border-input bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                      />
                                      <Button type="submit" size="sm" className="font-semibold text-[10px] rounded-lg px-2 h-7">Reply</Button>
                                    </form>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
        <Link href="/" className="flex flex-col items-center gap-0.5 text-primary">
          <Home className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Home</span>
        </Link>
        <Link href="/notices" className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary">
          <Bell className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Notices</span>
        </Link>
        <Link href="/visitors" className={`flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary ${isKycLocked ? 'opacity-40 pointer-events-none' : ''}`}>
          <Users className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Guests</span>
        </Link>
        <Link href="/chat" className={`flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary ${isKycLocked ? 'opacity-40 pointer-events-none' : ''}`}>
          <MessageSquare className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Chat</span>
        </Link>
      </div>

      <Footer />
    </div>
  )
}
