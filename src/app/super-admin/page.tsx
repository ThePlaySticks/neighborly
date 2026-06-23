'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Shield, Settings, Users, DollarSign, Percent, Plus, CheckCircle, AlertTriangle } from 'lucide-react'

interface Estate {
  id: string
  name: string
  subdomain: string
  subscription_status: string
  subscription_expires_at: string
  yearly_fee: number | null
  markup_percent: number | null
}

interface SystemSettings {
  yearly_subscription_fee: number
  markup_percent: number
}

export default function SuperAdminDashboard() {
  const supabase = createClient()
  const [estates, setEstates] = useState<Estate[]>([])
  const [settings, setSettings] = useState<SystemSettings>({
    yearly_subscription_fee: 150000.00,
    markup_percent: 1.5
  })
  const [loading, setLoading] = useState(true)
  const [updatingSettings, setUpdatingSettings] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Settings
        const { data: settingsData, error: settingsError } = await supabase
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
        const { data: estatesData, error: estatesError } = await supabase
          .from('estates')
          .select('*')
          .order('created_at', { ascending: false })

        if (estatesData) {
          setEstates(estatesData)
        }
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Global Settings Column */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground text-lg">SaaS Configurations</h3>
                </div>

                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Yearly Subscription Fee (NGN)
                    </label>
                    <input
                      type="number"
                      required
                      value={settings.yearly_subscription_fee}
                      onChange={(e) => setSettings({ ...settings, yearly_subscription_fee: parseFloat(e.target.value) })}
                      className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Percent className="h-3 w-3" /> Transaction Markup (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={settings.markup_percent}
                      onChange={(e) => setSettings({ ...settings, markup_percent: parseFloat(e.target.value) })}
                      className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  {successMsg && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <Button type="submit" disabled={updatingSettings} className="w-full font-semibold">
                    {updatingSettings ? 'Saving...' : 'Save Settings'}
                  </Button>
                </form>
              </Card>

              {/* Stats overview card */}
              <Card className="p-6 bg-primary/5 border-primary/20 space-y-4">
                <h4 className="font-bold text-foreground text-sm">Platform Health Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-3 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">Total Tenants</p>
                    <p className="text-2xl font-black text-foreground mt-1">{estates.length}</p>
                  </div>
                  <div className="bg-card p-3 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">Active Subscriptions</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">
                      {estates.filter(e => e.subscription_status === 'active').length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tenant Estates Monitoring Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground text-lg">Tenant Estates</h3>
                  </div>
                  <Badge variant="default" className="text-xs">
                    {estates.length} Total
                  </Badge>
                </div>

                {estates.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground text-sm">No tenant estates have been registered yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                          <th className="py-3 px-4">Estate Name</th>
                          <th className="py-3 px-4">Subdomain</th>
                          <th className="py-3 px-4">Subscription Status</th>
                          <th className="py-3 px-4">Expires</th>
                          <th className="py-3 px-4">Pricing override</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {estates.map((estate) => (
                          <tr key={estate.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-4 px-4 font-bold text-foreground">{estate.name}</td>
                            <td className="py-4 px-4 text-muted-foreground">
                              <a
                                href={`http://${estate.subdomain}.localhost:3000`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline font-semibold"
                              >
                                {estate.subdomain}
                              </a>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant={estate.subscription_status === 'active' ? 'success' : 'warning'}>
                                {estate.subscription_status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-xs text-muted-foreground">
                              {new Date(estate.subscription_expires_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4 text-xs text-muted-foreground">
                              {estate.yearly_fee ? `₦${estate.yearly_fee}` : 'System Default'} / {estate.markup_percent ? `${estate.markup_percent}%` : 'System Default'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
