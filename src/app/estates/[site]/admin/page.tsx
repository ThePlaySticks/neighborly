'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Shield, Users, CreditCard, CheckCircle, Clock, Check, X, AlertTriangle } from 'lucide-react'

interface Resident {
  id: string
  full_name: string
  role: string
}

interface Estate {
  id: string
  name: string
  subdomain: string
  subscription_status: string
  subscription_expires_at: string
  yearly_fee: number | null
  markup_percent: number | null
}

export default function EstateAdminPortal({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [estate, setEstate] = useState<Estate | null>(null)
  const [residents, setResidents] = useState<Resident[]>([])
  const [yearlyFee, setYearlyFee] = useState<number>(150000)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [actioningId, setActioningId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Estate
        const { data: estateData } = await supabase
          .from('estates')
          .select('*')
          .eq('subdomain', site)
          .single()

        if (estateData) {
          setEstate(estateData)

          // Fetch residents belonging to this estate
          const { data: residentsData } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('estate_id', estateData.id)

          if (residentsData) {
            setResidents(residentsData)
          }
        }

        // Fetch general system fee
        const { data: settingsData } = await supabase
          .from('super_admin_settings')
          .select('yearly_subscription_fee')
          .eq('id', 'config')
          .single()

        if (settingsData) {
          setYearlyFee(Number(settingsData.yearly_subscription_fee))
        }

      } catch (err) {
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [site])

  const handlePaySubscription = async () => {
    if (!estate) return
    setPaying(true)
    try {
      // Set expire date to +1 year from now
      const newExpire = new Date()
      newExpire.setFullYear(newExpire.getFullYear() + 1)

      const { error } = await supabase
        .from('estates')
        .update({
          subscription_status: 'active',
          subscription_expires_at: newExpire.toISOString()
        })
        .eq('id', estate.id)

      if (error) throw error

      setEstate({
        ...estate,
        subscription_status: 'active',
        subscription_expires_at: newExpire.toISOString()
      })
    } catch (err) {
      console.error('Failed to pay subscription:', err)
    } finally {
      setPaying(false)
    }
  }

  const handleApproveResident = async (residentId: string) => {
    setActioningId(residentId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'resident' })
        .eq('id', residentId)
      
      if (error) throw error

      setResidents(residents.map(r => r.id === residentId ? { ...r, role: 'resident' } : r))
    } catch (err) {
      console.error('Failed to approve resident:', err)
    } finally {
      setActioningId(null)
    }
  }

  const handleRejectResident = async (residentId: string) => {
    setActioningId(residentId)
    try {
      // Disassociate the resident from this estate
      const { error } = await supabase
        .from('profiles')
        .update({ estate_id: null, role: 'unverified' })
        .eq('id', residentId)

      if (error) throw error

      setResidents(residents.filter(r => r.id !== residentId))
    } catch (err) {
      console.error('Failed to reject resident:', err)
    } finally {
      setActioningId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading Estate Admin Portal...</p>
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
          <p className="text-muted-foreground text-sm">Estate configuration mismatch.</p>
        </main>
        <Footer />
      </div>
    )
  }

  const pendingResidents = residents.filter(r => r.role === 'unverified')
  const activeResidents = residents.filter(r => r.role === 'resident' || r.role === 'estate_admin')

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {estate.name} Admin Portal
                </h1>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Manage residents, configure notices, and pay your annual platform subscription.
              </p>
            </div>
            <Badge variant="success" className="px-3 py-1 font-semibold text-xs rounded-full">
              Subdomain Admin
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Billing Column */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground text-lg">Yearly Subscription</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</span>
                    <Badge variant={estate.subscription_status === 'active' ? 'success' : 'warning'}>
                      {estate.subscription_status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Expires On</span>
                    <span className="text-sm font-bold text-foreground">
                      {new Date(estate.subscription_expires_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">Annual subscription fee</p>
                    <p className="text-2xl font-black text-primary mt-1">
                      ₦{estate.yearly_fee ? estate.yearly_fee.toLocaleString() : yearlyFee.toLocaleString()}
                    </p>
                  </div>

                  <Button
                    onClick={handlePaySubscription}
                    disabled={paying || estate.subscription_status === 'active'}
                    className="w-full font-semibold rounded-xl mt-2"
                  >
                    {paying ? 'Processing...' : estate.subscription_status === 'active' ? 'Subscription Active' : 'Renew Subscription'}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Resident Management Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Pending Approvals */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <h3 className="font-bold text-foreground text-lg">Pending Resident Approvals</h3>
                  </div>
                  <Badge variant="warning">{pendingResidents.length} Pending</Badge>
                </div>

                {pendingResidents.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">No residents are waiting for approval.</p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {pendingResidents.map(resident => (
                      <div key={resident.id} className="flex items-center justify-between py-3">
                        <span className="font-semibold text-foreground">{resident.full_name}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveResident(resident.id)}
                            disabled={actioningId === resident.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectResident(resident.id)}
                            disabled={actioningId === resident.id}
                            className="text-red-500 hover:bg-red-500 hover:text-white border-red-500/30 rounded-lg px-3 py-1"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Active Residents list */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground text-lg">Verified Residents</h3>
                  </div>
                  <Badge variant="default">{activeResidents.length} Total</Badge>
                </div>

                {activeResidents.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">No verified residents in this estate.</p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {activeResidents.map(resident => (
                      <div key={resident.id} className="flex items-center justify-between py-3">
                        <span className="font-medium text-foreground">{resident.full_name}</span>
                        <Badge variant={resident.role === 'estate_admin' ? 'success' : 'default'}>
                          {resident.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
