'use client'

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { User, Shield, Briefcase, ShoppingBag, Users, Star, Award, MapPin } from 'lucide-react'

interface Listing {
  id: string
  title: string
  price: number
}

interface ProfileData {
  fullName: string
  role: string
  kycStatus: string
  bio: string
  interests: string[]
  skills: string[]
  reputationPoints: number
  listings: Listing[]
  groups: string[]
}

const MOCK_PROFILE: ProfileData = {
  fullName: 'Dr. Obinna Oguejiofor',
  role: 'resident',
  kycStatus: 'approved',
  bio: 'Cardiologist practicing in Lagos. Resident of Banana Island for 5 years. Passionate about community health, green spaces, and neighborhood security watch initiatives.',
  interests: ['Gardening', 'Jogging', 'Health Talk', 'Security Watch'],
  skills: ['Medical Advice', 'First Aid Coaching', 'Public Relations'],
  reputationPoints: 480,
  listings: [
    { id: '1', title: 'Ergonomic Office Chair', price: 45000 },
    { id: '2', title: 'Home Treadmill - NordicTrack', price: 350000 }
  ],
  groups: ['Security Watch & Gate Updates', 'Fitness & Sports Club', 'Artisans & Handymen']
}

export default function ResidentProfile({ params }: { params: Promise<{ site: string }> }) {
  const { site } = use(params)
  const supabase = createClient()

  const [profile, setProfile] = useState<ProfileData>(MOCK_PROFILE)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'about' | 'marketplace' | 'groups'>('about')

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, role, kyc_status')
            .eq('id', user.id)
            .single()

          if (profileData) {
            setProfile(prev => ({
              ...prev,
              fullName: profileData.full_name || prev.fullName,
              role: profileData.role || prev.role,
              kycStatus: profileData.kyc_status || prev.kycStatus
            }))
          }
        }
      } catch (err) {
        console.error('Error fetching resident profile data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [site])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground text-xs font-semibold">Loading Profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 bg-muted/20 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Header Card */}
          <Card className="p-6 border border-border/80 shadow-sm rounded-2xl flex flex-col md:flex-row items-center gap-6 bg-card relative overflow-hidden">
            <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl border border-border/60 shrink-0">
              {profile.fullName[0]?.toUpperCase() || 'U'}
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                <h1 className="text-2xl font-black text-foreground leading-tight">{profile.fullName}</h1>
                {profile.kycStatus === 'approved' ? (
                  <Badge variant="success" className="text-[9px] font-bold">✓ Verified Resident</Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] font-bold text-amber-600 border-amber-500/20 bg-amber-500/5">⚠ Unverified</Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-1 font-semibold">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Verified Dweller • {site.toUpperCase()} Estate</span>
              </p>

              <div className="flex justify-center md:justify-start gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                  <Award className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                  <span>Reputation Points: <strong className="text-foreground">{profile.reputationPoints}</strong></span>
                </div>
              </div>
            </div>
          </Card>

          {/* Detailed information split */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Left side: Navigation / Tabs */}
            <div className="md:col-span-1 space-y-1">
              {[
                { key: 'about', label: 'About & Bio', icon: User },
                { key: 'marketplace', label: 'Marketplace Listings', icon: ShoppingBag },
                { key: 'groups', label: 'Groups Joined', icon: Users }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === tab.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Right side: Tab details */}
            <div className="md:col-span-3">
              {activeTab === 'about' && (
                <Card className="p-6 border border-border/80 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Bio</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border/40 pt-6">
                    <div className="space-y-2">
                      <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Interests</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.interests.map(interest => (
                          <Badge key={interest} variant="outline" className="text-[9px]">{interest}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Skills &amp; Contributions</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-[9px] border-primary/20 bg-primary/5 text-primary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'marketplace' && (
                <Card className="p-6 border border-border/80 shadow-sm space-y-4">
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Your Active Listings</h3>
                  <div className="space-y-3">
                    {profile.listings.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No active marketplace items listed.</p>
                    ) : (
                      profile.listings.map(item => (
                        <div key={item.id} className="p-3 bg-muted/20 border border-border/40 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-foreground">{item.title}</p>
                            <p className="font-extrabold text-primary mt-0.5">₦{item.price.toLocaleString()}</p>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}

              {activeTab === 'groups' && (
                <Card className="p-6 border border-border/80 shadow-sm space-y-4">
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Groups Joined</h3>
                  <div className="space-y-3">
                    {profile.groups.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">You have not joined any community groups yet.</p>
                    ) : (
                      profile.groups.map(group => (
                        <div key={group} className="p-3 bg-muted/20 border border-border/40 rounded-xl flex justify-between items-center text-xs">
                          <span className="font-semibold text-foreground">{group}</span>
                          <Badge variant="success" className="text-[8px]">Member</Badge>
                        </div>
                      ))
                    )}
                  </div>
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
