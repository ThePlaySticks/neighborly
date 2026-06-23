'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Input } from '@/components/ui/Input'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Shield, Users, CreditCard, CheckCircle, Clock, Check, X, AlertTriangle, Settings, Palette, Plus, HelpCircle, Laptop, Smartphone, HardDrive, ShieldCheck } from 'lucide-react'

interface Resident {
  id: string
  full_name: string
  role: string
  kyc_status?: string
  kyc_document_type?: string
  kyc_document_url?: string
  kyc_rejection_reason?: string
}

interface Estate {
  id: string
  name: string
  subdomain: string
  subscription_status: string
  subscription_expires_at: string
  subscription_plan: string
  yearly_fee: number | null
  markup_percent: number | null
  addons?: string[]
  promotional_discount?: number
}

interface Branding {
  primary_color: string
  secondary_color: string
  welcome_message: string
}

export default function EstateAdminPortal({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [estate, setEstate] = useState<Estate | null>(null)
  const [residents, setResidents] = useState<Resident[]>([])
  const [branding, setBranding] = useState<Branding>({
    primary_color: '#10b981',
    secondary_color: '#f59e0b',
    welcome_message: 'Welcome to our community portal'
  })

  const [activeTab, setActiveTab] = useState<'residents' | 'customization'>('residents')
  const [yearlyFee, setYearlyFee] = useState<number>(150000)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [savingBranding, setSavingBranding] = useState(false)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [brandingMsg, setBrandingMsg] = useState('')

  // KYC Verification states
  const [zoomedImgUrl, setZoomedImgUrl] = useState<string | null>(null)
  const [rejectingResidentId, setRejectingResidentId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

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
            .select('id, full_name, role, kyc_status, kyc_document_type, kyc_document_url, kyc_rejection_reason')
            .eq('estate_id', estateData.id)

          if (residentsData) {
            setResidents(residentsData)
          }

          // Fetch branding details
          const { data: brandingData } = await supabase
            .from('tenant_branding')
            .select('*')
            .eq('id', estateData.id)
            .single()

          if (brandingData) {
            setBranding({
              primary_color: brandingData.primary_color,
              secondary_color: brandingData.secondary_color,
              welcome_message: brandingData.welcome_message || ''
            })
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

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estate) return
    setSavingBranding(true)
    setBrandingMsg('')
    try {
      const { error } = await supabase
        .from('tenant_branding')
        .upsert({
          id: estate.id,
          primary_color: branding.primary_color,
          secondary_color: branding.secondary_color,
          welcome_message: branding.welcome_message,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      setBrandingMsg('Branding customization saved successfully!')
      // Refresh page client side to show updated CSS variables
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      console.error('Failed to save branding:', err)
    } finally {
      setSavingBranding(false)
    }
  }

  const handleApproveResident = async (residentId: string) => {
    setActioningId(residentId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'approved',
          role: 'resident',
          kyc_rejection_reason: null
        })
        .eq('id', residentId)
      
      if (error) throw error

      setResidents(residents.map(r => r.id === residentId ? { ...r, role: 'resident', kyc_status: 'approved', kyc_rejection_reason: undefined } : r))
    } catch (err) {
      console.error('Failed to approve resident:', err)
    } finally {
      setActioningId(null)
    }
  }

  const handleRejectResident = async (residentId: string, reason: string) => {
    setActioningId(residentId)
    try {
      if (!reason) throw new Error('Please provide a reason for rejection')
      const { error } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'rejected',
          kyc_rejection_reason: reason
        })
        .eq('id', residentId)

      if (error) throw error

      setResidents(residents.map(r => r.id === residentId ? { ...r, kyc_status: 'rejected', kyc_rejection_reason: reason } : r))
      setRejectingResidentId(null)
      setRejectionReason('')
    } catch (err: any) {
      console.error('Failed to reject resident:', err)
      alert(err.message || 'Failed to reject resident')
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

  const pendingResidents = residents.filter(r => r.kyc_status === 'pending' || r.kyc_status === 'rejected')
  const activeResidents = residents.filter(r => r.kyc_status === 'approved' || r.role === 'estate_admin')

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
      {/* Animated Abstract Background blobs */}
      <div className="absolute top-0 left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/8 blur-[120px] pointer-events-none animate-blob-1" />
      <div className="absolute bottom-0 right-[-10%] w-[45vw] h-[45vw] rounded-full bg-secondary/6 blur-[100px] pointer-events-none animate-blob-2" />

      <Navbar />

      <main className="flex-1 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/45 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-sm glass">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary animate-pulse" />
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
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

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-border pb-px">
            <button
              onClick={() => setActiveTab('residents')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all btn-interactive rounded-t-lg ${
                activeTab === 'residents' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Resident Control
            </button>
            <button
              onClick={() => setActiveTab('customization')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all btn-interactive rounded-t-lg ${
                activeTab === 'customization' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Estate CMS &amp; Branding
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Billing Column */}
            <div className="space-y-6">
              <Card className="p-6 glass-card border border-border/60 shadow-lg">
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
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Plan Tier</span>
                    <Badge variant="default" className="capitalize font-bold text-xs">
                      {estate.subscription_plan || 'Starter'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Expires On</span>
                    <span className="text-xs font-bold text-foreground bg-muted px-2 py-1 rounded">
                      {new Date(estate.subscription_expires_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Plan Features Quick Summary */}
                  <div className="bg-muted/40 p-3 rounded-xl border border-border/50 space-y-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Active Plan Features</p>
                    <ul className="space-y-1.5 text-xs text-foreground">
                      {(!estate.subscription_plan || estate.subscription_plan.toLowerCase() === 'starter') && (
                        <>
                          <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Up to 300 residents</li>
                          <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Up to 5 admins</li>
                          <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Local service directory</li>
                        </>
                      )}
                      {(estate.subscription_plan?.toLowerCase() === 'professional') && (
                        <>
                          <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Up to 1,500 residents</li>
                          <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Up to 20 admins</li>
                          <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Visitor &amp; Guest management</li>
                          <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Discussion chat groups</li>
                        </>
                      )}
                      {(estate.subscription_plan?.toLowerCase() === 'enterprise') && (
                        <>
                          <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Unlimited residents &amp; staff</li>
                          <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Custom Domain &amp; White-label</li>
                          <li className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Advanced workflows &amp; APIs</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Active Add-ons List */}
                  {Array.isArray(estate.addons) && estate.addons.length > 0 && (
                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 space-y-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Active Optional Paid Upgrades</p>
                      <div className="space-y-1">
                        {estate.addons.map(addonId => {
                          const ADDONS_NAMES: Record<string, string> = {
                            extra_storage: 'Additional Storage (10GB)',
                            sms_notifications: 'SMS Notifications Block',
                            priority_support: 'Premium 24/7 Support',
                            onboarding_training: 'Dedicated Onboarding',
                            custom_domain: 'Custom Domain Mapping'
                          }
                          return (
                            <div key={addonId} className="flex justify-between items-center text-xs text-foreground font-semibold">
                              <span className="flex items-center gap-1"><Plus className="h-3 w-3 text-primary" /> {ADDONS_NAMES[addonId] || addonId}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pricing breakdown */}
                  <div className="border-t border-border/80 pt-4 space-y-1.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Price Calculation</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Base Plan Fee:</span>
                      <span className="font-semibold text-foreground">₦{Number(estate.yearly_fee ? estate.yearly_fee : (PLAN_FEES[estate.subscription_plan?.toLowerCase() || 'starter'] || yearlyFee)).toLocaleString()}</span>
                    </div>
                    {Array.isArray(estate.addons) && estate.addons.length > 0 && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Paid Add-ons:</span>
                        <span className="font-semibold text-foreground">
                          + ₦{estate.addons.reduce((sum, addId) => {
                            const ADDONS_PRICES: Record<string, number> = { extra_storage: 20000, sms_notifications: 15000, priority_support: 50000, onboarding_training: 35000, custom_domain: 25000 }
                            return sum + (ADDONS_PRICES[addId] || 0)
                          }, 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {Number(estate.promotional_discount || 0) > 0 && (
                      <div className="flex justify-between text-xs text-emerald-600 font-bold">
                        <span>Promo Rate Discount:</span>
                        <span>- ₦{Number(estate.promotional_discount).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-border/80 pt-2 flex items-baseline justify-between">
                      <span className="text-xs font-extrabold text-foreground">Final Annual License:</span>
                      <span className="text-xl font-black text-primary">
                        ₦{(() => {
                          const base = Number(estate.yearly_fee ? estate.yearly_fee : (PLAN_FEES[estate.subscription_plan?.toLowerCase() || 'starter'] || yearlyFee))
                          const addonsSum = Array.isArray(estate.addons) ? estate.addons.reduce((sum, addId) => {
                            const ADDONS_PRICES: Record<string, number> = { extra_storage: 20000, sms_notifications: 15000, priority_support: 50000, onboarding_training: 35000, custom_domain: 25000 }
                            return sum + (ADDONS_PRICES[addId] || 0)
                          }, 0) : 0
                          const disc = Number(estate.promotional_discount || 0)
                          return Math.max(0, base + addonsSum - disc).toLocaleString()
                        })()}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePaySubscription}
                    disabled={paying || estate.subscription_status === 'active'}
                    className="w-full font-semibold rounded-xl mt-2 btn-interactive"
                  >
                    {paying ? 'Processing...' : estate.subscription_status === 'active' ? 'Subscription Active' : 'Renew Subscription'}
                  </Button>
                </div>
              </Card>

              {/* Need Help Card */}
              <Card className="p-5 glass-card border border-border/50 bg-primary/5 text-xs text-muted-foreground space-y-2">
                <p className="font-bold text-foreground flex items-center gap-1 text-sm"><HelpCircle className="h-4 w-4 text-primary" /> Need to Upgrade or Add-on?</p>
                <p className="leading-relaxed">Add-ons like SMS alerts, custom domains, or plan upgrades are configured via the Super Admin portal. Contact support to request additional features.</p>
              </Card>
            </div>

            {/* Main Area */}
            <div className="lg:col-span-2 space-y-6">
              
              {activeTab === 'residents' && (
                <>
                  {/* Pending KYC Submissions */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" />
                        <h3 className="font-bold text-foreground text-lg">KYC Resident Submissions</h3>
                      </div>
                      <Badge variant="warning">{pendingResidents.length} Pending/Rejected</Badge>
                    </div>

                    {pendingResidents.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-4">No residents are waiting for verification.</p>
                    ) : (
                      <div className="divide-y divide-border/60">
                        {pendingResidents.map(resident => (
                          <div key={resident.id} className="py-4 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {resident.kyc_document_url ? (
                                  <img
                                    src={resident.kyc_document_url}
                                    alt="KYC Credential"
                                    onClick={() => setZoomedImgUrl(resident.kyc_document_url || null)}
                                    className="h-10 w-16 object-cover rounded-lg border border-border cursor-zoom-in hover:brightness-90 transition-all shrink-0"
                                  />
                                ) : (
                                  <div className="h-10 w-16 bg-muted rounded-lg flex items-center justify-center border border-border text-[10px] text-muted-foreground italic shrink-0">
                                    No ID
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-foreground text-sm">{resident.full_name}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 capitalize mt-0.5">
                                    Document: <strong>{resident.kyc_document_type || 'unspecified'}</strong>
                                    <span>•</span>
                                    Status: 
                                    <span className={resident.kyc_status === 'rejected' ? 'text-red-500 font-bold' : 'text-amber-500 font-bold'}>
                                      {resident.kyc_status}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              {rejectingResidentId !== resident.id && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveResident(resident.id)}
                                    disabled={actioningId === resident.id}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1 flex items-center gap-1"
                                  >
                                    <Check className="h-4 w-4" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setRejectingResidentId(resident.id)}
                                    disabled={actioningId === resident.id}
                                    className="text-red-500 hover:bg-red-500 hover:text-white border-red-500/30 rounded-lg px-3 py-1 flex items-center gap-1"
                                  >
                                    <X className="h-4 w-4" /> Reject
                                  </Button>
                                </div>
                              )}
                            </div>

                            {rejectingResidentId === resident.id && (
                              <div className="bg-muted/30 p-3 rounded-xl border border-border space-y-2 animate-fade-in max-w-md">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                  Rejection Reason
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. ID details do not match profile name"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="flex-1 rounded-xl border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleRejectResident(resident.id, rejectionReason)}
                                    disabled={actioningId === resident.id}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                                  >
                                    Submit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => { setRejectingResidentId(null); setRejectionReason(''); }}
                                    className="rounded-lg text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
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
                            <div className="flex items-center gap-2">
                              {resident.role === 'estate_admin' ? (
                                <Badge variant="success">Estate Admin</Badge>
                              ) : (
                                <Badge variant="default">Verified Resident</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </>
              )}

              {activeTab === 'customization' && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                    <Palette className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground text-lg">Branding &amp; Customization</h3>
                  </div>

                  <form onSubmit={handleSaveBranding} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Brand Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={branding.primary_color}
                            onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                            className="h-10 w-12 rounded-lg border border-border bg-card cursor-pointer"
                          />
                          <input
                            type="text"
                            value={branding.primary_color}
                            onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                            className="flex-1 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Secondary Brand Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={branding.secondary_color}
                            onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                            className="h-10 w-12 rounded-lg border border-border bg-card cursor-pointer"
                          />
                          <input
                            type="text"
                            value={branding.secondary_color}
                            onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                            className="flex-1 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Portal Welcome Message</label>
                      <textarea
                        rows={3}
                        value={branding.welcome_message}
                        onChange={(e) => setBranding({ ...branding, welcome_message: e.target.value })}
                        className="w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Welcome residents to our gated community portal..."
                      />
                    </div>

                    {brandingMsg && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-1.5 animate-fade-in">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <span>{brandingMsg}</span>
                      </div>
                    )}

                    <Button type="submit" disabled={savingBranding} className="w-full font-semibold rounded-xl">
                      {savingBranding ? 'Saving...' : 'Save Branding Changes'}
                    </Button>
                  </form>
                </Card>
              )}

            </div>

          </div>

        </div>
      </main>

      {/* Zoom Modal for KYC Documents */}
      {zoomedImgUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setZoomedImgUrl(null)}
        >
          <div 
            className="relative max-w-3xl w-full max-h-[90vh] bg-card rounded-2xl p-2 border border-border shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              className="absolute right-4 top-4 z-10 bg-background/80 hover:bg-background rounded-full p-2 h-9 w-9"
              onClick={() => setZoomedImgUrl(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <img
                src={zoomedImgUrl}
                alt="Enlarged KYC Credential"
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
