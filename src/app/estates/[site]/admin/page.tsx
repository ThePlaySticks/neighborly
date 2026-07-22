'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Input } from '@/components/ui/Input'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  Shield, Users, CreditCard, CheckCircle, Clock, Check, X, AlertTriangle,
  Palette, Plus, HelpCircle, ShieldCheck, Home, Bell, MessageSquare
} from 'lucide-react'
import Link from 'next/link'

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

const PLAN_FEES: Record<string, number> = {
  starter: 150000,
  professional: 300000,
  enterprise: 500000
}

export default function EstateAdminPortal({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [estate, setEstate] = useState<Estate | null>(null)
  const [residents, setResidents] = useState<Resident[]>([])
  const [branding, setBranding] = useState<Branding>({
    primary_color: '#2563eb', // Default Cobalt Blue
    secondary_color: '#64748b', // Default Slate Grey
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
        const { data: estateData } = await supabase
          .from('estates')
          .select('*')
          .eq('subdomain', site)
          .single()

        if (estateData) {
          setEstate(estateData)

          const { data: residentsData } = await supabase
            .from('profiles')
            .select('id, full_name, role, kyc_status, kyc_document_type, kyc_document_url, kyc_rejection_reason')
            .eq('estate_id', estateData.id)

          if (residentsData) {
            setResidents(residentsData)
          }

          const { data: brandingData } = await supabase
            .from('tenant_branding')
            .select('*')
            .eq('id', estateData.id)
            .single()

          if (brandingData) {
            setBranding({
              primary_color: brandingData.primary_color || '#2563eb',
              secondary_color: brandingData.secondary_color || '#64748b',
              welcome_message: brandingData.welcome_message || ''
            })
          }
        }

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
      setBrandingMsg('Branding settings saved successfully!')
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
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground text-xs font-semibold">Loading Admin Dashboard...</p>
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
          <p className="text-muted-foreground text-xs">Estate configuration mismatch.</p>
        </main>
        <Footer />
      </div>
    )
  }

  const pendingResidents = residents.filter(r => r.kyc_status === 'pending' || r.kyc_status === 'rejected')
  const activeResidents = residents.filter(r => r.kyc_status === 'approved' || r.role === 'estate_admin')

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
      <Navbar />

      <main className="flex-1 py-8 relative z-10 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/80 p-6 rounded-xl shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" style={{ strokeWidth: 2 }} />
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {estate.name} Administrator Portal
                </h1>
              </div>
              <p className="text-muted-foreground text-xs mt-1">
                Verify resident files, manage tenant branding styles, and renew yearly licenses.
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1 font-bold text-[10px] rounded-full text-primary border-primary/20 bg-primary/5">
              Portal Admin
            </Badge>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-border pb-px">
            <button
              onClick={() => setActiveTab('residents')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all btn-interactive rounded-t-lg cursor-pointer ${
                activeTab === 'residents' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Resident Credentials
            </button>
            <button
              onClick={() => setActiveTab('customization')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all btn-interactive rounded-t-lg cursor-pointer ${
                activeTab === 'customization' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Branding Settings
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Billing Column */}
            <div className="space-y-6">
              <Card hoverEffect={false} className="p-6 border border-border/80 shadow-sm bg-card rounded-xl">
                <div className="flex items-center gap-2 mb-4 border-b border-border/80 pb-3">
                  <CreditCard className="h-4.5 w-4.5 text-primary" />
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Annual Dues</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={estate.subscription_status === 'active' ? 'success' : 'warning'} className="text-[10px] font-bold">
                      {estate.subscription_status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">License Tier</span>
                    <Badge variant="outline" className="capitalize font-bold text-[10px] text-primary border-primary/20 bg-primary/5">
                      {estate.subscription_plan || 'Starter'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Expiration Date</span>
                    <span className="text-[10px] font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border/40 font-mono">
                      {new Date(estate.subscription_expires_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Pricing breakdown */}
                  <div className="border-t border-border/80 pt-4 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Billing Summary</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Plan Rate:</span>
                      <span className="font-bold text-foreground">₦{Number(estate.yearly_fee || PLAN_FEES[estate.subscription_plan?.toLowerCase() || 'starter'] || yearlyFee).toLocaleString()}</span>
                    </div>
                    {Array.isArray(estate.addons) && estate.addons.length > 0 && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Paid Modules:</span>
                        <span className="font-bold text-foreground">
                          + ₦{estate.addons.reduce((sum, addId) => {
                            const ADDONS_PRICES: Record<string, number> = { extra_storage: 20000, sms_notifications: 15000, priority_support: 50000, onboarding_training: 35000, custom_domain: 25000 }
                            return sum + (ADDONS_PRICES[addId] || 0)
                          }, 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {Number(estate.promotional_discount || 0) > 0 && (
                      <div className="flex justify-between text-xs text-primary font-bold">
                        <span>Discounts:</span>
                        <span>- ₦{Number(estate.promotional_discount).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-border/80 pt-3 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-foreground">Total License Dues:</span>
                      <span className="text-lg font-black text-primary">
                        ₦{(() => {
                          const base = Number(estate.yearly_fee || PLAN_FEES[estate.subscription_plan?.toLowerCase() || 'starter'] || yearlyFee)
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
                    className="w-full font-semibold rounded-xl text-xs py-2 btn-interactive mt-2"
                  >
                    {paying ? 'Authorizing...' : estate.subscription_status === 'active' ? 'License Active' : 'Renew Subscription'}
                  </Button>
                </div>
              </Card>

              <Card hoverEffect={false} className="p-5 border border-border/85 bg-primary/5 text-xs text-muted-foreground space-y-2">
                <p className="font-bold text-foreground flex items-center gap-1 text-xs uppercase"><HelpCircle className="h-4 w-4 text-primary" /> Setup Custom Subdomains</p>
                <p className="leading-relaxed text-[10px]">To map a custom domain (e.g. lekkiestate.com) or add premium system SMS notification blocks, please submit a request to the main super admin desk.</p>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              
              {activeTab === 'residents' && (
                <>
                  {/* Pending KYC Submissions */}
                  <Card hoverEffect={false} className="p-6 border border-border/80 shadow-sm bg-card rounded-xl">
                    <div className="flex items-center justify-between mb-4 border-b border-border/80 pb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4.5 w-4.5 text-primary" />
                        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">KYC Submissions</h3>
                      </div>
                      <Badge variant="warning" className="text-[10px] font-bold">{pendingResidents.length} Pending</Badge>
                    </div>

                    {pendingResidents.length === 0 ? (
                      <p className="text-muted-foreground text-xs py-4 italic">No residents are waiting for verification approval.</p>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {pendingResidents.map(resident => (
                          <div key={resident.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {resident.kyc_document_url ? (
                                  <img
                                    src={resident.kyc_document_url}
                                    alt="KYC ID file"
                                    onClick={() => setZoomedImgUrl(resident.kyc_document_url || null)}
                                    className="h-10 w-16 object-cover rounded-lg border border-border/80 cursor-zoom-in hover:opacity-90 transition-all shrink-0"
                                  />
                                ) : (
                                  <div className="h-10 w-16 bg-muted rounded-lg flex items-center justify-center border border-border text-[9px] text-muted-foreground italic shrink-0">
                                    No File
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-foreground text-sm">{resident.full_name}</p>
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5 capitalize">
                                    Doc: <strong className="text-foreground">{resident.kyc_document_type || 'unspecified'}</strong>
                                    <span>•</span>
                                    Status: 
                                    <span className={resident.kyc_status === 'rejected' ? 'text-destructive font-bold' : 'text-primary font-bold'}>
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
                                    className="bg-primary hover:bg-primary/95 text-white rounded-lg px-3 py-1 flex items-center gap-1 text-xs btn-interactive"
                                  >
                                    <Check className="h-3.5 w-3.5" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setRejectingResidentId(resident.id)}
                                    disabled={actioningId === resident.id}
                                    className="text-destructive hover:bg-destructive hover:text-white border-destructive/20 rounded-lg px-3 py-1 flex items-center gap-1 text-xs btn-interactive"
                                  >
                                    <X className="h-3.5 w-3.5" /> Reject
                                  </Button>
                                </div>
                              )}
                            </div>

                            {rejectingResidentId === resident.id && (
                              <div className="bg-muted/60 p-3 rounded-xl border border-border max-w-md space-y-2 animate-fade-in-scale">
                                <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
                                  Provide Rejection Reason
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. ID blurry or names do not match"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="flex-1 rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
                                    required
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleRejectResident(resident.id, rejectionReason)}
                                    disabled={actioningId === resident.id}
                                    className="bg-destructive hover:bg-destructive/95 text-white rounded-lg text-xs font-semibold px-3"
                                  >
                                    Submit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => { setRejectingResidentId(null); setRejectionReason(''); }}
                                    className="rounded-lg text-xs px-3 border-border hover:bg-muted"
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

                  {/* Verified Residents list */}
                  <Card hoverEffect={false} className="p-6 border border-border/80 shadow-sm bg-card rounded-xl">
                    <div className="flex items-center justify-between mb-4 border-b border-border/80 pb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4.5 w-4.5 text-primary" />
                        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Verified Residents</h3>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/20 bg-primary/5">{activeResidents.length} Active</Badge>
                    </div>

                    {activeResidents.length === 0 ? (
                      <p className="text-muted-foreground text-xs py-4 italic">No verified residents are listed on this subdomain.</p>
                    ) : (
                      <div className="divide-y divide-border/40">
                        {activeResidents.map(resident => (
                          <div key={resident.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                            <span className="font-semibold text-foreground text-xs">{resident.full_name}</span>
                            <div className="flex items-center gap-2">
                              {resident.role === 'estate_admin' ? (
                                <Badge variant="outline" className="text-[9px] font-bold text-primary border-primary/20 bg-primary/5">Admin</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground border-border bg-muted">Resident</Badge>
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
                <Card hoverEffect={false} className="p-6 border border-border/80 shadow-sm bg-card rounded-xl">
                  <div className="flex items-center gap-2 mb-4 border-b border-border/80 pb-3">
                    <Palette className="h-4.5 w-4.5 text-primary" />
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Branding &amp; Customization</h3>
                  </div>

                  <form onSubmit={handleSaveBranding} className="space-y-5">
                    {/* Rule: Label ABOVE input, gap-2 inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Primary Brand Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={branding.primary_color}
                            onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                            className="h-10 w-12 rounded-lg border border-border bg-card cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={branding.primary_color}
                            onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                            className="flex-1 rounded-lg border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Secondary Brand Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={branding.secondary_color}
                            onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                            className="h-10 w-12 rounded-lg border border-border bg-card cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={branding.secondary_color}
                            onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                            className="flex-1 rounded-lg border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Portal Welcome Message</label>
                      <textarea
                        rows={3}
                        value={branding.welcome_message}
                        onChange={(e) => setBranding({ ...branding, welcome_message: e.target.value })}
                        className="w-full rounded-lg border border-input bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/60"
                        placeholder="Welcome residents to our gated community portal..."
                      />
                    </div>

                    {brandingMsg && (
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-1.5 animate-fade-in-scale">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <span>{brandingMsg}</span>
                      </div>
                    )}

                    <Button type="submit" disabled={savingBranding} className="w-full font-semibold rounded-xl text-xs py-2 btn-interactive">
                      {savingBranding ? 'Saving Settings...' : 'Save Branding Changes'}
                    </Button>
                  </form>
                </Card>
              )}

            </div>

          </div>

        </div>
      </main>

      {/* Zoom Modal for KYC Documents (Clean Spring Scale and Blur backdrop) */}
      {zoomedImgUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setZoomedImgUrl(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-card rounded-xl p-2 border border-border shadow-lg overflow-hidden flex flex-col animate-fade-in-scale"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              className="absolute right-4 top-4 z-10 bg-background/80 hover:bg-background rounded-full p-2 h-8 w-8"
              onClick={() => setZoomedImgUrl(null)}
            >
              <X className="h-4.5 w-4.5" />
            </Button>
            <div className="flex-1 overflow-auto flex items-center justify-center p-3">
              <img
                src={zoomedImgUrl}
                alt="KYC ID preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar (Sticky navigation, only visible on mobile < md) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl shadow-lg p-2.5 flex justify-around items-center">
        <Link href={`/`} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary">
          <Home className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Portal</span>
        </Link>
        <Link href={`/admin`} className="flex flex-col items-center gap-0.5 text-primary">
          <Shield className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold font-bold">Admin</span>
        </Link>
        <Link href={`/notices`} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary">
          <Bell className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Notices</span>
        </Link>
        <Link href={`/chat`} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary">
          <MessageSquare className="h-4 w-4" style={{ strokeWidth: 2 }} />
          <span className="text-[9px] font-bold">Chat</span>
        </Link>
      </div>

      <Footer />
    </div>
  )
}
