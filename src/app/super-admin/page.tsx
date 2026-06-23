'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  Shield, Settings, Users, DollarSign, Percent, CheckCircle, AlertTriangle,
  Building2, TrendingUp, Globe, Eye, Ban, RefreshCw, Search, BarChart3
} from 'lucide-react'

interface Estate {
  id: string
  name: string
  subdomain: string
  subscription_status: string
  subscription_expires_at: string
  yearly_fee: number | null
  markup_percent: number | null
  created_at: string
}

interface SystemSettings {
  yearly_subscription_fee: number
  markup_percent: number
}

export default function SuperAdminDashboard() {
  const supabase = createClient()
  const [estates, setEstates] = useState<Estate[]>([])
  const [totalResidents, setTotalResidents] = useState(0)
  const [settings, setSettings] = useState<SystemSettings>({
    yearly_subscription_fee: 150000.00,
    markup_percent: 1.5
  })
  const [loading, setLoading] = useState(true)
  const [updatingSettings, setUpdatingSettings] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'estates' | 'settings'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [suspendingId, setSuspendingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Settings
        const { data: settingsData } = await supabase
          .from('super_admin_settings')
          .select('yearly_subscription_fee, markup_percent')
          .eq('id', 'config')
          .single()

        if (settingsData) {
          setSettings({
            yearly_subscription_fee: Number(settingsData.yearly_subscription_fee),
            markup_percent: Number(settingsData.markup_percent)
          })
        }

        // Fetch Estates
        const { data: estatesData } = await supabase
          .from('estates')
          .select('*')
          .order('created_at', { ascending: false })

        if (estatesData) {
          setEstates(estatesData)
        }

        // Count total residents across all estates
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })

        setTotalResidents(count || 0)
      } catch (err) {
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingSettings(true)
    setSuccessMsg('')
    try {
      const { error } = await supabase
        .from('super_admin_settings')
        .upsert({
          id: 'config',
          yearly_subscription_fee: settings.yearly_subscription_fee,
          markup_percent: settings.markup_percent,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      setSuccessMsg('Settings updated successfully!')
    } catch (err) {
      console.error('Failed to update settings:', err)
    } finally {
      setUpdatingSettings(false)
    }
  }

  const handleToggleSuspend = async (estate: Estate) => {
    setSuspendingId(estate.id)
    try {
      const newStatus = estate.subscription_status === 'active' ? 'suspended' : 'active'
      const { error } = await supabase
        .from('estates')
        .update({ subscription_status: newStatus })
        .eq('id', estate.id)

      if (error) throw error
      setEstates(estates.map(e =>
        e.id === estate.id ? { ...e, subscription_status: newStatus } : e
      ))
    } catch (err) {
      console.error('Failed to toggle suspension:', err)
    } finally {
      setSuspendingId(null)
    }
  }

  // Computed stats
  const activeEstates = estates.filter(e => e.subscription_status === 'active')
  const suspendedEstates = estates.filter(e => e.subscription_status !== 'active')
  const projectedRevenue = activeEstates.length * settings.yearly_subscription_fee
  const expiringThisMonth = estates.filter(e => {
    const expiry = new Date(e.subscription_expires_at)
    const now = new Date()
    return expiry.getMonth() === now.getMonth() && expiry.getFullYear() === now.getFullYear()
  })

  const filteredEstates = estates.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading Super Admin Panel...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Super Admin Panel
                </h1>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Configure global SaaS limits, pricing models, and monitor estate tenant affairs.
              </p>
            </div>
            <Badge variant="success" className="px-3 py-1 font-semibold text-xs rounded-full">
              System Admin
            </Badge>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 border-b border-border pb-px overflow-x-auto scrollbar-none whitespace-nowrap">
            {[
              { key: 'overview', label: 'Analytics Overview', icon: BarChart3 },
              { key: 'estates', label: 'Estate Tenants', icon: Building2 },
              { key: 'settings', label: 'SaaS Settings', icon: Settings },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ========== OVERVIEW TAB ========== */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Estates</p>
                      <p className="text-3xl font-black text-foreground mt-0.5">{estates.length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Active Subscriptions</p>
                      <p className="text-3xl font-black text-emerald-600 mt-0.5">{activeEstates.length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Residents</p>
                      <p className="text-3xl font-black text-foreground mt-0.5">{totalResidents}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Projected Revenue</p>
                      <p className="text-3xl font-black text-foreground mt-0.5">₦{projectedRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Revenue Breakdown + Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground text-lg">Revenue Breakdown</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Base subscription fee</span>
                      <span className="font-bold text-foreground">₦{settings.yearly_subscription_fee.toLocaleString()}/yr</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active subscribers</span>
                      <span className="font-bold text-foreground">{activeEstates.length} estates</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Transaction markup</span>
                      <span className="font-bold text-foreground">{settings.markup_percent}%</span>
                    </div>
                    <div className="border-t border-border pt-4 flex justify-between items-center">
                      <span className="font-bold text-foreground">Subscription revenue (annual)</span>
                      <span className="font-extrabold text-primary text-xl">₦{projectedRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h3 className="font-bold text-foreground text-lg">Alerts &amp; Attention</h3>
                  </div>
                  <div className="space-y-4">
                    {suspendedEstates.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-red-500/8 border border-red-500/15 text-sm flex items-start gap-3">
                        <Ban className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-foreground">{suspendedEstates.length} Suspended Estate{suspendedEstates.length > 1 ? 's' : ''}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {suspendedEstates.map(e => e.name).join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                    {expiringThisMonth.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/15 text-sm flex items-start gap-3">
                        <RefreshCw className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-foreground">{expiringThisMonth.length} Subscription{expiringThisMonth.length > 1 ? 's' : ''} Expiring This Month</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {expiringThisMonth.map(e => e.name).join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                    {suspendedEstates.length === 0 && expiringThisMonth.length === 0 && (
                      <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/15 text-sm flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                        <p className="font-semibold text-foreground">All systems healthy. No critical alerts.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Recent Estates */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground text-lg">Recently Registered</h3>
                </div>
                {estates.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">No estates registered yet.</p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {estates.slice(0, 5).map(estate => (
                      <div key={estate.id} className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-4.5 w-4.5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{estate.name}</p>
                            <p className="text-xs text-muted-foreground">{estate.subdomain}.neighborly.ng</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={estate.subscription_status === 'active' ? 'success' : 'warning'} className="text-xs">
                            {estate.subscription_status}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(estate.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ========== ESTATES TAB ========== */}
          {activeTab === 'estates' && (
            <div className="space-y-6 animate-fade-in">
              {/* Search */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search estates by name or subdomain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Badge variant="default" className="text-xs shrink-0">
                  {filteredEstates.length} result{filteredEstates.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Estates Table */}
              <Card className="p-0 overflow-hidden">
                {filteredEstates.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <Building2 className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
                    <p className="text-muted-foreground text-sm">No estates match your search.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                          <th className="py-3.5 px-5">Estate Name</th>
                          <th className="py-3.5 px-5">Subdomain</th>
                          <th className="py-3.5 px-5">Status</th>
                          <th className="py-3.5 px-5">Expires</th>
                          <th className="py-3.5 px-5">Pricing</th>
                          <th className="py-3.5 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredEstates.map((estate) => (
                          <tr key={estate.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-bold text-foreground">{estate.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <a
                                href={`https://${estate.subdomain}.neighborly-zeta.vercel.app`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline font-semibold text-xs"
                              >
                                {estate.subdomain}.neighborly.ng
                              </a>
                            </td>
                            <td className="py-4 px-5">
                              <Badge variant={estate.subscription_status === 'active' ? 'success' : 'warning'}>
                                {estate.subscription_status}
                              </Badge>
                            </td>
                            <td className="py-4 px-5 text-xs text-muted-foreground">
                              {new Date(estate.subscription_expires_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-5 text-xs text-muted-foreground">
                              {estate.yearly_fee ? `₦${Number(estate.yearly_fee).toLocaleString()}` : 'Default'} / {estate.markup_percent ? `${estate.markup_percent}%` : 'Default'}
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleSuspend(estate)}
                                  disabled={suspendingId === estate.id}
                                  className={`text-xs font-semibold rounded-lg ${
                                    estate.subscription_status === 'active'
                                      ? 'text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white'
                                      : 'text-emerald-600 border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
                                  }`}
                                >
                                  {suspendingId === estate.id
                                    ? '...'
                                    : estate.subscription_status === 'active'
                                      ? 'Suspend'
                                      : 'Reactivate'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ========== SETTINGS TAB ========== */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
              <Card className="p-8">
                <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground text-xl">Global SaaS Configuration</h3>
                </div>

                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" /> Yearly Subscription Fee (NGN)
                    </label>
                    <input
                      type="number"
                      required
                      value={settings.yearly_subscription_fee}
                      onChange={(e) => setSettings({ ...settings, yearly_subscription_fee: parseFloat(e.target.value) })}
                      className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <p className="text-[10px] text-muted-foreground">This is the annual fee charged to each estate administrator for the Neighborly platform license.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5" /> Transaction Markup (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={settings.markup_percent}
                      onChange={(e) => setSettings({ ...settings, markup_percent: parseFloat(e.target.value) })}
                      className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <p className="text-[10px] text-muted-foreground">Applied on top of service provider bookings and marketplace transactions as platform revenue.</p>
                  </div>

                  {successMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-2 animate-fade-in">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span className="font-semibold">{successMsg}</span>
                    </div>
                  )}

                  <Button type="submit" disabled={updatingSettings} className="w-full font-semibold rounded-xl py-3">
                    {updatingSettings ? 'Saving...' : 'Save Global Settings'}
                  </Button>
                </form>
              </Card>

              {/* Current Config Summary */}
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h4 className="font-bold text-foreground text-sm mb-4">Current Active Configuration</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Annual License Fee</span>
                    <span className="font-bold text-foreground">₦{settings.yearly_subscription_fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Transaction Markup</span>
                    <span className="font-bold text-foreground">{settings.markup_percent}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-border pt-3">
                    <span className="text-muted-foreground">Active Estates</span>
                    <span className="font-bold text-primary">{activeEstates.length}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
