'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Wrench, Shield, CheckCircle, Clock, Star, DollarSign } from 'lucide-react'

interface ServiceProvider {
  name: string
  profession: string
  rating: number
  jobsDone: number
  hourlyRate: number
}

const PROVIDERS: ServiceProvider[] = [
  { name: 'Tunde Alao', profession: 'Electrician', rating: 4.9, jobsDone: 312, hourlyRate: 5000 },
  { name: 'Ngozi Madu', profession: 'Plumber', rating: 4.8, jobsDone: 201, hourlyRate: 4500 },
  { name: 'Emeka Osei', profession: 'AC Technician', rating: 4.7, jobsDone: 143, hourlyRate: 7000 },
  { name: 'Aina Bakare', profession: 'Painter', rating: 4.6, jobsDone: 98, hourlyRate: 4000 }
]

export default function Services({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [markupPercent, setMarkupPercent] = useState<number>(1.5)
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null)
  const [bookingHours, setBookingHours] = useState<number>(2)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        // Fetch estate specific markup or general markup
        const { data: estateData } = await supabase
          .from('estates')
          .select('id, markup_percent')
          .eq('subdomain', site)
          .single()

        if (estateData && estateData.markup_percent !== null) {
          setMarkupPercent(Number(estateData.markup_percent))
        } else {
          // Fetch global markup
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
      setSelectedProvider(null)
    }, 3000)
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

      <main className="flex-1 bg-muted/20 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Header */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Verified Artisans &amp; Services
              </h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Book professional service providers verified by estate administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Providers List Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {PROVIDERS.map((provider) => (
                  <Card key={provider.name} className="p-6 border border-border hover:border-primary transition-all card-lift flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-foreground text-lg leading-tight">{provider.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{provider.profession}</p>
                        </div>
                        <Badge variant="success">Verified</Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-foreground">{provider.rating}</span>
                        <span>({provider.jobsDone} jobs)</span>
                      </div>
                    </div>

                    <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Starting from</p>
                        <p className="font-extrabold text-primary">₦{provider.hourlyRate.toLocaleString()}/hr</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => { setSelectedProvider(provider); setBookingSuccess(false) }}
                        className="font-semibold"
                      >
                        Book Now
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Booking Details / Markup Calculator */}
            <div>
              {selectedProvider ? (
                <Card className="p-6 border-primary/20 bg-primary/5 space-y-6 animate-slide-in-right">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground text-lg">Booking Details</h3>
                  </div>

                  {bookingSuccess ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-bold">Booking Request Sent!</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{selectedProvider.name} has been notified.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Provider</p>
                        <p className="font-bold text-foreground mt-0.5">{selectedProvider.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedProvider.profession}</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> Estimated Hours Needed
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="24"
                          value={bookingHours}
                          onChange={(e) => setBookingHours(parseInt(e.target.value) || 1)}
                          className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {/* Financial breakdown */}
                      <div className="border-t border-border pt-4 space-y-2.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal ({selectedProvider.hourlyRate.toLocaleString()} x {bookingHours}h)</span>
                          <span className="font-medium text-foreground">₦{(selectedProvider.hourlyRate * bookingHours).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            Platform Booking Fee ({markupPercent}%)
                          </span>
                          <span className="font-medium text-foreground">
                            ₦{calculateMarkup(selectedProvider.hourlyRate * bookingHours).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-border/60 pt-2.5 font-bold text-base">
                          <span className="text-foreground">Total Cost</span>
                          <span className="text-primary">
                            ₦{(
                              selectedProvider.hourlyRate * bookingHours + 
                              calculateMarkup(selectedProvider.hourlyRate * bookingHours)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Button onClick={handleBook} className="w-full font-semibold rounded-xl">
                        Confirm &amp; Dispatch Request
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-6 text-center py-12 border border-dashed border-border">
                  <Wrench className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <h4 className="font-bold text-foreground">Select a Provider</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Click "Book Now" on a service provider profile to view the transaction summary and pricing breakdown.
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
