'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Shield, Bell, ShoppingBag, AlertTriangle, Users, MapPin, Wrench, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Estate {
  id: string
  name: string
  subdomain: string
  subscription_status: string
}

export default function EstatePortal({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()
  
  const [estate, setEstate] = useState<Estate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEstate() {
      try {
        const { data, error } = await supabase
          .from('estates')
          .select('*')
          .eq('subdomain', site)
          .single()
        
        if (data) {
          setEstate(data)
        }
      } catch (err) {
        console.error('Error fetching estate:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEstate()
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
            <Link href="http://localhost:3000/signup">
              <Button className="font-semibold rounded-xl">Register Your Estate</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Header */}
      <section className="relative bg-muted/30 border-b border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="success" className="px-3 py-1 text-xs rounded-full uppercase tracking-wider font-semibold">
            🏡 Official Estate Portal
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground">
            {estate.name}
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{estate.subdomain}.neighborly.ng</span>
          </div>
        </div>
      </section>

      {/* Main resident menu */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Resident Dashboard Actions */}
          <div className="md:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <Card className="p-6 card-lift group hover:border-primary">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">Notice Board</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Stay updated with notices, water schedules, and announcements from estate management.
                </p>
                <Link href={`/notices`} className="inline-flex items-center text-primary text-sm font-semibold hover:underline gap-1">
                  View Notices <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>

              <Card className="p-6 card-lift group hover:border-primary">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">Marketplace</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Buy, sell, and trade household items with verified neighbors inside {estate.name}.
                </p>
                <Link href={`/marketplace`} className="inline-flex items-center text-primary text-sm font-semibold hover:underline gap-1">
                  Go to Marketplace <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>

              <Card className="p-6 card-lift group hover:border-primary">
                <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-4">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">Artisans &amp; Services</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Book verified plumbers, electricians, cleaners, and other service providers.
                </p>
                <Link href={`/services`} className="inline-flex items-center text-primary text-sm font-semibold hover:underline gap-1">
                  Book Service <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>

              <Card className="p-6 bg-red-500/5 border-red-500/20 group hover:border-red-500/50">
                <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">Panic Button</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Trigger an immediate security alert to estate guards and emergency contacts.
                </p>
                <Button variant="outline" className="text-red-500 hover:bg-red-500 hover:text-white border-red-500/30">
                  Trigger Alert
                </Button>
              </Card>

            </div>
          </div>

          {/* Sidebar Portal Admin Info */}
          <div className="space-y-6">
            <Card className="p-6 border-primary/20 bg-primary/5 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">Management Portal</h3>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                If you are the administrator of this estate, you can manage residents, update notice boards, and handle subscriptions.
              </p>
              <Link href={`/admin`} className="block">
                <Button className="w-full font-semibold rounded-xl">
                  Manage Estate
                </Button>
              </Link>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                <h3 className="font-bold text-foreground">Verification Notice</h3>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                To access features like Marketplace or Notice Board, you must register as a resident of {estate.name} and be approved by the estate administrator.
              </p>
            </Card>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
