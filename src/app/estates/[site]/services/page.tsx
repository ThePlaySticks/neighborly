'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Wrench, Shield, CheckCircle, Clock, Star, Phone, MessageSquare, ExternalLink, ThumbsUp, Send } from 'lucide-react'

interface Review {
  id: string
  reviewer: string
  rating: number
  comment: string
  created_at: string
}

interface ServiceProvider {
  id: string
  name: string
  profession: string
  rating: number
  jobsDone: number
  hourlyRate: number
  description: string
  logo_url: string
  cover_url: string
  working_hours: string
  whatsapp: string
  phone: string
  reviews: Review[]
  gallery_urls: string[]
}

const PROVIDERS: ServiceProvider[] = [
  {
    id: 'prov-1',
    name: 'Tunde Alao Electrical Ltd',
    profession: 'Electrician',
    rating: 4.9,
    jobsDone: 312,
    hourlyRate: 5000,
    description: 'Expert industrial and domestic electrician. Specialized in inverter installations, automatic changeover switches, and general electrical wiring troubleshooting.',
    logo_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&q=80',
    cover_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    working_hours: '08:00 AM - 06:00 PM',
    whatsapp: '2348012345678',
    phone: '+234 801 234 5678',
    gallery_urls: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&q=80'
    ],
    reviews: [
      { id: 'r1', reviewer: 'Adebayo O.', rating: 5, comment: 'Very professional. Set up my 5KVA inverter perfectly.', created_at: '2026-07-10' },
      { id: 'r2', reviewer: 'Chioma N.', rating: 4.8, comment: 'Prompt arrival and diagnosed the short circuit quickly.', created_at: '2026-07-08' }
    ]
  },
  {
    id: 'prov-2',
    name: 'Ngozi Madu Plumbing Services',
    profession: 'Plumber',
    rating: 4.8,
    jobsDone: 201,
    hourlyRate: 4500,
    description: 'Professional plumbing solutions. Specialized in water heater replacement, leak detection, boreholes, and estate main sewage line clearance.',
    logo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
    cover_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
    working_hours: '07:30 AM - 07:00 PM',
    whatsapp: '2348023456789',
    phone: '+234 802 345 6789',
    gallery_urls: [
      'https://images.unsplash.com/photo-1542013936693-8848e574047e?w=300&q=80'
    ],
    reviews: [
      { id: 'r3', reviewer: 'Emeka E.', rating: 5, comment: 'Replaced my water heater perfectly, no mess left behind.', created_at: '2026-07-11' }
    ]
  },
  {
    id: 'prov-3',
    name: 'Emeka Osei AC & Coldroom Ltd',
    profession: 'AC Technician',
    rating: 4.7,
    jobsDone: 143,
    hourlyRate: 7000,
    description: 'Cooling systems experts. AC repair, split unit installation, deep cleansing maintenance, and coldroom repairs.',
    logo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    cover_url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&q=80',
    working_hours: '09:00 AM - 05:00 PM',
    whatsapp: '2348034567890',
    phone: '+234 803 456 7890',
    gallery_urls: [],
    reviews: []
  }
]

