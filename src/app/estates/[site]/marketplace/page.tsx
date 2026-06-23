'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ShoppingBag, Tag, Plus, CheckCircle, Search } from 'lucide-react'

interface MarketplaceItem {
  id: string
  title: string
  description: string
  price: number
  owner_id: string
  created_at: string
}

export default function Marketplace({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [estateId, setEstateId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

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
              setItems(itemsData)
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
          price: parseFloat(price)
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setItems([data, ...items])
        setTitle('')
        setDescription('')
        setPrice('')
        setSuccessMsg('Product listed successfully!')
        setShowAddForm(false)
      }
    } catch (err) {
      console.error('Failed to post item:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading Marketplace...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/20 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Estate Marketplace
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Buy and sell items within your verified neighborhood community.
              </p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="font-semibold rounded-xl flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Sell Item
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

          {/* Items grid */}
          {items.length === 0 ? (
            <Card className="p-12 text-center py-20 max-w-xl mx-auto">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-bold text-foreground text-lg">No Items listed</h3>
              <p className="text-muted-foreground text-sm mt-1">Be the first to list an item for sale in this estate.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="p-6 hover:shadow-lg transition-all card-lift border border-border flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-bold text-lg text-foreground leading-tight">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Posted on {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-extrabold text-primary text-lg">₦{item.price.toLocaleString()}</p>
                    </div>
                    <Button size="sm" className="font-semibold">Contact Seller</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
