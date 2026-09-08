import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { dal } from '@/lib/dal'
import { getCurrentUser } from '@/lib/auth/session'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { ShoppingBag, ArrowLeft, Tag, Shield } from 'lucide-react'

export default async function CommunityMarketplacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const community = dal.getCommunityBySlug(slug)

  if (!community) notFound()

  const currentUser = await getCurrentUser()
  const membership = currentUser ? dal.getMembership(currentUser.id, community.id) : null

  if (!membership || membership.status !== 'APPROVED') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md text-center space-y-4">
            <h1 className="text-xl font-bold">Verified Residents Only</h1>
            <p className="text-xs text-muted-foreground">Estate marketplace is private to verified residents.</p>
            <Link href={`/c/${slug}`}><Button size="sm">Go to Estate</Button></Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const items = dal.getMarketplaceItems(community.id)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/c/${community.slug}`}>
              <Button variant="ghost" size="sm" className="rounded-xl gap-1 text-xs">
                <ArrowLeft className="w-4 h-4" /> Back to Feed
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-foreground">Community Marketplace</h1>
              <p className="text-xs text-muted-foreground">Items listed by neighbors in {community.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.length === 0 ? (
            <Card className="p-8 col-span-2 text-center border border-border bg-card space-y-2">
              <ShoppingBag className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">No items currently listed in this estate.</p>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="p-5 border border-border bg-card space-y-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <h2 className="text-base font-bold text-foreground">{item.title}</h2>
                  <span className="text-sm font-black text-primary">
                    ₦{item.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Seller: <strong>{item.sellerName}</strong></span>
                  <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                    Available
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