export default function Services({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [markupPercent, setMarkupPercent] = useState<number>(1.5)
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(PROVIDERS[0])
  const [bookingHours, setBookingHours] = useState<number>(2)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Review form state
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'gallery'>('details')

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data: estateData } = await supabase
          .from('estates')
          .select('id, markup_percent')
          .eq('subdomain', site)
          .single()

        if (estateData && estateData.markup_percent !== null) {
          setMarkupPercent(Number(estateData.markup_percent))
        } else {
          const { data: settingsData } = await supabase
            .from('super_admin_settings')
            .select('markup_percent')
            .eq('id', 'config')
            .single()

          if (settingsData) {
            setMarkupPercent(Number(settingsData.markup_percent))
          }
        }
      } catch (err) {
        console.error('Error fetching billing settings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [site])

  const calculateMarkup = (subtotal: number) => {
    return (subtotal * markupPercent) / 100
  }

  const handleBook = () => {
    setBookingSuccess(true)
    setTimeout(() => {
      setBookingSuccess(false)
    }, 3000)
  }

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProvider || !reviewComment.trim()) return

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      reviewer: 'Verified Resident',
      rating,
      comment: reviewComment.trim(),
      created_at: new Date().toISOString().split('T')[0]
    }

    selectedProvider.reviews = [newReview, ...selectedProvider.reviews]
    setReviewComment('')
    setRating(5)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading Services...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Header */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Local Services &amp; Artisans
              </h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Google Business-style directory profiles verified by estate administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Providers list (Left Column: 5/12 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider mb-2">Verified Providers</h3>
              <div className="space-y-4">
                {PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => { setSelectedProvider(provider); setBookingSuccess(false); setActiveTab('details') }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                      selectedProvider?.id === provider.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/80 bg-card hover:border-primary/50'
                    }`}
                  >
                    <img 
                      src={provider.logo_url} 
                      alt={provider.name} 
                      className="h-12 w-12 rounded-xl object-cover border border-border shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-foreground text-sm truncate">{provider.name}</h4>
                        <Badge variant="success" className="text-[8px] py-0 px-1 shrink-0">Verified</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{provider.profession}</p>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-extrabold text-primary">₦{provider.hourlyRate.toLocaleString()}/hr</span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-foreground">{provider.rating}</span>
                          <span>({provider.jobsDone} jobs)</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Provider detail card & booking layout (Right Column: 7/12 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {selectedProvider ? (
                <div className="space-y-6">
                  
                  {/* Google Business-style Profile Card */}
                  <Card className="overflow-hidden border border-border/80 shadow-sm rounded-2xl">
                    <div className="h-32 bg-muted relative">
                      <img 
                        src={selectedProvider.cover_url} 
                        alt="cover" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 relative pt-12 space-y-4">
                      {/* Logo positioned floating above cover */}
                      <img 
                        src={selectedProvider.logo_url} 
                        alt="logo" 
                        className="absolute -top-10 left-6 h-20 w-20 rounded-2xl object-cover border-4 border-card shadow"
                      />
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-foreground">{selectedProvider.name}</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">{selectedProvider.profession}</p>
                        </div>
                        <a 
                          href={`https://wa.me/${selectedProvider.whatsapp}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
                        >
                          <Phone className="h-4 w-4 fill-white" /> WhatsApp
                        </a>
                      </div>

                      {/* Tab buttons */}
                      <div className="flex border-b border-border/40 pb-1 gap-4">
                        {[
                          { key: 'details', label: 'Details' },
                          { key: 'reviews', label: 'Reviews & Ratings' },
                          { key: 'gallery', label: 'Works Gallery' }
                        ].map(t => (
                          <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key as any)}
                            className={`text-xs font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                              activeTab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab Details */}
                      {activeTab === 'details' && (
                        <div className="space-y-4 text-xs text-foreground/95">
                          <p className="leading-relaxed text-muted-foreground">{selectedProvider.description}</p>
                          <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
                            <div className="space-y-1">
                              <p className="text-[9px] uppercase font-bold text-muted-foreground">Working Hours</p>
                              <p className="font-semibold">{selectedProvider.working_hours}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] uppercase font-bold text-muted-foreground">Hourly Rate</p>
                              <p className="font-extrabold text-primary">₦{selectedProvider.hourlyRate.toLocaleString()}/hr</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tab Reviews */}
                      {activeTab === 'reviews' && (
                        <div className="space-y-4">
                          <form onSubmit={handleAddReview} className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border/30">
                            <h4 className="text-xs font-bold text-foreground">Write a Review</h4>
                            <div className="flex gap-2 items-center">
                              <span className="text-xs text-muted-foreground">Rating:</span>
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRating(star)}
                                  className="p-0.5"
                                >
                                  <Star className={`h-4.5 w-4.5 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                                </button>
                              ))}
                            </div>
                            <textarea
                              rows={2}
                              required
                              placeholder="Share your experience with this service provider..."
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="w-full rounded-lg border border-input bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <Button type="submit" size="sm" className="font-semibold text-xs py-1 px-3">Submit Review</Button>
                          </form>

                          <div className="space-y-3.5">
                            {selectedProvider.reviews.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-4">No reviews yet. Be the first to review!</p>
                            ) : (
                              selectedProvider.reviews.map(rev => (
                                <div key={rev.id} className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-foreground">{rev.reviewer}</span>
                                    <span className="text-[10px] text-muted-foreground">{rev.created_at}</span>
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                      <Star key={s} className={`h-3 w-3 ${s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                                    ))}
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tab Gallery */}
                      {activeTab === 'gallery' && (
                        <div className="grid grid-cols-2 gap-4">
                          {selectedProvider.gallery_urls.length === 0 ? (
                            <p className="col-span-2 text-xs text-muted-foreground text-center py-8">No portfolio images uploaded.</p>
                          ) : (
                            selectedProvider.gallery_urls.map((url, idx) => (
                              <div key={idx} className="h-40 rounded-xl overflow-hidden border border-border">
                                <img src={url} alt="work" className="w-full h-full object-cover" />
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Dispatch Booking Widget */}
                  <Card className="p-6 border border-border/80 bg-card shadow-sm rounded-2xl space-y-6">
                    <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Book Dispatch Summary</h3>
                    </div>

                    {bookingSuccess ? (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="font-bold">Dispatch Sent Successfully!</p>
                          <p className="text-xs text-muted-foreground mt-0.5">We have sent a dispatch booking request to {selectedProvider.name}.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Estimated Hours Needed
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={bookingHours}
                            onChange={(e) => setBookingHours(parseInt(e.target.value) || 1)}
                            className="w-full rounded-xl border border-input bg-card px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        {/* Cost Calculator */}
                        <div className="border-t border-border pt-4 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal ({selectedProvider.hourlyRate.toLocaleString()} x {bookingHours}h)</span>
                            <span className="font-semibold text-foreground">₦{(selectedProvider.hourlyRate * bookingHours).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">Platform Booking Fee ({markupPercent}%)</span>
                            <span className="font-semibold text-foreground">₦{calculateMarkup(selectedProvider.hourlyRate * bookingHours).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t border-border/40 pt-2.5 font-bold text-sm">
                            <span className="text-foreground">Total Cost</span>
                            <span className="text-primary font-extrabold">
                              ₦{(
                                selectedProvider.hourlyRate * bookingHours + 
                                calculateMarkup(selectedProvider.hourlyRate * bookingHours)
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <Button onClick={handleBook} className="w-full font-semibold rounded-xl py-3 btn-interactive">
                          Confirm &amp; Dispatch Request
                        </Button>
                      </div>
                    )}
                  </Card>

                </div>
              ) : (
                <Card className="p-12 text-center border border-dashed border-border py-20 rounded-2xl">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="font-bold text-foreground">Select a Provider</h3>
                  <p className="text-muted-foreground text-xs mt-1 max-w-xs mx-auto">
                    Choose a provider from the list to view their complete profile, reviews, and to calculate your booking costs.
                  </p>
                </Card>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
