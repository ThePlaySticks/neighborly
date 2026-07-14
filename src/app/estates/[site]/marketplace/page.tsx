'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ShoppingBag, Tag, Plus, CheckCircle, Search, Filter, Bookmark, Share2, Grid, List, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface MarketplaceItem {
  id: string
  title: string
  description: string
  price: number
  owner_id: string
  created_at: string
  category?: string
  media_urls?: string[]
  is_featured?: boolean
  saved?: boolean
}

export default function Marketplace({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [estateId, setEstateId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [savedIds, setSavedIds] = useState<string[]>([])

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Furniture')
  const [imageUrl, setImageUrl] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const categories = ['Electronics', 'Vehicles', 'Furniture', 'Housing', 'Clothing', 'Services', 'Others']

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          
          // Get profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('estate_id')
            .eq('id', user.id)
            .single()

          if (profile) {
            setEstateId(profile.estate_id)

            // Fetch marketplace items
            const { data: itemsData } = await supabase
              .from('marketplace_items')
              .select('*')
              .eq('estate_id', profile.estate_id)
              .order('created_at', { ascending: false })

            if (itemsData) {
              // Add mock categories/images for high-fidelity presentation
              const enriched: MarketplaceItem[] = itemsData.map((item: any, idx: number) => ({
                ...item,
                category: idx % 3 === 0 ? 'Electronics' : idx % 3 === 1 ? 'Furniture' : 'Vehicles',
                media_urls: item.image_url ? [item.image_url] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'],
                is_featured: idx === 0
              }))
              setItems(enriched)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching marketplace:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [site])

  const handlePostItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estateId || !userId) return
    setSubmitting(true)
    setSuccessMsg('')

    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
          estate_id: estateId,
          owner_id: userId,
          title,
          description,
          price: parseFloat(price),
          image_url: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        const enriched: MarketplaceItem = {
          ...data,
          category,
          media_urls: [data.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'],
          is_featured: false
        }
        setItems([enriched, ...items])
        setTitle('')
        setDescription('')
        setPrice('')
        setImageUrl('')
        setSuccessMsg('Product listed successfully!')
        setShowAddForm(false)
      }
    } catch (err) {
      console.error('Failed to post item:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSave = (itemId: string) => {
    setSavedIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    )
  }

  // Filter listings
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesPrice = !maxPrice || item.price <= parseFloat(maxPrice)
    return matchesSearch && matchesCategory && matchesPrice
  })

  // Featured Item (first featured item or first item overall)
  const featuredItem = items.find(i => i.is_featured) || items[0]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Marketplace
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Facebook Marketplace-style secure trades restricted to verified residents.
              </p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="font-semibold rounded-xl flex items-center gap-1.5 btn-interactive"
            >
              <Plus className="h-4 w-4" /> Create Listing
            </Button>
          </div>

          {/* Add Item Form */}
          {showAddForm && (
            <Card className="p-6 border-primary/20 bg-primary/5 animate-slide-down max-w-xl mx-auto">
              <h3 className="font-bold text-foreground text-lg mb-4 flex items-center gap-1.5">
                <Tag className="h-5 w-5 text-primary" /> List Item for Sale
              </h3>
              <form onSubmit={handlePostItem} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samsung 55 inch TV"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price (NGN)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description &amp; Condition</label>
                  <textarea
                    rows={3}
                    placeholder="Describe item condition, reasons for selling, pick-up terms, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="font-semibold">
                    {submitting ? 'Submitting...' : 'Post Listing'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-2 animate-fade-in max-w-xl mx-auto">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FB-Style Filters Panel & Listings Layout Split */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Column: Filter Sidebar */}
            <aside className="space-y-6">
              <Card className="p-5 border border-border/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-primary" /> Filters
                  </span>
                  <button 
                    onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setMaxPrice('') }}
                    className="text-[10px] font-semibold text-primary hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                {/* Search */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                    <input
                      type="text"
                      placeholder="Search listings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedCategory === 'all' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedCategory === cat ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Limit */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Max Price (NGN)</label>
                  <input
                    type="number"
                    placeholder="e.g. 200000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </Card>
            </aside>

            {/* Right Columns: Featured & Listings Grid */}
            <div className="lg:col-span-3 space-y-8">
              
              {/* FEATURED BANNER */}
              {featuredItem && selectedCategory === 'all' && !searchQuery && (
                <Card className="overflow-hidden border border-primary/20 bg-primary/5 flex flex-col md:flex-row shadow-sm">
                  <div className="md:w-1/2 h-64 relative bg-muted">
                    <img 
                      src={featuredItem.media_urls?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'} 
                      alt={featuredItem.title} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="shadow">★ Featured Today</Badge>
                    </div>
                  </div>
                  <div className="p-6 md:w-1/2 flex flex-col justify-between">
                    <div>
                      <Badge variant="outline" className="text-[9px] font-bold text-primary border-primary/25 bg-primary/5">{featuredItem.category}</Badge>
                      <h2 className="text-xl font-bold text-foreground mt-2">{featuredItem.title}</h2>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                        {featuredItem.description || 'No description provided.'}
                      </p>
                    </div>
                    <div className="border-t border-border/40 pt-4 mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Verified Resident Deal</p>
                        <p className="text-2xl font-black text-primary">₦{featuredItem.price.toLocaleString()}</p>
                      </div>
                      <Link href={`/estates/${site}/chat`}>
                        <Button className="font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4" /> Chat Seller
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )}

              {/* Items grid */}
              {filteredItems.length === 0 ? (
                <Card className="p-12 text-center py-20 border border-border/80">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="font-bold text-foreground text-lg">No Listings found</h3>
                  <p className="text-muted-foreground text-xs mt-1">Try modifying your filter parameters or search queries.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all card-lift border border-border flex flex-col justify-between h-full">
                      {/* Image container */}
                      <div className="h-44 w-full relative bg-muted border-b border-border/45">
                        <img 
                          src={item.media_urls?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'} 
                          alt={item.title} 
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSave(item.id)}
                          className="absolute top-2.5 right-2.5 p-1.5 bg-card/90 backdrop-blur-sm rounded-full border border-border shadow-sm hover:scale-105 transition-transform text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${savedIds.includes(item.id) ? 'text-primary fill-primary' : ''}`} />
                        </button>
                      </div>

                      {/* Content info */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-[9px] font-bold border-border/80 bg-muted/20">{item.category}</Badge>
                            <span className="text-[9px] text-muted-foreground font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-bold text-base text-foreground leading-snug line-clamp-1">{item.title}</h3>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                            {item.description || 'No description provided.'}
                          </p>
                        </div>

                        <div className="border-t border-border/40 mt-4 pt-3 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] text-muted-foreground">Price</p>
                            <p className="font-extrabold text-primary text-sm">₦{item.price.toLocaleString()}</p>
                          </div>
                          <Link href={`/estates/${site}/chat`}>
                            <Button size="sm" className="font-semibold text-xs py-1.5 rounded-lg flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" /> Chat
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
